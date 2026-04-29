const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
