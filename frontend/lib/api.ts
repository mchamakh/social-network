import { getAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAccessToken()}`,
});

export const registerUser = async (data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  nickname?: string;
  birthday?: string;
  about_me?: string;
  avatar?: string;
}) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Register failed");
  }

  return result;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};

// Posts

export const getPosts = async () => {
  const response = await fetch(`${API_URL}/api/posts`, {
    headers: authHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to fetch posts");
  return result.data;
};

export const createPost = async (data: {
  content: string;
  image_url?: string;
}) => {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to create post");
  return result.data;
};

export const deletePost = async (id: string) => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Failed to delete post");
  }
};

// Comments

export const getComments = async (postId: string) => {
  const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
    headers: authHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to fetch comments");
  return result.data;
};

export const createComment = async (postId: string, content: string) => {
  const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to create comment");
  return result.data;
};

export const deleteComment = async (postId: string, commentId: string) => {
  const response = await fetch(
    `${API_URL}/api/posts/${postId}/comments/${commentId}`,
    { method: "DELETE", headers: authHeaders() }
  );
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Failed to delete comment");
  }
};

// Reactions

export const toggleReaction = async (
  postId: string,
  reactionType: "like" | "dislike"
) => {
  const response = await fetch(`${API_URL}/api/posts/${postId}/reactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ reaction_type: reactionType }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to toggle reaction");
  return result;
};

export const removeReaction = async (postId: string) => {
  const response = await fetch(`${API_URL}/api/posts/${postId}/reactions`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Failed to remove reaction");
  }
};

export const getReactionSummary = async (postId: string) => {
  const response = await fetch(`${API_URL}/api/posts/${postId}/reactions`, {
    headers: authHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to fetch reactions");
  return result.data;
};
