import { z } from 'zod';

const imageAssetSchema = z.object({
    uri: z.string().min(1, "Image URI is required"),
    fileName: z.string().min(1, "File name is required"),
    type: z.string().min(1, "File type is required"),
});

export const AttachmentSchema = z.object({
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

// Target the form's raw input state (includes null)
export type AttachmentInputData = z.input<typeof AttachmentSchema>;

// Target the validated submit payload (strictly image objects, no nulls)
export type AttachmentFormData = z.output<typeof AttachmentSchema>;