import { fromByteArray } from "base64-js";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URL;

const storageToken = "ACCESS_TOKEN";
const storageCodeVerifier = "code_verifier";
const scopes = ["playlist-modify-public"];

const Spotify = {
  async getAccessToken() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (localStorage.getItem(storageToken)) {
      return localStorage.getItem(storageToken);
    }

    if (!code) {
      const codeVerifier = this.generateRandomString(128);
      localStorage.setItem(storageCodeVerifier, codeVerifier);

      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      const state = this.generateRandomString(16);

      const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join(
        " "
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

      window.location.href = authUrl;
    } else {
      const codeVerifier = localStorage.getItem(storageCodeVerifier);
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      });

      const option = {
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      };

      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        option
      );

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem(storageToken, data.access_token);
        window.history.replaceState({}, document.title, "/");
        return data.access_token;
      } else {
        throw new Error("Failed to retrieve access token");
      }
    }
  },

  async search(keyWord) {
    const accessToken = await this.getAccessToken();
    const option = {
      header: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
        keyWord
      )}`,
      option
    );

    const data = await response.json();
    return data.tracks
      ? data.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artist[0].name,
          album: track.album.name,
          uri: track.uri,
        }))
      : [];
  },

  generateRandomString(length) {
    const possibleSymbols =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let text = "";
    for (let i = 0; i < length; i++) {
        text += possibleSymbols.charAt(
            Math.floor(Math.random() * possibleSymbols.length)
      );
    }
    return text;
  },

  async generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const base64String = fromByteArray(new Uint8Array(digest));
    const base64url = base64String
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return base64url;
  },
};

export default Spotify;
