import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
  phonenumber?: string;
  isAdmin?: boolean;
  _id?: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    name: { type: String, index: true },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    phonenumber: { type: String, index: true },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "user", // Explicitly target Better Auth's collection
  },
);

userSchema.pre(
  "save",
  function (this: mongoose.Document & IUser, next: (err?: any) => void) {
    if (this.isModified("password") && this.password) {
      this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
  },
);

const User = models?.User || model<IUser>("User", userSchema);

export default User;
