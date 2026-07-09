"use client";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/api";

export default function ImageUploadButton({
  onUploaded,
  children,
  className,
  disabled,
}: {
  onUploaded: (url: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } catch {
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={disabled || uploading}
      className={className}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      {uploading ? "..." : children}
    </button>
  );
}
