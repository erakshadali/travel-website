import jwt from 'jsonwebtoken'
import { HttpError } from '../utils/httpError.js'

export const requireAdmin = (secret) => (req, _res, next) => {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) throw new HttpError(401, 'Authentication required')

  let payload
  try {
    payload = jwt.verify(token, secret, { algorithms: ['HS256'] })
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }
  if (payload.role !== 'admin') throw new HttpError(403, 'Forbidden')

  req.admin = { email: payload.sub }
  next()
}
