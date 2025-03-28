import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  avatar: { type: String, required: false },
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpire: { type: Date, required: false },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
