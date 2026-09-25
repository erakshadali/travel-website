import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { HttpError } from '../utils/httpError.js'
import { requireAdmin } from '../middleware/auth.js'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
})

export function adminAuthRouter(config) {
  const router = Router()

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.loginRateLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true, // only failed attempts count towards the lockout; signing in normally never does
    message: { error: 'Too many login attempts, try again later' },
  })

  router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = loginSchema.parse(req.body)
    // Always run the bcrypt compare so response time doesn't reveal whether the email was right.
    const passwordOk = await bcrypt.compare(password, config.adminPasswordHash)
    if (email !== config.adminEmail || !passwordOk) throw new HttpError(401, 'Invalid email or password')

    const token = jwt.sign({ role: 'admin' }, config.jwtSecret, {
      algorithm: 'HS256',
      subject: email,
      expiresIn: config.jwtExpiresIn,
    })
    res.json({ token, expiresIn: config.jwtExpiresIn })
  })

  router.get('/me', requireAdmin(config.jwtSecret), (req, res) => {
    res.json({ email: req.admin.email, role: 'admin' })
  })

  return router
}
