import { BASE_URL } from "@/constants";

export const registerUser = async (body: any) => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const res = await response.json();
    return { ...res, status: response.status };
  } catch (error) {
    console.error("Failed to register user:", error);
    throw error;
  }
};
