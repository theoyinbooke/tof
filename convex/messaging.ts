import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser } from "./authHelpers";
import { getAccessibleUserIds, canMessageUser } from "./messagingAccess";
import { createNotification } from "./notifications";

// ─── Queries ───

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const participations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    const conversations = [];

    for (const p of participations) {
      const conversation = await ctx.db.get(p.conversationId);
      if (!conversation) continue;

      // Get other participant(s)
      const allParticipants = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversationId", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .take(20);

      const otherParticipant = allParticipants.find(
        (op) => op.userId !== user._id,
      );
      let otherUser = null;
      if (otherParticipant) {
        otherUser = await ctx.db.get(otherParticipant.userId);
      }

      // Count unread messages
      const recentMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId_and_createdAt", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .order("desc")
        .take(50);

      const unreadCount = recentMessages.filter(
        (m) => !m.isDeleted && m.createdAt > p.lastReadAt && m.senderId !== user._id,
      ).length;

      conversations.push({
        _id: conversation._id,
        type: conversation.type,
        name: conversation.name,
        lastMessagePreview: conversation.lastMessagePreview,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
        otherUser: otherUser
          ? {
              _id: otherUser._id,
              name: otherUser.name,
              email: otherUser.email,
              avatarUrl: otherUser.avatarUrl,
              role: otherUser.role,
            }
          : null,
      });
    }

    // Sort by lastMessageAt descending
    conversations.sort(
      (a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0),
    );

    return conversations;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Verify participant
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId_and_conversationId", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId),
      )
      .take(1);

    if (participation.length === 0) {
      throw new Error("You are not a participant in this conversation.");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_and_createdAt", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(100);

    // Enrich with sender info and file URLs
    const enriched = [];
    for (const msg of messages) {
      if (msg.isDeleted) {
        enriched.push({
          ...msg,
          senderName: "",
          senderAvatarUrl: undefined as string | undefined,
          fileUrl: null as string | null,
          isOwnMessage: msg.senderId === user._id,
        });
        continue;
      }

      const sender = await ctx.db.get(msg.senderId);
      let fileUrl: string | null = null;
      if (msg.fileStorageId) {
        fileUrl = await ctx.storage.getUrl(msg.fileStorageId);
      }

      enriched.push({
        ...msg,
        senderName: sender?.name ?? "Unknown",
        senderAvatarUrl: sender?.avatarUrl,
        fileUrl,
        isOwnMessage: msg.senderId === user._id,
      });
    }

    // Return in chronological order (oldest first)
    return enriched.reverse();
  },
});

export const getAccessibleContacts = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const accessibleIds = await getAccessibleUserIds(ctx, user);

    const contacts = [];
    for (const id of accessibleIds) {
      const u = await ctx.db.get(id);
      if (u && u.isActive) {
        contacts.push({
          _id: u._id,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: u.role,
        });
      }
    }

    // Sort alphabetically by name
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    return contacts;
  },
});

export const getTotalUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const participations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    let total = 0;
    for (const p of participations) {
      const recentMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId_and_createdAt", (q) =>
          q.eq("conversationId", p.conversationId),
        )
        .order("desc")
        .take(50);

      total += recentMessages.filter(
        (m) => !m.isDeleted && m.createdAt > p.lastReadAt && m.senderId !== user._id,
      ).length;
    }

    return total;
  },
});

// ─── Mutations ───

export const createOrGetDirectConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Verify access
    const allowed = await canMessageUser(ctx, user, args.otherUserId);
    if (!allowed) {
      throw new Error("You are not allowed to message this user.");
    }

    // Check if target user exists and is active
    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser || !otherUser.isActive) {
      throw new Error("User not found or is inactive.");
    }

    // Check for existing direct conversation
    const myParticipations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    for (const p of myParticipations) {
      const conversation = await ctx.db.get(p.conversationId);
      if (!conversation || conversation.type !== "direct") continue;

      const otherParticipation = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_userId_and_conversationId", (q) =>
          q.eq("userId", args.otherUserId).eq("conversationId", p.conversationId),
        )
        .take(1);

      if (otherParticipation.length > 0) {
        return p.conversationId;
      }
    }

    // Create new conversation
    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // Add both participants
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: user._id,
      lastReadAt: now,
      joinedAt: now,
    });
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: args.otherUserId,
      lastReadAt: now,
      joinedAt: now,
    });

    return conversationId;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.union(
      v.literal("text"),
      v.literal("file"),
      v.literal("link"),
      v.literal("video_link"),
    ),
    body: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    linkUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Verify participant
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId_and_conversationId", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId),
      )
      .take(1);

    if (participation.length === 0) {
      throw new Error("You are not a participant in this conversation.");
    }

    const now = Date.now();

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      type: args.type,
      body: args.body,
      fileStorageId: args.fileStorageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      linkUrl: args.linkUrl,
      isDeleted: false,
      createdAt: now,
    });

    // Update conversation denormalized fields
    const preview =
      args.type === "file"
        ? `📎 ${args.fileName ?? "File"}`
        : args.body.length > 80
          ? args.body.slice(0, 80) + "…"
          : args.body;

    await ctx.db.patch(args.conversationId, {
      lastMessagePreview: preview,
      lastMessageAt: now,
      updatedAt: now,
    });

    // Update sender's lastReadAt
    await ctx.db.patch(participation[0]._id, {
      lastReadAt: now,
    });

    // Notify other participants
    const allParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .take(20);

    for (const p of allParticipants) {
      if (p.userId === user._id) continue;

      await createNotification(ctx, {
        userId: p.userId,
        type: "new_message",
        title: `New message from ${user.name}`,
        body: preview,
        eventKey: `new_message:${args.conversationId}:${messageId}`,
        linkUrl: `/messages?c=${args.conversationId}`,
      });
    }

    return messageId;
  },
});

export const markConversationRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId_and_conversationId", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId),
      )
      .take(1);

    if (participation.length === 0) {
      throw new Error("You are not a participant in this conversation.");
    }

    await ctx.db.patch(participation[0]._id, {
      lastReadAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found.");
    }

    // Only sender or admin can delete
    if (message.senderId !== user._id && user.role !== "admin") {
      throw new Error("You can only delete your own messages.");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
    });
  },
});
