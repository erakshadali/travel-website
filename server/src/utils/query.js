import { z } from 'zod'

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Case-insensitive "contains" match on any of the given fields. Regex characters are taken literally.
export function searchFilter(search, fields) {
  if (!search) return {}
  const rx = new RegExp(escapeRegex(search), 'i')
  return { $or: fields.map((field) => ({ [field]: rx })) }
}

// Query-string fields shared by every admin list.
export const paging = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}

export async function paginate(Model, { filter = {}, sort, select, page, limit }) {
  const query = Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit)
  if (select) query.select(select)
  const [total, data] = await Promise.all([Model.countDocuments(filter), query])
  return { data, page, limit, total, pages: Math.ceil(total / limit) }
}
