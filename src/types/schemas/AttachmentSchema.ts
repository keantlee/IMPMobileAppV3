import { z } from 'zod';

// 1. The Image object schema
const imageAssetSchema = z.object({
    uri: z.string().min(1, "Image URI is required"),
    fileName: z.string().min(1, "File name is required"),
    type: z.string().min(1, "File type is required"),
});

// 2. The main Attachment Schema
export const AttachmentSchema = z.object({
    // Removing .optional() makes the field required (no undefined allowed).
    // .nullable() allows the value to be null initially.
    beneficiary: imageAssetSchema.nullable()
        .refine((val) => val !== null, { message: "Beneficiary with Commodity photo is required" }),
    frontID: imageAssetSchema.nullable()
        .refine((val) => val !== null, { message: "Front Valid ID is required" }),
    backID: imageAssetSchema.nullable()
        .refine((val) => val !== null, { message: "Back Valid ID is required" }),
    receipt: imageAssetSchema.nullable()
        .refine((val) => val !== null, { message: "Receipt photo is required" }),
    otherDocs: z.array(imageAssetSchema),
});

export type AttachmentFormData = z.infer<typeof AttachmentSchema>;