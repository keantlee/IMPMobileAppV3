import * as z from 'zod';

export const ItemSchema = z.object({
    // select dropdown input
    category: z
        .string(),
    // select dropdown input
    subCategory: z
        .string(),
    // float input
    quantity: z 
        .string(),
    // select dropdown input
    unitOfMeasurement: z
        .string(),
    // float input
    amount: z
        .string()
        .regex(/^\d+$/, 'OTP must only contain digits.'),
    remarks: z 
        .string()
});

// Infer the strict TypeScript structure automatically from the Zod Schema rules!
export type ItemFormData = z.infer<typeof ItemSchema>;