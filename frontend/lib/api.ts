import { getAccessToken, setAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// The access token expires after 15 minutes. A single in-flight refresh
// promise is shared so concurrent 401s don't each fire their own refresh.
let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      setAccessToken(data.access_token);
      return data.access_token as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
};

export const authFetch = async (path: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;
  const buildHeaders = (token: string | null) => ({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  });

  const doFetch = (token: string | null) =>
    fetch(`${API_URL}${path}`, { ...options, headers: buildHeaders(token), credentials: "include" });

  let token = getAccessToken();
  let res = await doFetch(token);

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      setAccessToken(null);
    }
  }

  return res;
};

export const resolveImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${API_URL}${path}`;
};

export const uploadImage = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const res = await authFetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error((await res.json()).error ?? "Failed to upload image");
  return (await res.json()).url as string;
};

export const getMe = async () => {
  const res = await authFetch("/api/users/me");
  if (!res.ok) throw new Error("Not authenticated");
  const result = await res.json();
  return result.data;
};

// Posts
export const getFeed = async () => {
  const res = await authFetch("/api/posts/feed");
  if (!res.ok) throw new Error("Failed to fetch feed");
  const result = await res.json();
  return result.data as PostResponse[];
};

export const getUserPosts = async (userId: string) => {
  const res = await authFetch(`/api/users/${userId}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  const result = await res.json();
  return result.data as PostResponse[];
};

