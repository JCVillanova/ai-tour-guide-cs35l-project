import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

type UserRecord = {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  history: unknown[];
};

type SanitizedUser = Omit<UserRecord, "password">; //user info without the password

const mongoUri = process.env.ATLAS_URI || "";

let connectionPromise: Promise<typeof mongoose> | null = null;

const ensureConnection = async () => {
  if (!mongoUri) {
    throw new Error("ATLAS_URI is not set in the environment");
  }
  if (!connectionPromise) {
    mongoose.set("strictQuery", true);
    connectionPromise = mongoose.connect(mongoUri);
  }
  return connectionPromise;
};

const userSchema = new Schema<UserRecord>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    history: { type: Array, default: [] },
  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as mongoose.Model<UserRecord>) ||
  mongoose.model<UserRecord>("User", userSchema);

const sanitizeUser = (
  user: Pick<UserRecord, Exclude<keyof UserRecord, never>>
) => {
  const { password, ...rest } = user;
  return rest as SanitizedUser;
};

export const createUser = async (email: string, password: string) => {
  await ensureConnection();
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new Error("Email already exists");
  }

  const hashed = await bcrypt.hash(password, 10);
  const created = await User.create({ email, password: hashed });
  return sanitizeUser(created.toObject());
};

export const authenticateUser = async (email: string, password: string) => {
  await ensureConnection();
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Authentication failed");
  }

  return {
    message: "Authentication successful",
    user: sanitizeUser(user.toObject()),
  };
};

export const listUsers = async () => {
  await ensureConnection();
  const users = await User.find().lean();
  return users.map((u) => sanitizeUser(u as UserRecord));
};

export const deleteUser = async (userId: string) => {
  await ensureConnection();
  await User.findByIdAndDelete(userId);
  return { message: "User deleted successfully" };
};

export const setUserHistory = async (userId: string, history: unknown[]) => {
  await ensureConnection();
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.history = history;
  await user.save();
  return sanitizeUser(user.toObject());
};

export const getUserHistory = async (userId: string) => {
  await ensureConnection();
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }
  return { history: (user as UserRecord).history || [] };
};

export default {
  createUser,
  authenticateUser,
  listUsers,
  deleteUser,
  setUserHistory,
  getUserHistory,
};
