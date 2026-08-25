const TOKEN_KEY = "veergatha_token";
const REFRESH_KEY = "veergatha_refresh";

// The project was renamed from Smriti. Migrate any surviving token once on load
// rather than leaving `a || b` fallbacks scattered through the app.
(function migrateLegacyToken() {
  try {
    const legacy = localStorage.getItem("smriti_token");
    if (legacy && !localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, legacy);
    }
    localStorage.removeItem("smriti_token");
  } catch {
    // Private mode or blocked storage — the app still works, just unauthenticated.
  }
})();

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Ignore — see above.
  }
}

export const getToken = () => read(TOKEN_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);
export const isAuthenticated = () => Boolean(getToken());

export function saveSession({ accessToken, refreshToken }) {
  write(TOKEN_KEY, accessToken);
  if (refreshToken) write(REFRESH_KEY, refreshToken);
}

export function clearSession() {
  write(TOKEN_KEY, null);
  write(REFRESH_KEY, null);
}
