export type AuthUser = {
  id: string
  email: string | null
  name: string | null
  tier: string
  avatar: string
  email_notification: boolean
  role: string
}
