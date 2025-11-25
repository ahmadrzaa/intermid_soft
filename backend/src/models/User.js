import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    }, // unique only
    mobile: { type: String, trim: true },
    company: { type: String, trim: true }, // company/tenant name
    role: {
      type: String,
      enum: ["Admin", "Manager", "Staff"],
      default: "Staff",
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Do NOT add another index here (avoids duplicate-index warning)
export default mongoose.models.User || mongoose.model("User", UserSchema);
