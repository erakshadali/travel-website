import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { adminApi, setUnauthorizedHandler } from './api'
import { TOKEN_KEY, clearToken, getToken, setToken, tokenExpiry } from './session'

const AuthContext = createContext(null)
export const useAdminAuth = () => useContext(AuthContext)

export function AdminAuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken)
  const [expired, setExpired] = useState(false) // true when we were signed out by the server or the clock

  const expire = useCallback(() => {
    clearToken()
    setTokenState(null)
    setExpired(true)
  }, [])

  // Any 401 from the API signs the admin out.
  useEffect(() => {
    setUnauthorizedHandler(expire)
    return () => setUnauthorizedHandler(() => {})
  }, [expire])

  // Sign out at the moment the token runs out, even if the page just sits open.
  useEffect(() => {
    const exp = token && tokenExpiry(token)
    if (!exp) return undefined
    const timer = setTimeout(expire, Math.max(0, exp - Date.now()))
    return () => clearTimeout(timer)
  }, [token, expire])

  // Signing out (or in) in another tab applies here too.
  useEffect(() => {
    const onStorage = (e) => e.key === TOKEN_KEY && setTokenState(getToken())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (email, password) => {
    const { token: next } = await adminApi.login(email, password)
    setToken(next)
    setTokenState(next)
    setExpired(false)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setExpired(false)
  }, [])

  const value = useMemo(() => ({ token, expired, login, logout }), [token, expired, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