export const createPost = async (data: {
  content: string;
  privacy: "public" | "almost_private" | "private";
  image?: string;
  allowed_users?: string[];
}) => {
  const res = await authFetch("/api/posts", { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create post");
  const result = await res.json();
  return result.data as PostResponse;
};

export const deletePost = async (postId: string) => {
  const res = await authFetch(`/api/posts/${postId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete post");
};

export const toggleLike = async (postId: string) => {
  const res = await authFetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to toggle like");
  return res.json() as Promise<{ liked: boolean }>;
};

export const getComments = async (postId: string) => {
  const res = await authFetch(`/api/posts/${postId}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  const result = await res.json();
  return result.data as CommentResponse[];
};

export const addComment = async (postId: string, content: string, image?: string) => {
  const res = await authFetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, image }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  const result = await res.json();
  return result.data as CommentResponse;
};

// Groups
export const listGroups = async () => {
  const res = await authFetch("/api/groups");
  if (!res.ok) throw new Error("Failed to fetch groups");
  const r = await res.json();
  return r.data as GroupListItem[];
};

export const createGroup = async (data: { title: string; description?: string }) => {
  const res = await authFetch("/api/groups", { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create group");
  return (await res.json()).data;
};

export const getGroup = async (groupId: string) => {
  const res = await authFetch(`/api/groups/${groupId}`);
  if (!res.ok) throw new Error("Failed to fetch group");
  return (await res.json()).data as GroupDetail;
};

export const requestJoinGroup = async (groupId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/join`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).error);
};

export const inviteToGroup = async (groupId: string, userId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/invite/${userId}`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).error);
};

export const acceptGroupInvitation = async (groupId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/invitation/accept`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to accept invitation");
};

export const declineGroupInvitation = async (groupId: string) => {
  await authFetch(`/api/groups/${groupId}/invitation/decline`, { method: "DELETE" });
};

export const getPendingRequests = async (groupId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/requests`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  return (await res.json()).data as MemberInfo[];
};

export const acceptJoinRequest = async (groupId: string, userId: string) => {
  await authFetch(`/api/groups/${groupId}/requests/${userId}/accept`, { method: "POST" });
};

export const declineJoinRequest = async (groupId: string, userId: string) => {
  await authFetch(`/api/groups/${groupId}/requests/${userId}/decline`, { method: "DELETE" });
};

export const getGroupPosts = async (groupId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/posts`);
  if (!res.ok) throw new Error("Failed to fetch group posts");
  return (await res.json()).data as GroupPostResponse[];
};

export const createGroupPost = async (groupId: string, content: string, image?: string) => {
  const res = await authFetch(`/api/groups/${groupId}/posts`, {
    method: "POST",
    body: JSON.stringify({ content, image }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return (await res.json()).data;
};

export const toggleGroupPostLike = async (groupId: string, postId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/posts/${postId}/like`, { method: "POST" });
  return res.json() as Promise<{ liked: boolean }>;
};

export const getGroupPostComments = async (groupId: string, postId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/posts/${postId}/comments`);
  return (await res.json()).data as GroupCommentResponse[];
};

export const addGroupPostComment = async (groupId: string, postId: string, content: string) => {
  await authFetch(`/api/groups/${groupId}/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

export const getGroupEvents = async (groupId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return (await res.json()).data as GroupEventDetail[];
};

export const createGroupEvent = async (groupId: string, data: { title: string; description?: string; event_time: string }) => {
  const res = await authFetch(`/api/groups/${groupId}/events`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return (await res.json()).data;
};

export const respondToEvent = async (groupId: string, eventId: string, response: "going" | "not_going") => {
  await authFetch(`/api/groups/${groupId}/events/${eventId}/respond`, {
    method: "POST",
    body: JSON.stringify({ response }),
  });
};

// Messages
export const getConversations = async () => {
  const res = await authFetch("/api/messages/conversations");
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return (await res.json()).data as ConversationPreview[];
};

export const getPrivateHistory = async (userId: string) => {
  const res = await authFetch(`/api/messages/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return (await res.json()).data as PrivateMessage[];
};

export const sendPrivateMessage = async (userId: string, content: string, image?: string) => {
  const res = await authFetch(`/api/messages/${userId}`, {
    method: "POST",
    body: JSON.stringify({ content, image }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return (await res.json()).data as PrivateMessage;
};

export const getGroupMessages = async (groupId: string) => {
  const res = await authFetch(`/api/groups/${groupId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch group messages");
  return (await res.json()).data as GroupMessageResponse[];
};

export const sendGroupMessage = async (groupId: string, content: string, image?: string) => {
  const res = await authFetch(`/api/groups/${groupId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, image }),
  });
  if (!res.ok) throw new Error("Failed to send group message");
  return (await res.json()).data as GroupMessageResponse;
};

export type ConversationPreview = {
  other_user_id: string;
  other_name: string;
  other_handle: string;
  other_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread: number;
};

export type PrivateMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image?: string;
  created_at: string;
};

export type GroupMessageResponse = {
  id: string;
  group_id: string;
  content: string;
  image?: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
};

// Notifications
export type AppNotification = {
  id: string;
  user_id: string;
  type: "follow_request" | "group_invitation" | "group_join_request" | "group_event";
  actor_id?: string;
  reference_id?: string;
  content: string;
  read: boolean;
  created_at: string;
};

export const getNotifications = async () => {
  const res = await authFetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const body = await res.json();
  return { data: (body.data ?? []) as AppNotification[], unread_count: (body.unread_count ?? 0) as number };
};

export const markNotificationRead = async (id: string) => {
  await authFetch(`/api/notifications/${id}/read`, { method: "POST" });
};

export const markAllNotificationsRead = async () => {
  await authFetch("/api/notifications/read-all", { method: "POST" });
};

export const getUnreadCount = async () => {
  const res = await authFetch("/api/notifications/count");
  if (!res.ok) return 0;
  return ((await res.json()).count ?? 0) as number;
};

export const getAllUsers = async () => {
  const res = await authFetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return (await res.json()).data as import("./api").AuthUserBasic[];
};

// Follow
export type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  nickname?: string;
  avatar?: string;
  banner?: string;
  about_me?: string;
  birthday: string;
  is_private: boolean;
  created_at: string;
};

export const getUserById = async (userId: string) => {
  const res = await authFetch(`/api/users/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return (await res.json()).data as UserProfile;
};

export type FollowStatus = "self" | "none" | "pending" | "accepted";

export const getFollowStatus = async (userId: string) => {
  const res = await authFetch(`/api/users/${userId}/follow-status`);
  if (!res.ok) throw new Error("Failed to fetch follow status");
  return (await res.json()).status as FollowStatus;
};

export const followUser = async (userId: string) => {
  const res = await authFetch(`/api/users/${userId}/follow`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).error ?? "Failed to follow user");
  return (await res.json()).status as "pending" | "accepted";
};

export const unfollowUser = async (userId: string) => {
  const res = await authFetch(`/api/users/${userId}/follow`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unfollow user");
};

export const getFollowers = async (userId: string) => {
  const res = await authFetch(`/api/users/${userId}/followers`);
  if (!res.ok) throw new Error("Failed to fetch followers");
  return (await res.json()).data as AuthUserBasic[];
};

export const getFollowing = async (userId: string) => {
  const res = await authFetch(`/api/users/${userId}/following`);
  if (!res.ok) throw new Error("Failed to fetch following");
  return (await res.json()).data as AuthUserBasic[];
};

export type FollowRequestPreview = {
  follow_id: string;
  follower_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  avatar?: string;
  created_at: string;
};

export const getPendingFollowRequests = async () => {
  const res = await authFetch(`/api/users/follow/pending`);
  if (!res.ok) throw new Error("Failed to fetch pending requests");
  return (await res.json()).data as FollowRequestPreview[];
};

export const acceptFollowRequest = async (followId: string) => {
  const res = await authFetch(`/api/users/follow/${followId}/accept`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to accept follow request");
};

export const rejectFollowRequest = async (followId: string) => {
  const res = await authFetch(`/api/users/follow/${followId}/reject`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to reject follow request");
};

export const updateProfile = async (data: Partial<{
  first_name: string;
  last_name: string;
  nickname: string;
  birthday: string;
  avatar: string;
  banner: string;
  about_me: string;
  is_private: boolean;
}>) => {
  const res = await authFetch(`/api/users/me`, { method: "PUT", body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to update profile");
  return (await res.json()).data as UserProfile;
};

// Group types
export type GroupListItem = {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  member_count: number;
  my_status: "invited" | "requested" | "accepted" | null;
};

export type MemberInfo = {
  user_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  avatar?: string;
  status: string;
  is_creator: boolean;
};

export type GroupDetail = {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  member_count: number;
  my_status: "invited" | "requested" | "accepted" | null;
  members: MemberInfo[];
};

export type GroupPostResponse = {
  id: string;
  group_id: string;
  content: string;
  image?: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
  likes_count: number;
  comments_count: number;
  liked: boolean;
};

export type GroupCommentResponse = {
  id: string;
  post_id: string;
  content: string;
  image?: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
};

export type GroupEventDetail = {
  id: string;
  group_id: string;
  creator_id: string;
  title: string;
  description?: string;
  event_time: string;
  created_at: string;
  going: number;
  not_going: number;
  my_response: "going" | "not_going" | null;
};

export type AuthUserBasic = {
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  avatar?: string;
  email: string;
};

// Types
export type PostResponse = {
  id: string;
  content: string;
  image?: string;
  privacy: "public" | "almost_private" | "private";
  created_at: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
  likes_count: number;
  comments_count: number;
  liked: boolean;
};

export type CommentResponse = {
  id: string;
  post_id: string;
  content: string;
  image?: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
};

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

export const logoutUser = async () => {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
};
