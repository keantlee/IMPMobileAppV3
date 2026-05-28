import * as z from 'zod';

export const AttachmentSchema = z.object({
    // upload front-id
    frontId: z.string().min(1, 'Please upload the front ID.'),
    // upload back-id
    backId: z.string().min(1, 'Please upload the back ID.'),
    // upload beneficiary with commodity
    beneficiary: z.string().min(1, 'Please upload the beneficiary document.'),
    // upload receipt
    receipt: z.string().min(1, 'Please upload the receipt.')
});

// Infer the strict TypeScript structure automatically from the Zod Schema rules!
export type AttachmentFormData = z.infer<typeof AttachmentSchema>;