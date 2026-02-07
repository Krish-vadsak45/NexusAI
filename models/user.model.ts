import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
  phonenumber?: string;
  _id?: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    phonenumber: { type: String },
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
