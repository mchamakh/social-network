"use client";
import { useState } from "react";
import { followUser, unfollowUser, type FollowStatus } from "@/lib/api";

export default function FollowButton({
  userId,
  status,
  onChange,
}: {
  userId: string;
  status: FollowStatus;
  onChange: (status: FollowStatus) => void;
}) {
  const [loading, setLoading] = useState(false);

  if (status === "self") return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      if (status === "none") {
        const result = await followUser(userId);
        onChange(result);
      } else {
        await unfollowUser(userId);
        onChange("none");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const label = status === "accepted" ? "Following" : status === "pending" ? "Requested" : "Follow";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        status === "none"
          ? "bg-black text-white hover:bg-zinc-800"
          : "bg-gray-100 text-black hover:bg-gray-200"
      }`}
    >
      {loading ? "..." : label}
    </button>
  );
}
