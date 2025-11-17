# GPT Google OAuth Proxy

OAuth authentication proxy for connecting ChatGPT to Google Workspace services. This serverless backend handles the OAuth 2.0 flow between ChatGPT and Google APIs.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL)

## 📁 Project Structure

```
gpt-google-oauth-proxy/
├── api/
│   ├── auth.js           # Initiates OAuth flow
│   ├── oauth_callback.js # Handles OAuth callback from Google
│   └── token.js          # Refreshes access tokens
├── package.json          # Dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🔧 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable required APIs:
   - Gmail API
   - Google Drive API
   - Google Calendar API
   - Google Docs API
   - Google Sheets API
   - Google Contacts API
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: `GPT Google Workspace Connector`
   - Authorized redirect URIs: Add this temporarily (will update after Vercel deployment):
     ```
     http://localhost:3000/api/oauth_callback
     ```
5. Download the credentials JSON file
6. Note down:
   - `CLIENT_ID` (ends with `.apps.googleusercontent.com`)
   - `CLIENT_SECRET`

### Step 2: Deploy to Vercel

1. **Push code to GitHub:**
   ```bash
   cd gpt-google-oauth-proxy
   git init
   git add .
   git commit -m "Initial commit: GPT Google OAuth Proxy"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Note your deployment URL: `https://YOUR_PROJECT.vercel.app`

### Step 3: Configure Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `CLIENT_ID` | Your Google OAuth Client ID | `123456.apps.googleusercontent.com` |
| `CLIENT_SECRET` | Your Google OAuth Client Secret | `GOCSPX-abc123xyz` |
| `REDIRECT_URI` | Your Vercel callback URL | `https://your-project.vercel.app/api/oauth_callback` |
| `CHATGPT_CALLBACK_URL` | ChatGPT OAuth callback URL | `https://chatgpt.com/aip/g-YOUR_GPT_ID/oauth/callback` |
| `SCOPES` | Space-separated Google API scopes | See below ⬇️ |

**SCOPES value** (copy as one line):
```
openid https://mail.google.com/ https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
```

After adding environment variables, **redeploy** your project:
- Go to **Deployments** tab
- Click the three dots on the latest deployment
- Click "Redeploy"

### Step 4: Update Google OAuth Redirect URI

1. Go back to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", **add**:
   ```
   https://YOUR_PROJECT.vercel.app/api/oauth_callback
   ```
4. **Remove** the localhost URI
5. Click "Save"

### Step 5: Get Your GPT Callback URL

To find your `CHATGPT_CALLBACK_URL`:

1. Go to your GPT in ChatGPT
2. Look at the URL, it will look like: `https://chatgpt.com/g/g-XXXXXXXXX-your-gpt-name`
3. The GPT ID is the part after `/g/`: `g-XXXXXXXXX`
4. Your callback URL is:
   ```
   https://chatgpt.com/aip/g-XXXXXXXXX/oauth/callback
   ```

Update this in Vercel environment variables and redeploy.

### Step 6: Configure Your GPT

In your GPT settings, configure the OAuth authentication:

**Authentication Type:** OAuth

**Client ID:** Your Google OAuth Client ID

**Client Secret:** Your Google OAuth Client Secret

**Authorization URL:**
```
https://YOUR_PROJECT.vercel.app/api/auth
```

**Token URL:**
```
https://YOUR_PROJECT.vercel.app/api/token
```

**Scope:**
```
openid https://mail.google.com/ https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
```

**Token Exchange Method:** POST

## 🧪 Testing

After deployment, test each endpoint:

1. **Test auth endpoint:**
   ```bash
   curl -I https://YOUR_PROJECT.vercel.app/api/auth
   ```
   Should return a 302 redirect to Google

2. **Test in browser:**
   Visit `https://YOUR_PROJECT.vercel.app/api/auth` in your browser
   - Should redirect to Google login
   - After authorization, should redirect to callback
   - Should show success message

3. **Test from GPT:**
   In ChatGPT, try to authenticate with your GPT
   - Should open Google login
   - Should complete OAuth flow
   - Should return to ChatGPT with success

## 🔍 API Endpoints

### `GET /api/auth`
Initiates the OAuth flow by redirecting to Google's authorization page.

**Query Parameters:** None (uses environment variables)

**Response:** 302 Redirect to Google OAuth

---

### `GET /api/oauth_callback`
Handles the callback from Google after user authorization.

**Query Parameters:**
- `code` - Authorization code from Google
- `error` (optional) - Error from Google if authorization failed

**Response:** HTML success page or error message

---

### `POST /api/token`
Refreshes an expired access token.

**Request Body:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "expires_in": 3599,
  "token_type": "Bearer"
}
```

## 🐛 Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Console **exactly matches** your Vercel URL
- Check for trailing slashes - don't include them
- After updating, wait a few minutes for Google's changes to propagate

### "Invalid client" error
- Verify `CLIENT_ID` and `CLIENT_SECRET` are correct in Vercel
- Make sure you copied the full values without spaces
- Redeploy after changing environment variables

### OAuth success but ChatGPT doesn't connect
- Verify your `CHATGPT_CALLBACK_URL` is correct
- Make sure it includes your actual GPT ID
- Check Vercel Function Logs for errors

### Tokens not refreshing
- Ensure the token refresh endpoint is accessible
- Verify `CLIENT_SECRET` is set correctly
- Check that you requested `access_type: offline` in the auth flow

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `CLIENT_ID` | Yes | Google OAuth Client ID |
| `CLIENT_SECRET` | Yes | Google OAuth Client Secret |
| `REDIRECT_URI` | Yes | OAuth callback URL (your Vercel domain + /api/oauth_callback) |
| `CHATGPT_CALLBACK_URL` | Yes | ChatGPT OAuth callback URL |
| `SCOPES` | Yes | Space-separated list of Google API scopes |

## 🔒 Security Notes

- Never commit `.env` files to Git
- Keep your `CLIENT_SECRET` secure
- Only add trusted redirect URIs in Google Console
- Regularly rotate your OAuth credentials
- Monitor Vercel function logs for suspicious activity

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [ChatGPT Custom GPTs](https://help.openai.com/en/articles/8554397-creating-a-gpt)

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🤝 Support

If you encounter issues:
1. Check Vercel Function Logs: **Vercel Dashboard → Your Project → Logs**
2. Verify all environment variables are set correctly
3. Check Google Cloud Console for API quota limits
4. Review OAuth consent screen settings

---

Made with ❤️ for seamless ChatGPT + Google Workspace integration

