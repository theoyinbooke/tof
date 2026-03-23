"use client";

type MessageData = {
  _id: string;
  type: "text" | "file" | "link" | "video_link";
  body: string;
  isDeleted: boolean;
  isOwnMessage: boolean;
  senderName: string;
  senderAvatarUrl?: string;
  createdAt: number;
  fileUrl?: string | null;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  linkUrl?: string;
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i,
  );
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/i);
  return match ? match[1] : null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LinkPreview({ url }: { url: string }) {
  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = url;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white p-2.5 hover:bg-[#F7F7F7] transition-colors"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F0F0F0]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          fill="none"
          stroke="#737373"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7.5 10.5l3-3" />
          <path d="M10 7l2.5-2.5a2.12 2.12 0 013 3L13 10" />
          <path d="M8 11l-2.5 2.5a2.12 2.12 0 01-3-3L5 8" />
        </svg>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-xs font-medium text-[#171717]">{hostname}</p>
        <p className="truncate text-[10px] text-[#737373]">{url}</p>
      </div>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="#A3A3A3"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M3 9l6-6M5 3h4v4" />
      </svg>
    </a>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const ytId = extractYouTubeId(url);
  const vimeoId = extractVimeoId(url);

  if (ytId) {
    return (
      <div className="mt-1.5 overflow-hidden rounded-lg" style={{ maxWidth: 400 }}>
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${ytId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video"
          />
        </div>
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="mt-1.5 overflow-hidden rounded-lg" style={{ maxWidth: 400 }}>
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://player.vimeo.com/video/${vimeoId}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo video"
          />
        </div>
      </div>
    );
  }

  // Fallback to link preview if no embed
  return <LinkPreview url={url} />;
}

function FileCard({
  fileName,
  fileType,
  fileSize,
  fileUrl,
}: {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string | null;
}) {
  const extension = fileName?.split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-[#E5E5E5] bg-white p-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded bg-[#F0F0F0]">
        <span className="text-[9px] font-bold text-[#737373]">{extension}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-xs font-medium text-[#171717]">
          {fileName ?? "File"}
        </p>
        <p className="text-[10px] text-[#737373]">
          {fileType ?? "Unknown"} {fileSize ? `· ${formatFileSize(fileSize)}` : ""}
        </p>
      </div>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#F0F0F0]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 18 18"
            fill="none"
            stroke="#737373"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 3v9M5 8l4 4 4-4" />
            <path d="M3 13v2h12v-2" />
          </svg>
        </a>
      )}
    </div>
  );
}

export function MessageBubble({ message }: { message: MessageData }) {
  if (message.isDeleted) {
    return (
      <div className={`flex ${message.isOwnMessage ? "justify-end" : "justify-start"} mb-1`}>
        <div className="rounded-xl bg-[#F0F0F0] px-3 py-2">
          <p className="text-xs italic text-[#A3A3A3]">Message deleted</p>
        </div>
      </div>
    );
  }

  const isOwn = message.isOwnMessage;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-3.5 py-2 ${
            isOwn
              ? "bg-[#00D632] text-white"
              : "bg-[#F0F0F0] text-[#171717]"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
        </div>

        {/* Rich content below the bubble */}
        {message.type === "link" && message.linkUrl && (
          <LinkPreview url={message.linkUrl} />
        )}
        {message.type === "video_link" && message.linkUrl && (
          <VideoEmbed url={message.linkUrl} />
        )}
        {message.type === "file" && (
          <FileCard
            fileName={message.fileName}
            fileType={message.fileType}
            fileSize={message.fileSize}
            fileUrl={message.fileUrl}
          />
        )}

        <p
          className={`mt-0.5 text-[10px] text-[#A3A3A3] ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
