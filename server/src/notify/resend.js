import { NotifyError, isTimeout, withTimeout } from './errors.js'

const ENDPOINT = 'https://api.resend.com/emails'

// https://resend.com/docs/api-reference/emails/send-email
export async function sendResendEmail({ apiKey, from, fetchImpl = fetch, timeoutMs = 15_000 }, { to, subject, html, text, replyTo }) {
  let res
  try {
    res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html, text, ...(replyTo && { reply_to: replyTo }) }),
      signal: withTimeout(timeoutMs),
    })
  } catch (err) {
    throw new NotifyError(isTimeout(err) ? `Resend did not answer within ${timeoutMs / 1000} s` : `Could not reach Resend: ${err.message}`)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    // Resend's own messages are specific, e.g. "You can only send testing emails to your own email
    // address (...) until you verify a domain", so they are passed through as they are.
    throw new NotifyError(`Resend ${res.status}${data?.name ? ` (${data.name})` : ''}: ${data?.message ?? 'no details given'}`, { status: res.status })
  }
  if (!data?.id) throw new NotifyError('Resend accepted the request but returned no email id')
  return { id: data.id }
}
