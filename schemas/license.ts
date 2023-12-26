import z from 'zod'

export const licenseStatus = z.enum(['wait', 'active', 'disabled'])

export type LicenseStatus = z.infer<typeof licenseStatus>

export const licenseKey = z.string().uuid()

export type LicenseKey = z.infer<typeof licenseKey>

export const appName = z.string().min(1).max(12)

export type AppName = z.infer<typeof appName>

export const verifyCode = z.string().length(6)

export type VerifyCode = z.infer<typeof verifyCode>

export const remarks = z.string().min(0).max(200)

export type Remarks = z.infer<typeof remarks>

export const label = z.string().min(0).max(100)

export type Label = z.infer<typeof label>

export const licenseShcema = z.object({
    key: licenseKey,
    app: appName,
    verifyCode: verifyCode,
    createdAt: z.date(),
    activateAt: z.date(),
    expireAt: z.date(),
    status: licenseStatus,
    remarks: remarks,
    label: label,
})

export type License = z.infer<typeof licenseShcema>
