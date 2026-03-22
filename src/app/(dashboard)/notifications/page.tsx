"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

const TYPE_ICONS: Record<string, { bg: string; color: string }> = {
  session_reminder: { bg: "bg-blue-50", color: "text-blue-600" },
  evidence_overdue: { bg: "bg-red-50", color: "text-red-600" },
  evidence_overdue_admin: { bg: "bg-red-50", color: "text-red-600" },
  assessment_reminder: { bg: "bg-yellow-50", color: "text-yellow-600" },
  support_update: { bg: "bg-purple-50", color: "text-purple-600" },
};

export default function NotificationsPage() {
  const notifications = useQuery(api.notifications.getMyNotifications);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  if (notifications === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const handleMarkRead = async (id: typeof notifications[0]["_id"]) => {
    await markAsRead({ notificationId: id });
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#171717]">Notifications</h1>
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00D632] px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount !== undefined && unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-[#737373] hover:text-[#171717]"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0112 0c0 6.5 3 8 3 8H3s3-1.5 3-8z" />
              <path d="M10 21a2 2 0 004 0" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">No notifications</h2>
          <p className="mt-1 text-sm text-[#737373]">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {notifications.map((n, i) => {
            const style = TYPE_ICONS[n.type] || { bg: "bg-[#F0F0F0]", color: "text-[#525252]" };
            const content = (
              <div
                className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#F7F7F7] ${
                  i > 0 ? "border-t border-[#F0F0F0]" : ""
                } ${!n.isRead ? "bg-[#FAFFF5]" : ""}`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={style.color}>
                    <path d="M3.5 5a3.5 3.5 0 017 0c0 3.8 1.5 4.5 1.5 4.5H2S3.5 8.8 3.5 5z" />
                    <path d="M5.5 10.5a1.5 1.5 0 003 0" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${!n.isRead ? "font-medium text-[#171717]" : "text-[#262626]"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkRead(n._id);
                        }}
                        className="shrink-0 rounded px-2 py-0.5 text-[10px] text-[#737373] hover:bg-[#F0F0F0]"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[#737373]">{n.body}</p>
                  <p className="mt-1 text-[10px] text-[#D4D4D4]">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );

            if (n.linkUrl) {
              return (
                <Link key={n._id} href={n.linkUrl} onClick={() => !n.isRead && handleMarkRead(n._id)}>
                  {content}
                </Link>
              );
            }

            return <div key={n._id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
