const express = require("express");
const querystring = require("querystring");
const axios = require("axios");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 8888; // Set default port if PORT environment variable is not provided
const redirectUri = process.env.REDIRECT_URI;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

app.get("/api/health", (req, res) => {
  res.status(200).send("Ok");
});

console.log("Client ID:", clientId);
console.log("Redirect URI:", redirectUri);

function generateRandomString(length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.get("/api/login", (req, res) => {
  var state = generateRandomString(16);
  const scope =
    "user-top-read user-read-private user-read-email playlist-modify-private playlist-modify-public user-read-recently-played";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
      })
  );
  console.log("Redirecting to Spotify auth page:");
});

app.get("/api/callback", (req, res) => {
  var code = req.query.code || null;
  var state = req.query.state || null;
  if (state === null) {
    res.redirect("" + querystring.stringify({ error: "state_mismatch" }));
  } else {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const authOptions = {
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify({
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    };
    axios(authOptions)
      .then((response) => {
        const { access_token, refresh_token, expires_in } = response.data;

        const serializedTokens = querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token,
        });
        res.redirect(`https://www.wrappedify.com/results#${serializedTokens}`);
      })
      .catch((error) => {
        console.error("Error fetching access token", error);
        res.status(500).json({ error: "Failed to retrieve access token" });
      });
  }
});

app.get("/api/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Missing refresh_token parameter" });
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      res.json({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      });
    } else {
      res.status(500).json({ error: "Failed to refresh token" });
    }
  } catch (error) {
    console.error("Error refreshing token: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
module.exports.handler = (req, res) => app(req, res);
