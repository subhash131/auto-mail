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
    parts?: {
      mimeType: string;
      filename?: string;
      body: { attachmentId?: string; data?: string; size: number };
    }[];
    body?: { data?: string; size: number };
  };
}

export interface GmailThread {
  id: string;
  messages: GmailMessage[];
}

interface GmailThreadsListResponse {
  threads: { id: string; snippet: string }[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

interface GmailAttachment {
  filename: string;
  messageId: string;
  attachmentId: string;
}

export interface EmailData {
  threadId: string; // Thread ID
  subject: string;
  lastMessageTimestamp: Date;
  content: string; // Plain text only
  sender: string;
  attachments: GmailAttachment[];
  lastMessageId: string;
  senderImage?: string | null;
}

// Helper function to decode base64 URL-safe data
export async function decodeBase64(base64String: string): Promise<string> {
  try {
    const buff = Buffer.from(
      base64String.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );
    return buff.toString("utf-8");
  } catch (error) {
    console.warn(`Base64 decoding failed: ${error}`);
    return "";
  }
}

// Fetch sender profile image from Google People API
async function getSenderImage(
  email: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(
        email
      )}&readMask=photos`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) {
      console.warn(`People API failed for ${email}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.people?.length > 0 && data.people[0].photos?.length > 0) {
      return data.people[0].photos[0].url || null;
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching sender image for ${email}: ${error}`);
    return null;
  }
}

// Fetch unread Primary email threads with plain text only
export async function fetchEmails(): Promise<EmailData[]> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const accessToken = session.accessToken;

  const listResponse = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/threads?labelIds=INBOX&labelIds=UNREAD&q=-category:promotions -category:social -category:updates -category:forums&maxResults=20",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listResponse.ok) {
    throw new Error(`Failed to fetch thread list: ${listResponse.statusText}`);
  }

  const listData: GmailThreadsListResponse = await listResponse.json();
  const threads = listData.threads || [];

  if (threads.length === 0) {
    return [];
  }

  const threadPromises = threads.map(async (thread) => {
    const threadResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${thread.id}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!threadResponse.ok) {
      throw new Error(
        `Failed to fetch thread ${thread.id}: ${threadResponse.statusText}`
      );
    }

    const threadData: GmailThread = await threadResponse.json();
    const messages = threadData.messages || [];

    const latestMessage = messages[messages.length - 1];
    const headers = latestMessage.payload.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "No Subject";
    const sender =
      headers.find((h) => h.name === "From")?.value || "Unknown Sender";
    const timestamp = latestMessage.internalDate;
    const timestampReadable = new Date(parseInt(timestamp));
    const lastMessageId = latestMessage.id;

    let combinedContent = "";
    const attachments: GmailAttachment[] = [];

    for (const msg of messages) {
      const msgHeaders = msg.payload.headers || [];
      const msgSender =
        msgHeaders.find((h) => h.name === "From")?.value || "Unknown Sender";
      const msgTimestamp = new Date(parseInt(msg.internalDate)).toISOString();

      let messageContent = "";
      if (msg.payload.parts) {
        const plainTextPart = msg.payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (plainTextPart && plainTextPart.body.data) {
          messageContent = await decodeBase64(plainTextPart.body.data);
        } else {
          console.warn(
            `No text/plain part found for message ${msg.id}, falling back to snippet`
          );
          messageContent = msg.snippet || "No content preview"; // Snippet is plain text
        }
      } else if (msg.payload.body && msg.payload.body.data) {
        // Check if it looks like HTML; if so, use snippet instead
        const decodedBody = await decodeBase64(msg.payload.body.data);
        if (decodedBody.includes("<") && decodedBody.includes(">")) {
          console.warn(
            `Message ${msg.id} body appears to be HTML, using snippet instead`
          );
          messageContent = msg.snippet || "No content preview";
        } else {
          messageContent = decodedBody;
        }
      } else {
        console.warn(
          `No content available for message ${msg.id}, using snippet`
        );
        messageContent = msg.snippet || "No content preview";
      }

      combinedContent +=
        (combinedContent ? "\n---\n" : "") +
        `From: ${msgSender}\nDate: ${msgTimestamp}\nContent:\n${messageContent}`;

      if (msg.payload.parts) {
        for (const part of msg.payload.parts) {
          if (part.filename && part.body.attachmentId) {
            attachments.push({
              filename: part.filename,
              messageId: msg.id,
              attachmentId: part.body.attachmentId,
            });
          }
        }
      }
    }

    attachments.reverse();

    const senderImage = await getSenderImage(sender, accessToken);

    const threadId = threadData.id;

    return {
      threadId,
      subject,
      lastMessageTimestamp: timestampReadable,
      content: combinedContent,
      sender,
      attachments,
      lastMessageId,
      senderImage,
    };
  });

  return await Promise.all(threadPromises);
}
