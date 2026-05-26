import * as z from 'zod';

export const loginSchema = z.object({
    category: z
        .string()
        .min(1, 'Please enter your email.')
        .email('Please enter a valid email address.')
        .trim()
        .lowercase(),
    subCategory: z
        .string()
        .min(1, 'Please enter your password.')
        .regex(/^\d+$/, 'OTP must only contain digits.'),

    // this inout
    unitOFMeasurement: z 
        .string(),
    amount: z
        .string()
        .regex(/^\d+$/, 'OTP must only contain digits.'),
    remarks: z 
        .string()
});

// Infer the strict TypeScript structure automatically from the Zod Schema rules!
export type LoginFormData = z.infer<typeof loginSchema>;