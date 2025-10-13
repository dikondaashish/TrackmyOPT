# Google OAuth Setup for Supabase

Your Google OAuth is configured in Supabase. **This configuration is stored server-side and secure.**

## ✅ Current Configuration

**Supabase Dashboard Settings:**
- Provider: Google
- Client ID: `561201157955-aavvjc4d2v7f0jfrvvq12p0e4gind7r6.apps.googleusercontent.com`
- Callback URL: `https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback`
- Status: ✅ Enabled

## 🔒 Security Notes

1. **Client ID is Public** - The Google Client ID is not a secret and can be safely used in client-side code
2. **Client Secret is Private** - The Client Secret is stored in Supabase (not in your code)
3. **OAuth Flow** - All sensitive operations happen server-side in Supabase
4. **Callback URL** - Registered with both Google and Supabase

## 🎯 How It Works

### Authentication Flow
1. User clicks "Continue with Google" button
2. Browser redirects to Google OAuth consent screen
3. User authorizes the app
4. Google redirects back to Supabase callback URL
5. Supabase creates/updates user session
6. User is redirected to your app

### In Your Code
```typescript
// web/app/auth/extension/page.tsx
const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
```

## 📋 What You Already Have

✅ Google OAuth enabled in Supabase dashboard  
✅ Client ID registered  
✅ Callback URL configured  
✅ "Continue with Google" button added to auth page  
✅ OAuth handler implemented  

## 🧪 Testing Google Sign-In

1. Start the dev server: `pnpm dev:web`
2. Go to: http://localhost:3000/auth/extension
3. Click "Continue with Google"
4. Sign in with your Google account
5. Authorize the app
6. You'll be redirected back and signed in!

## ⚙️ Supabase Dashboard Access

To view/modify Google OAuth settings:
1. Go to: https://app.supabase.com/project/deknauqkqqzwuvopqott
2. Navigate to: Authentication → Providers
3. Find: Google provider
4. Settings are already configured ✅

## 🔧 Supported OAuth Providers

Supabase supports many OAuth providers. To add more:
- GitHub
- GitLab
- Bitbucket
- Azure
- Facebook
- Twitter
- Discord
- And more...

Just enable them in the Supabase dashboard!

## 🐛 Troubleshooting

### "OAuth Error" or "Invalid Redirect URI"
- Verify callback URL in Google Cloud Console matches Supabase
- Check that the provider is enabled in Supabase dashboard

### "Failed to sign in with Google"
- Check browser console for detailed error
- Verify Supabase project is active
- Ensure internet connection is stable

### User Data Not Saved
- Check if `profiles` table trigger is working
- Verify RLS policies allow INSERT for authenticated users
- Look at Supabase logs for errors

## 📚 Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

