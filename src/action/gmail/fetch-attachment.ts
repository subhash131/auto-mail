"use server";
import { getServerSession } from "next-auth";
import { decodeBase64, GmailThread } from "./fetch-mails";
import { authOptions } from "@/utils/auth-options";

export async function fetchAttachment(
  threadId: string,
  filename: string
): Promise<{ filename: string; data: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const accessToken = session.accessToken;

  // Fetch the thread to find the attachment
  const threadResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!threadResponse.ok) {
    throw new Error(
      `Failed to fetch thread ${threadId}: ${threadResponse.statusText}`
    );
  }

  const threadData: GmailThread = await threadResponse.json();
  const messages = threadData.messages || [];

  // Find the attachment by filename
  for (const msg of messages) {
    if (msg.payload.parts) {
      for (const part of msg.payload.parts) {
        if (part.filename === filename && part.body.attachmentId) {
          const attachmentResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/attachments/${part.body.attachmentId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!attachmentResponse.ok) {
            throw new Error(
              `Failed to fetch attachment ${part.body.attachmentId}: ${attachmentResponse.statusText}`
            );
          }

          const attachmentData = await attachmentResponse.json();
          return {
            filename: part.filename,
            data: await decodeBase64(attachmentData.data),
          };
        }
      }
    }
  }

  return null;
}
