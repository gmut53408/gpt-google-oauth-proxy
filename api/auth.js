export default async function handler(req, res) {
  const redirectUri = process.env.REDIRECT_URI;
  const clientId = process.env.CLIENT_ID;
  const scope = process.env.SCOPES;
  
  // Get state parameter from ChatGPT
  const state = req.query.state;

  // Validate required environment variables
  if (!clientId || !redirectUri || !scope) {
    return res.status(500).json({
      error: "Missing required environment variables",
      missing: {
        CLIENT_ID: !clientId,
        REDIRECT_URI: !redirectUri,
        SCOPES: !scope
      }
    });
  }

  const params = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: scope
  };
  
  // Include state parameter if provided (required by ChatGPT)
  if (state) {
    params.state = state;
  }

  const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams(params);

  res.redirect(url);
}
