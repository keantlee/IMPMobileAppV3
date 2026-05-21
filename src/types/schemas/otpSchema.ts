import * as z from 'zod';

export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'Please enter the OTP.')
    .length(6, 'The OTP must be exactly 6 digits.')
    .regex(/^\d+$/, 'OTP must only contain digits.')
});

// Infer the strict TypeScript structure automatically from the Zod Schema rules!
export type OtpFormData = z.infer<typeof otpSchema>;