# Final Deployment Steps

## What We Just Fixed

The issue was that ChatGPT requires the **Authorization URL**, **Token URL**, and **API hostname** to all share the same root domain. 

Your original setup had:
- ❌ API Server: `https://www.googleapis.com` (Google's domain)
- ❌ Auth URL: `https://gpt-google-oauth-proxy.vercel.app/api/auth` (Your proxy)
- ❌ Token URL: `https://gpt-google-oauth-proxy.vercel.app/api/token` (Your proxy)

This caused the error: **"Authorization URL, Token URL, and API hostname must share a root domain"**

## The Solution

We've created a unified architecture where ALL requests go through your proxy:
- ✅ API Server: `https://gpt-google-oauth-proxy.vercel.app`
- ✅ Auth URL: `https://gpt-google-oauth-proxy.vercel.app/api/auth`
- ✅ Token URL: `https://gpt-google-oauth-proxy.vercel.app/api/token`

Your proxy now handles:
1. OAuth flow (already implemented)
2. API request proxying (just created: `api/googleConnector.js`)

---

## Step 1: Deploy the New API Endpoint

```bash
cd /Users/upthrust/Library/CloudStorage/GoogleDrive-gm@upthrustsolutions.com/Shared\ drives/Upthrust\ shared\ drive/GPT\ Connector/gpt-google-oauth-proxy

# Add the new file
git add api/googleConnector.js openapi-schema.json FINAL_DEPLOYMENT_STEPS.md

# Commit
git commit -m "Add Google API connector endpoint and unified OpenAPI schema"

# Push to deploy
git push origin main
```

**Wait 30-60 seconds** for Vercel to deploy.

---

## Step 2: Upload OpenAPI Schema to ChatGPT

1. Go to your GPT configuration page
2. Find the **Schema** section
3. **Delete the current schema** (if any)
4. Click **"Import from file"** or paste the content
5. Upload or paste the content from: `openapi-schema.json`
6. Click **Save**

The schema will now pass validation because all URLs are on the same domain.

---

## Step 3: Update OAuth Settings in ChatGPT

In your GPT's Authentication settings:

### Current (WRONG) Values:
```
Authorization URL: https://accounts.google.com/o/oauth2/v2/auth ❌
Token URL: https://oauth2.googleapis.com/token ❌
```

### Change To (CORRECT) Values:
```
Authorization URL: https://gpt-google-oauth-proxy.vercel.app/api/auth ✅
Token URL: https://gpt-google-oauth-proxy.vercel.app/api/token ✅
```

### Client ID and Secret (Don't Change):
```
Client ID: [Your Client ID from Google Console]
Client Secret: [Your Client Secret from Google Console]
```

> 💡 **Find your credentials in**: `YOUR_CREDENTIALS.md` or `.env` file

### Scope (Copy/Paste This):
```
openid https://mail.google.com/ https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/forms.body.readonly https://www.googleapis.com/auth/forms.responses.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
```

Click **Save**.

---

## Step 4: Enable Google APIs

Go to Google Cloud Console and enable these APIs:

### Quick Links:
1. [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=upthrust-gpt)
2. [Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com?project=upthrust-gpt)
3. [Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com?project=upthrust-gpt)
4. [Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=upthrust-gpt)
5. [Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=upthrust-gpt)
6. [People API](https://console.cloud.google.com/apis/library/people.googleapis.com?project=upthrust-gpt)
7. [Forms API](https://console.cloud.google.com/apis/library/forms.googleapis.com?project=upthrust-gpt)

**Click "ENABLE" on each one.**

---

## Step 5: Test the Connection

1. Go to your GPT
2. Look for a **"Connect to Google"** or **"Authenticate"** button
3. Click it and sign in with your Google account
4. Grant the requested permissions

### Test Commands:

Try these commands in your GPT:

**Gmail:**
```
List my recent emails
Show me the details of my latest email
Send an email to test@example.com
```

**Drive:**
```
List files in my Google Drive
Search for documents with "report" in the name
```

**Docs:**
```
Read the content of document ID: 1abc...
Create a new document
```

**Calendar:**
```
Show my calendar events for today
Create a new meeting for tomorrow at 2pm
```

**Contacts:**
```
List my contacts
```

---

## Architecture Overview

```
ChatGPT GPT
    ↓ (sends command)
    ↓
Vercel Proxy (gpt-google-oauth-proxy.vercel.app)
    ├─ /api/auth → Start OAuth
    ├─ /api/oauth_callback → Complete OAuth
    ├─ /api/token → Refresh token
    └─ /api/googleConnector → Proxy API requests
        ↓ (forwards with OAuth token)
        ↓
Google APIs (gmail.googleapis.com, drive, docs, etc.)
```

---

## Troubleshooting

### "Invalid Grant" Error
- Go to Google Console → OAuth consent screen
- Make sure your email is in Test users
- Try disconnecting and reconnecting

### "Access Denied" Error
- Check that all APIs are enabled (Step 4)
- Verify scopes in GPT settings match the list above

### "404 Not Found"
- Wait 60 seconds after git push for Vercel to deploy
- Check deployment status at: https://vercel.com/dashboard

### "Domain Mismatch" Error
- Make sure you uploaded the NEW `openapi-schema.json`
- Verify all three URLs use `gpt-google-oauth-proxy.vercel.app`

---

## Success! 🎉

Once you complete these steps, your GPT will be able to:
- ✅ Read and send Gmail
- ✅ Access Google Drive files
- ✅ Read and write Google Docs
- ✅ Read and write Google Sheets
- ✅ Manage Calendar events
- ✅ Access Contacts
- ✅ Work with Google Forms

All through a secure OAuth proxy that you control!
