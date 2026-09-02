import * as z from 'zod';

const EXT_NAME_OPTIONS = ['', 'N/A', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'] as const;

const MERCHANT_TYPE_OPTIONS = [
  { label: 'Main Office', value: 'main' },
  { label: 'Branch Office', value: 'branch' },
] as const;

const nameRegex = /^[a-zA-Z\s\-.']+$/;

export const registrationSchema = z
  .object({
    first_name: z
      .string()
      .min(1, 'First name is required.')
      .regex(nameRegex, 'First name contains invalid characters.'),
    middle_name: z.string().optional().or(z.literal('')),
    last_name: z
      .string()
      .min(1, 'Last name is required.')
      .regex(nameRegex, 'Last name contains invalid characters.'),
    ext_name: z.string().optional().or(z.literal('')),
    merchant_type: z.enum(['main', 'branch'], {
      message: 'Please select a merchant type.',
    }),
    program_id: z.string().min(1, 'Intervention is required.'),
    company_name: z.string().min(1, 'Company name is required.'),
    company_address: z.string().min(1, 'Complete company address is required.'),
    reg_code: z.string().min(1, 'Region is required.'),
    prov_code: z.string().min(1, 'Province is required.'),
    mun_code: z.string().min(1, 'Municipality / City is required.'),
    brgy_code: z.string().min(1, 'Barangay is required.'),
    contact_no: z
      .string()
      .min(1, 'Contact number is required.')
      .regex(/^\d{11}$/, 'Contact number must be exactly 11 digits.'),
    email: z
      .string()
      .min(1, 'Email is required.')
      .email('Please enter a valid email address.')
      .trim()
      .lowercase(),
    // Username mirrors the email in the web flow, but we let the user set it.
    username: z
      .string()
      .min(4, 'Username must be at least 4 characters.')
      .regex(/^[a-zA-Z0-9_.@]+$/, 'Username may contain letters, numbers, dot, underscore and @.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
    confirm_password: z.string().min(1, 'Please re-enter your password.'),
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export { EXT_NAME_OPTIONS, MERCHANT_TYPE_OPTIONS };
