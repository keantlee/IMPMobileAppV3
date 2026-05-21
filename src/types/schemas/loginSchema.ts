import * as z from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email.')
    .email('Please enter a valid email address.')
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(6, 'Password must be at least 6 characters long.'),
});

// Infer the strict TypeScript structure automatically from the Zod Schema rules!
export type LoginFormData = z.infer<typeof loginSchema>;