import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const mediaUpdateSchema = z.object({
  title: z.string().max(200).optional(),
});

export const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().max(1000).optional().nullable(),
  visibility: z.enum(["PUBLIC", "PIN"]),
  pin: z.string().min(4).max(8).optional().nullable(),
  youtubePlaylistUrl: z.string().url().optional().nullable().or(z.literal("")),
  coverMediaId: z.string().optional().nullable(),
});

export const pinValidationSchema = z.object({
  slug: z.string(),
  pin: z.string().min(4).max(8),
});

export const reorderSchema = z.object({
  mediaIds: z.array(z.string()),
});

export const mediaAssignSchema = z.object({
  mediaIds: z.array(z.string()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type PinValidationInput = z.infer<typeof pinValidationSchema>;
