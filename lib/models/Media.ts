import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMedia extends Document {
  _id: Types.ObjectId;
  title: string | null;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  mimeType: string;
  size: number;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: { type: String, default: null },
    type: { type: String, enum: ["IMAGE", "VIDEO"], required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    durationSec: { type: Number, default: null },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    filename: { type: String, required: true },
  },
  { timestamps: true }
);

export const Media =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
