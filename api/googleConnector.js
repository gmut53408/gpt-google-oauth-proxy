import fetch from "node-fetch";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get command from either URL path or request body
    const pathMatch = req.url?.match(/\/api\/googleConnector\/([^?]+)/);
    const commandFromPath = pathMatch ? pathMatch[1] : null;
    const { command: commandFromBody, parameters = {} } = req.body || {};
    
    const command = commandFromPath || commandFromBody;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    if (!command) {
      return res.status(400).json({ error: "Missing command parameter" });
    }

    // Extract access token from Bearer token
    const accessToken = authHeader.replace("Bearer ", "");

    // Map commands to Google API endpoints
    const commandMap = {
      // Gmail
      gmail_list: {
        url: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
        method: "GET",
      },
      gmail_get: {
        url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${parameters.id}`,
        method: "GET",
      },
      gmail_send: {
        url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        method: "POST",
        body: parameters,
      },
      gmail_delete: {
        url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${parameters.id}`,
        method: "DELETE",
      },

      // Drive
      drive_list: {
        url: "https://www.googleapis.com/drive/v3/files",
        method: "GET",
      },
      drive_search: {
        url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(parameters.query || "")}`,
        method: "GET",
      },
      drive_upload: {
        url: "https://www.googleapis.com/upload/drive/v3/files",
        method: "POST",
        body: parameters,
      },
      drive_download: {
        url: `https://www.googleapis.com/drive/v3/files/${parameters.fileId}?alt=media`,
        method: "GET",
      },
      drive_delete: {
        url: `https://www.googleapis.com/drive/v3/files/${parameters.fileId}`,
        method: "DELETE",
      },

      // Docs
      docs_read: {
        url: `https://docs.googleapis.com/v1/documents/${parameters.documentId}`,
        method: "GET",
      },
      docs_write: {
        url: `https://docs.googleapis.com/v1/documents/${parameters.documentId}:batchUpdate`,
        method: "POST",
        body: parameters,
      },

      // Sheets
      sheets_read: {
        url: `https://sheets.googleapis.com/v4/spreadsheets/${parameters.spreadsheetId}`,
        method: "GET",
      },
      sheets_write: {
        url: `https://sheets.googleapis.com/v4/spreadsheets/${parameters.spreadsheetId}/values/${parameters.range}`,
        method: "PUT",
        body: parameters,
      },
      sheets_append: {
        url: `https://sheets.googleapis.com/v4/spreadsheets/${parameters.spreadsheetId}/values/${parameters.range}:append`,
        method: "POST",
        body: parameters,
      },

      // Calendar
      calendar_list: {
        url: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        method: "GET",
      },
      calendar_create: {
        url: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        method: "POST",
        body: parameters,
      },
      calendar_delete: {
        url: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${parameters.eventId}`,
        method: "DELETE",
      },
      calendar_freebusy: {
        url: "https://www.googleapis.com/calendar/v3/freeBusy",
        method: "POST",
        body: parameters,
      },

      // Contacts
      contacts_list: {
        url: "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses",
        method: "GET",
      },
      contacts_create: {
        url: "https://people.googleapis.com/v1/people:createContact",
        method: "POST",
        body: parameters,
      },
      contacts_update: {
        url: `https://people.googleapis.com/v1/${parameters.resourceName}:updateContact`,
        method: "PATCH",
        body: parameters,
      },
      contacts_delete: {
        url: `https://people.googleapis.com/v1/${parameters.resourceName}:deleteContact`,
        method: "DELETE",
      },

      // Forms
      forms_list: {
        url: "https://forms.googleapis.com/v1/forms",
        method: "GET",
      },
      forms_read: {
        url: `https://forms.googleapis.com/v1/forms/${parameters.formId}`,
        method: "GET",
      },
      forms_write: {
        url: `https://forms.googleapis.com/v1/forms/${parameters.formId}:batchUpdate`,
        method: "POST",
        body: parameters,
      },

      // Userinfo
      userinfo_profile: {
        url: "https://www.googleapis.com/oauth2/v2/userinfo",
        method: "GET",
      },
      userinfo_email: {
        url: "https://www.googleapis.com/oauth2/v2/userinfo",
        method: "GET",
      },
    };

    const apiConfig = commandMap[command];
    if (!apiConfig) {
      return res.status(400).json({ error: `Unknown command: ${command}` });
    }

    // Make request to Google API
    const options = {
      method: apiConfig.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    if (apiConfig.body) {
      options.body = JSON.stringify(apiConfig.body);
    }

    const response = await fetch(apiConfig.url, options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Google API error",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Google Connector error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
