import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMediaItem {
  mediaId: Types.ObjectId;
  sortOrder: number;
}

export interface ICollection extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string | null;
  visibility: "PUBLIC" | "PIN";
  pinHash: string | null;
  youtubePlaylistUrl: string | null;
  coverMediaId: Types.ObjectId | null;
  mediaItems: IMediaItem[];
  createdAt: Date;
  updatedAt: Date;
}

const MediaItemSchema = new Schema<IMediaItem>(
  {
    mediaId: { type: Schema.Types.ObjectId, ref: "Media", required: true },
    sortOrder: { type: Number, required: true },
  },
  { _id: false }
);

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: null },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PIN"],
      default: "PUBLIC",
    },
    pinHash: { type: String, default: null },
    youtubePlaylistUrl: { type: String, default: null },
    coverMediaId: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },
    mediaItems: { type: [MediaItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Collection =
  mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);
