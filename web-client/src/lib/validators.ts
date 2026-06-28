import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter no mínimo 6 caracteres')
  .regex(/\d/, 'Senha deve conter pelo menos 1 dígito')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial')

export const loginSchema = z.object({
  tenantSlug: z.string().min(1, 'Tenant é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
  twoFactorCode: z.string().length(6, 'Código deve ter 6 dígitos').optional().or(z.literal('')),
})

export type LoginFormValues = z.infer<typeof loginSchema>

/** Accepts standard emails and `@localhost` (seed/dev accounts). */
export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório')
  .refine(
    (value) =>
      z.string().email().safeParse(value).success || /^[^\s@]+@localhost$/i.test(value),
    { message: 'E-mail inválido' },
  )

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  tenantId: z.string().optional(),
  role: z.string().min(1, 'Role é obrigatória'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const tenantCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]{2,50}$/, 'Slug: 2-50 caracteres, minúsculas, números e hífens'),
})

export type TenantCreateFormValues = z.infer<typeof tenantCreateSchema>

export const tenantUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  isActive: z.boolean(),
})

export type TenantUpdateFormValues = z.infer<typeof tenantUpdateSchema>

export const totpCodeSchema = z.string().length(6, 'Código deve ter 6 dígitos')

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
  code: totpCodeSchema,
})

export type DisableTwoFactorFormValues = z.infer<typeof disableTwoFactorSchema>

export { passwordSchema }
