import { ZodError } from 'zod'
import { HttpError } from '../utils/httpError.js'

export const notFound = (_req, _res, next) => next(new HttpError(404, 'Not found'))

// Express identifies error handlers by their 4-argument signature, so `_next` must stay.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) })
  }
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
    return res.status(400).json({ error: 'Validation failed', details })
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body is not valid JSON' })
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' })

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
