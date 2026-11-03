

enum VoiceVariant 
    - SYSTEM
    - CUSTOM 

enum VoiceCategory 

    - AUDIOBOOK
    - CONVERSATIONAL 
    - CUSTOMER_SUPPORT
    - GENERAL 
    - NARRATIVE
    - CHARACTERS
    - MEDITATION
    - MOTIVATIONAL 
    - PODCAST 
    - ADVERTISING 
    - VOICEOVER 
    - CORPORATE 


Table Voice

    - orgId
    - name str 
    - description str  
    - category VOICE_CATEGORY default GENERAL 
    - language str default en-US 
    - variant  VoiceVariant
    - r2ObjectKey str 

    - generations Generation[]

    - createdAt  
    - updateAt


Table Generation

    - orgId 

    - voiceId  String 
    - voice FK 

    - text string 
    - voiceName string 

    - r2ObjectKey   string 
    - temperature floast
    - topP float 
    - topK  int 

    - repetitionPenalty Float 

    - createdAt
    - updateAt

    index orgId, voiceId
# Voice Lab Client

## Run locally

From this directory, install dependencies and start the Next.js app:

```powershell
npm install
npm run dev
```

The client uses `client/.env.local` for `NEON_AUTH_BASE_URL`,
`NEON_AUTH_COOKIE_SECRET`, and `NEXT_PUBLIC_API_URL`. The cookie secret must be
at least 32 characters. Keep this file local and do not commit it.

Build and start the production app with:

```powershell
npm run build
npm run start
```


```
{
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}
```

```
**I wouldn’t switch to Supabase Auth or build auth from scratch just to control your emails.** Neon Auth already supports using your own email service, so you can keep Neon for identity and your database while sending through SendGrid.

You have two options in Neon:

- **Use SendGrid as custom SMTP.** Configure it in Neon’s **Settings → Better Auth**. Your sender address will be yours, but Neon’s default email content remains. 
- **Use a Neon Auth webhook with SendGrid.** Handle Neon’s `send.otp` and `send.magic_link` events in your backend and create fully branded email templates. Neon documents this option for SendGrid and other providers. [Neon email setup](https://neon.com/docs/auth/production-checklist) · [Custom email delivery](https://neon.com/docs/auth/guides/customize-emails)

Supabase Auth is also managed auth, but it supports custom SMTP and templates. Switching would give you another dashboard to manage and would require updating the JWT verification your FastAPI backend currently does against Neon. [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

I’d keep Neon Auth unless you need auth features Neon doesn’t support or want to operate the auth service yourself. Neon lists custom hooks, plugins, and full control over auth code as reasons to self-host. [Managed vs. self-hosted Better Auth](https://neon.com/docs/auth/about)

One distinction: **Google sign-in** uses OAuth/OpenID Connect to authenticate users. It isn’t the same as sending mail through Gmail. Your app already has a Google sign-in flow; for production, configure your own Google OAuth credentials. Use SendGrid for application emails. [Google sign-in](https://developers.google.com/identity/openid-connect/openid-connect) · [Neon production checklist](https://neon.com/docs/auth/production-checklist)
```