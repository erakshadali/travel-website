import { Router } from 'express'
import { z } from 'zod'
import { TripPlan } from '../models/TripPlan.js'
import { ContactMessage } from '../models/ContactMessage.js'
import { NewsletterSubscriber } from '../models/NewsletterSubscriber.js'
import { paginate, paging, searchFilter } from '../utils/query.js'

const inboxQuery = z.object({
  search: z.string().trim().max(100).optional(),
  ...paging,
})

// Read-only, newest first: what visitors sent through the website forms.
const listing = (Model, searchFields) => async (req, res) => {
  const { search, page, limit } = inboxQuery.parse(req.query)
  res.json(await paginate(Model, { filter: searchFilter(search, searchFields), sort: { createdAt: -1 }, page, limit }))
}

export function adminInboxRouter() {
  const router = Router()
  router.get('/trip-plans', listing(TripPlan, ['name', 'email', 'phone', 'destination', 'hotel', 'budget']))
  router.get('/contact-messages', listing(ContactMessage, ['name', 'email', 'phone', 'topic', 'message']))
  router.get('/newsletter-subscribers', listing(NewsletterSubscriber, ['email']))
  return router
}
