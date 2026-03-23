"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutationWithError, ErrorToast } from "../../ui/mutation-error-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ProfilePictureUploadProps {
  profilePictureUrl: string | null;
  userAvatarUrl: string | undefined;
  userName: string;
  userId: Id<"users">;
}

export function ProfilePictureUpload({
  profilePictureUrl,
  userAvatarUrl,
  userName,
  userId,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, clearError, handleError } = useMutationWithError();

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const updateProfilePicture = useMutation(api.beneficiaries.updateProfilePicture);

  const imageUrl = profilePictureUrl || userAvatarUrl;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      handleError(new Error("Please select an image file."));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      handleError(new Error("Image must be under 5MB."));
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
      await updateProfilePicture({ userId, storageId });
    } catch (err) {
      handleError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {error && <ErrorToast message={error} onClose={clearError} />}
      <div
        className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full group"
        onClick={() => fileInputRef.current?.click()}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={userName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#E6FBF0] text-xl font-semibold text-[#00D632]">
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 14.5V17a1 1 0 001 1h14a1 1 0 001-1v-2.5" />
              <path d="M14 6l-4-4-4 4" />
              <path d="M10 2v10" />
            </svg>
          )}
        </div>

        {/* Loading overlay (always visible while uploading) */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
              e.target.value = "";
            }
          }}
        />
      </div>
    </>
  );
}
