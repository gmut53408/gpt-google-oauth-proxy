import fetch from "node-fetch";

export default async function handler(req, res) {
  const code = req.query.code;
  const state = req.query.state;
  const error = req.query.error;

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return res.status(400).send(`OAuth error: ${error}. You can close this window.`);
  }

  if (!code) {
    return res.status(400).send("Missing authorization code. You can close this window.");
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", tokens);
      return res.status(500).send(`Token exchange failed: ${tokens.error || "Unknown error"}. You can close this window.`);
    }

    console.log("OAuth success - tokens obtained", { 
      hasAccessToken: !!tokens.access_token, 
      hasRefreshToken: !!tokens.refresh_token,
      state: state 
    });

    // Show success page (works for both ChatGPT and direct browser testing)
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Success</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
          }
          h1 { color: #10b981; margin: 0 0 10px 0; }
          p { color: #6b7280; margin: 10px 0; }
          .success-icon { font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>OAuth Success!</h1>
          <p>Your Google Workspace has been connected to ChatGPT.</p>
          <p>You can now close this window and return to ChatGPT.</p>
        </div>
        <script>
          // Auto-close after 3 seconds
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send(`OAuth callback failed: ${error.message}. You can close this window.`);
  }
}
