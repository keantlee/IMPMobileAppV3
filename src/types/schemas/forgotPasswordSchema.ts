import * as z from 'zod';

// Step 1 — request a reset code by email.
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email.')
    .email('Please enter a valid email address.')
    .trim()
    .lowercase(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Step 2 — enter the code and set a new password.
export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .min(1, 'Please enter the code.')
      .regex(/^\d{6}$/, 'The code must be 6 digits.'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
    confirm_password: z.string().min(1, 'Please re-enter your password.'),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
