export default async function handler(req, res) {
  res.status(200).json({
    status: "OK",
    message: "GPT Google OAuth Proxy is running",
    endpoints: {
      auth: "/api/auth - Initiates OAuth flow",
      callback: "/api/oauth_callback - Handles OAuth callback from Google",
      token: "/api/token - Refreshes access tokens"
    },
    environment: {
      hasClientId: !!process.env.CLIENT_ID,
      hasClientSecret: !!process.env.CLIENT_SECRET,
      hasRedirectUri: !!process.env.REDIRECT_URI,
      hasChatGptCallback: !!process.env.CHATGPT_CALLBACK_URL,
      hasScopes: !!process.env.SCOPES
    },
    version: "1.0.0"
  });
}
