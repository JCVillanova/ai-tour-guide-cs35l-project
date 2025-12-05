//NOTE - used AI to generate these schema, I edited it to only contain the necessary fields
//and be properly updated

import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string; // hashed password
  history: TourRecord[];
}

export interface TourRecord {
  title: string;
  startingPoint: string;
  destination: string;
  geminiOutput: string;
  date: string;
}

const tourRecordSchema = new Schema<TourRecord>(
  {
    title: { type: String, required: true },
    startingPoint: { type: String, required: true },
    destination: { type: String, required: true },
    geminiOutput: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, //note that this is technically the hash of the password
    history: { type: [tourRecordSchema], default: [] },
  },
  { timestamps: false }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
module.exports = User;
