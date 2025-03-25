import { EmailData } from "@/action/gmail/fetch-mails";
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmail extends EmailData, Document {
  user: Types.ObjectId;
}

const EmailSchema: Schema = new Schema<IEmail>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  threadId: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  sender: { type: String, required: true },
  attachments: [String],
  lastMessageId: { type: String, required: true },
  lastMessageTimestamp: { type: Date, required: true },
  senderImage: String,
});

export default mongoose.models.Email ||
  mongoose.model<IEmail>("Email", EmailSchema);
