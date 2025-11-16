# Quick Deployment Guide

## 🚀 Fast Track to Deploy

### 1. Push to GitHub (5 minutes)

```bash
cd "gpt-google-oauth-proxy"

# Initialize git
git init
git add .
git commit -m "Initial commit: GPT Google OAuth Proxy"
git branch -M main

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy to Vercel (2 minutes)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click **Deploy** (don't configure anything yet)
4. Copy your Vercel URL: `https://your-project-xxxxx.vercel.app`

### 3. Set Environment Variables in Vercel (3 minutes)

Go to: **Vercel Dashboard → Settings → Environment Variables**

Add these 5 variables:

```bash
CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
REDIRECT_URI=https://your-project-xxxxx.vercel.app/api/oauth_callback
CHATGPT_CALLBACK_URL=https://chatgpt.com/aip/g-YOUR_GPT_ID/oauth/callback
SCOPES=openid https://mail.google.com/ https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
```

Click **Redeploy** after adding variables.

### 4. Update Google OAuth Redirect URI (2 minutes)

1. Go to https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://your-project-xxxxx.vercel.app/api/oauth_callback
   ```
4. Remove any localhost URIs
5. Click **Save**

### 5. Configure Your GPT (2 minutes)

In ChatGPT GPT settings → Authentication:

- **Type:** OAuth
- **Client ID:** Your Google Client ID
- **Client Secret:** Your Google Client Secret
- **Authorization URL:** `https://your-project-xxxxx.vercel.app/api/auth`
- **Token URL:** `https://your-project-xxxxx.vercel.app/api/token`
- **Scope:** (same as SCOPES above)
- **Token Exchange Method:** POST

### 6. Test It! 🎉

1. Open your GPT in ChatGPT
2. Click to authenticate
3. Should redirect to Google
4. Approve permissions
5. Should return to ChatGPT connected!

---

## 🆘 Need Help?

### Where do I find my Google credentials?
https://console.cloud.google.com/apis/credentials

### Where do I find my GPT ID?
Your GPT URL looks like: `https://chatgpt.com/g/g-XXXXXXXXX-name`
The ID is: `g-XXXXXXXXX`

### Getting "redirect_uri_mismatch" error?
Make sure the URI in Google Console **exactly matches** your Vercel URL (no trailing slash)

### OAuth success but ChatGPT doesn't connect?
1. Check your `CHATGPT_CALLBACK_URL` includes the correct GPT ID
2. Redeploy in Vercel after changing environment variables
3. Check Vercel Function Logs for errors

---

**Total Time:** ~15 minutes ⏱️
