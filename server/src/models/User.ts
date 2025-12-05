//NOTE - used AI to generate these schema, and edited it to only contain the necessary information

import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string; // hashed password
  history: unknown[];
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, //note that this is technically the hash of the password
    history: { type: Array, default: [] },
  },
  { timestamps: false }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
module.exports = User;
