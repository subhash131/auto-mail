"use server";
import { authOptions } from "@/utils/auth-options";
import { getServerSession } from "next-auth";

// Define types for the Gmail API response
interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  labelIds: string[];
  payload: {
    headers: { name: string; value: string }[];
    parts?: { mimeType: string; body: { data: string } }[];
  };
}

interface GmailListResponse {
  messages: { id: string; threadId: string }[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface EmailData {
  sender: string;
  subject: string;
  timestamp: string;
  content: string;
  labels: string[];
  id: string;
}

// Helper function to decode base64 URL-safe data
function decodeBase64(base64String: string): string {
  const buff = Buffer.from(base64String, "base64");
  return buff.toString("utf-8");
}

// Main function to fetch unread Primary emails
export async function fetchEmails(): Promise<EmailData[]> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const accessToken = session.accessToken;

  // Step 1: Fetch list of unread Primary emails (max 20)
  const listResponse = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&labelIds=UNREAD&q=-category:promotions -category:social -category:updates -category:forums&maxResults=20",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listResponse.ok) {
    throw new Error(`Failed to fetch email list: ${listResponse.statusText}`);
  }

  const listData: GmailListResponse = await listResponse.json();
  const messages = listData.messages || [];

  if (messages.length === 0) {
    return [];
  }

  // Step 2: Fetch details for each message
  const emailPromises = messages.map(async (message) => {
    const messageResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!messageResponse.ok) {
      throw new Error(
        `Failed to fetch message ${message.id}: ${messageResponse.statusText}`
      );
    }

    const msg: GmailMessage = await messageResponse.json();

    // Extract headers
    const id = msg.id;
    const headers = msg.payload.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "No Subject";
    const sender =
      headers.find((h) => h.name === "From")?.value || "Unknown Sender";
    const timestamp = msg.internalDate; // Unix timestamp in milliseconds

    // Convert timestamp to readable format
    const timestampReadable = new Date(parseInt(timestamp)).toISOString();

    // Get content (snippet or full body)
    let content = msg.snippet || "No content preview";
    if (msg.payload.parts) {
      const plainTextPart = msg.payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );
      if (plainTextPart && plainTextPart.body.data) {
        content = decodeBase64(plainTextPart.body.data);
      }
    }

    // Include labels
    const labels = msg.labelIds || [];

    return {
      id,
      sender,
      subject,
      timestamp: timestampReadable,
      content,
      labels,
    };
  });

  // Wait for all email details to be fetched
  const emails = await Promise.all(emailPromises);
  return emails;
}
