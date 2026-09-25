// Where the admin's login token lives. localStorage keeps you signed in for the token's lifetime
// (12 h); if storage is blocked (private mode) it falls back to memory and you sign in again on reload.
export const TOKEN_KEY = 'ft-admin-token'

let memoryToken = null

// The JWT payload is only read here to know when it expires; the server is what actually verifies it.
export function tokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

const isExpired = (token) => {
  const exp = tokenExpiry(token)
  return exp === null || exp <= Date.now() + 5_000
}

export function clearToken() {
  memoryToken = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function getToken() {
  let token = memoryToken
  try {
    token = localStorage.getItem(TOKEN_KEY) ?? memoryToken
  } catch {
    /* storage unavailable: use the in-memory copy */
  }
  if (token && isExpired(token)) {
    clearToken()
    return null
  }
  return token || null
}

export function setToken(token) {
  memoryToken = token
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* storage unavailable: memory copy is enough for this tab */
  }
}
