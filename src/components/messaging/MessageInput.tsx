"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutationWithError, ErrorToast } from "../ui/mutation-error-toast";

const URL_REGEX = /https?:\/\/[^\s]+/gi;
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i;
const VIMEO_REGEX = /vimeo\.com\/(\d+)/i;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES =
  ".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.mp3,.mp4";

export function MessageInput({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, clearError, handleError } = useMutationWithError();

  const sendMessage = useMutation(api.messaging.sendMessage);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);

  const handleSend = useCallback(async () => {
    const body = text.trim();
    if (!body) return;

    // Detect message type
    const urls = body.match(URL_REGEX);
    let type: "text" | "link" | "video_link" = "text";
    let linkUrl: string | undefined;

    if (urls && urls.length > 0) {
      const firstUrl = urls[0];
      if (YOUTUBE_REGEX.test(firstUrl) || VIMEO_REGEX.test(firstUrl)) {
        type = "video_link";
      } else {
        type = "link";
      }
      linkUrl = firstUrl;
    }

    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await sendMessage({
        conversationId,
        type,
        body,
        linkUrl,
      });
    } catch (err) {
      handleError(err);
    }
  }, [text, conversationId, sendMessage, handleError]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        handleError(new Error("File size must be under 10MB."));
        return;
      }

      setUploading(true);
      try {
        const uploadUrl = await generateUploadUrl({});
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        await sendMessage({
          conversationId,
          type: "file",
          body: file.name,
          fileStorageId: storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      } catch (err) {
        handleError(err);
      } finally {
        setUploading(false);
      }
    },
    [conversationId, sendMessage, generateUploadUrl, handleError],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-expand
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };

  return (
    <>
      {error && <ErrorToast message={error} onClose={clearError} />}
      <div className="border-t border-[#E5E5E5] bg-white px-3 py-2.5">
        <div className="flex min-w-0 items-end gap-2">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#737373] hover:bg-[#F0F0F0] disabled:opacity-50"
            aria-label="Attach file"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 9.5l-6.2 6.2a3.5 3.5 0 01-5-5L10 4.5a2.33 2.33 0 013.3 3.3L7.2 14" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
                e.target.value = "";
              }
            }}
          />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={uploading ? "Uploading file…" : "Type a message…"}
            disabled={uploading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] px-3.5 py-2 text-sm text-[#171717] outline-none placeholder:text-[#A3A3A3] focus:border-[#171717] disabled:opacity-50"
            style={{ maxHeight: 120 }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || uploading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00D632] text-white hover:bg-[#00C02D] disabled:opacity-40 transition-colors"
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 2L9 9" />
              <path d="M16 2l-5 14-3-6-6-3z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
