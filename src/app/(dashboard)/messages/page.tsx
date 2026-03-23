"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ConversationView } from "@/components/messaging/ConversationView";
import { ContactPicker } from "@/components/messaging/ContactPicker";
import { EmptyState } from "@/components/messaging/EmptyState";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("c") as Id<"conversations"> | null;

  const [activeConversationId, setActiveConversationId] =
    useState<Id<"conversations"> | null>(initialConversationId);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [mobileShowConversation, setMobileShowConversation] = useState(
    !!initialConversationId,
  );

  const conversations = useQuery(api.messaging.listConversations);
  const createOrGet = useMutation(api.messaging.createOrGetDirectConversation);

  const activeConversation = conversations?.find(
    (c) => c._id === activeConversationId,
  );

  const handleSelectConversation = useCallback(
    (id: Id<"conversations">) => {
      setActiveConversationId(id);
      setMobileShowConversation(true);
    },
    [],
  );

  const handleNewMessage = useCallback(() => {
    setShowContactPicker(true);
  }, []);

  const handleContactSelect = useCallback(
    async (userId: Id<"users">) => {
      setShowContactPicker(false);
      try {
        const conversationId = await createOrGet({ otherUserId: userId });
        setActiveConversationId(conversationId);
        setMobileShowConversation(true);
      } catch (err) {
        console.error("Failed to create conversation:", err);
      }
    },
    [createOrGet],
  );

  const handleMobileBack = useCallback(() => {
    setMobileShowConversation(false);
  }, []);

  return (
    <div className="flex h-full">
      {/* Contact picker modal */}
      {showContactPicker && (
        <ContactPicker
          onSelect={handleContactSelect}
          onClose={() => setShowContactPicker(false)}
        />
      )}

      {/* Desktop layout: side-by-side */}
      {/* Mobile layout: one panel at a time */}

      {/* Conversation list */}
      <div
        className={`w-full lg:block lg:w-80 lg:shrink-0 ${
          mobileShowConversation ? "hidden" : "block"
        }`}
      >
        <ConversationList
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewMessage={handleNewMessage}
        />
      </div>

      {/* Conversation view or empty state */}
      <div
        className={`min-w-0 flex-1 ${
          mobileShowConversation ? "block" : "hidden lg:block"
        }`}
      >
        {activeConversationId && activeConversation ? (
          <ConversationView
            conversationId={activeConversationId}
            otherUser={activeConversation.otherUser}
            onBack={handleMobileBack}
          />
        ) : (
          <EmptyState onNewMessage={handleNewMessage} />
        )}
      </div>
    </div>
  );
}
