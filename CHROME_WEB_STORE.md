# Chrome Web Store Listing

## Basic Info

### Title
**OPT Hub — OPT & STEM OPT Toolkit**

### Short Description (132 chars max)
Track OPT/STEM deadlines, file windows, and unemployment clock. Sign in with Google or email. Stay compliant with smart reminders.

### Full Description
OPT Hub is your complete toolkit for OPT & STEM OPT compliance.

**Key Features:**
• **Filing Windows**: Calculate exact "when to apply" dates for OPT & STEM OPT
• **Unemployment Tracker**: Monitor your 90-day (Regular OPT) or 150-day (STEM) limit with clear warnings at 60/80/90 days
• **Smart Reminders**: Get Chrome notifications for critical deadlines
• **STEM Reporting**: Never miss 6/12/18/24-month reporting requirements
• **Secure Sign-In**: Use Google OAuth or email/password
• **Privacy First**: Your data stays private in your encrypted account

**What You Can Track:**
✓ Program End Date
✓ DSO Recommendation Date
✓ OPT EAD Card Expiration
✓ OPT Start Date
✓ STEM OPT Start Date
✓ Employment History & Gaps

**Perfect For:**
- F-1 students on OPT or STEM OPT
- Recent graduates tracking compliance
- Anyone needing precise deadline calculations

**Permissions:**
We request minimal permissions:
- **identity**: For secure Google sign-in
- **storage**: To save your session and preferences locally

Your immigration status is important. OPT Hub helps you stay compliant with USCIS regulations through accurate tracking and timely reminders.

---

## Category
**Productivity**

## Language
**English (United States)**

---

## Assets Needed

### Icons
- ✅ 128×128 PNG (required)
- ✅ 48×48 PNG (required) 
- ✅ 16×16 PNG (required)

**Current icons:** `/extension/public/icons/`

### Screenshots (1280×800 or 640×400)
Upload 3-5 screenshots showing:

1. **Screenshot 1**: Extension popup with signed-in view showing OPT dates
2. **Screenshot 2**: Sign-in screen (Google + Manual tabs)
3. **Screenshot 3**: Web dashboard with OPT filing windows
4. **Screenshot 4**: Manual sign-up form with OPT date fields
5. **Screenshot 5**: Countdown timer / deadline warnings

### Promotional Images (Optional but Recommended)
- **Small tile**: 440×280 PNG
- **Marquee**: 1400×560 PNG

---

## Links

### Website
**Production**: `https://trackmyopt.vercel.app` (or custom domain)
**Local Dev**: `http://localhost:3000`

### Privacy Policy (Required!)
`https://trackmyopt.vercel.app/privacy`

### Support Email
`support@trackmyopt.com` (or your email)

---

## Pricing & Distribution

- **Free** (no in-app purchases)
- **Regions**: All countries
- **Audience**: 18+ (immigration-related content)

---

## OAuth Configuration

### Google OAuth Client ID
For production extension, create a **Chrome Extension** OAuth client in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID → **Chrome Extension**
3. **Application ID**: `[Your Chrome Web Store extension ID]`
4. Copy the Client ID to `manifest.json`:
   ```json
   {
     "oauth2": {
       "client_id": "YOUR_CHROME_EXTENSION_CLIENT_ID.apps.googleusercontent.com",
       "scopes": ["email", "profile"]
     }
   }
   ```

### Web App OAuth (Supabase)
Already configured in Supabase:
- Client ID: `561201157955-fiibv7irokcogh6s65jl5acquvedkd2i.apps.googleusercontent.com`
- Callback URL: `https://deknauqkqqzwuvopqott.supabase.co/auth/v1/callback`

---

## Pre-Submission Checklist

### Code
- [ ] Update `WEBSITE_URL` in `extension/src/config.ts` to production URL
- [ ] Update `manifest.json` version to `1.0.0`
- [ ] Add OAuth2 client_id to `manifest.json`
- [ ] Update `host_permissions` to production domain
- [ ] Remove `localhost` from `host_permissions` for production build
- [ ] Test production build: `pnpm build:ext`

### Privacy
- [ ] Create `/privacy` page on web app
- [ ] Deploy to Vercel (or production hosting)
- [ ] Test all OAuth flows in production

### Store Listing
- [ ] Upload 3-5 screenshots
- [ ] Upload 128×128, 48×48, 16×16 icons
- [ ] Verify description (no prohibited content)
- [ ] Add support email
- [ ] Review permissions justification

### Testing
- [ ] Test extension with production web app URL
- [ ] Test Google OAuth end-to-end
- [ ] Test manual sign-up/sign-in
- [ ] Test `/api/me` endpoint
- [ ] Verify data displays correctly in popup

---

## Post-Publication

### Monitor
- Chrome Web Store reviews
- User feedback via support email
- Google Analytics (optional)

### Updates
To update the extension:
1. Increment version in `manifest.json`
2. Build: `pnpm build:ext`
3. Zip `extension/dist/` folder
4. Upload to Chrome Web Store Developer Dashboard
5. Submit for review

---

## Helpful Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

