import { NotifyError, isTimeout, withTimeout } from './errors.js'

// What to do about the error codes people actually hit while setting up the Cloud API.
// https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
const HINTS = {
  190: 'The access token is invalid or has expired. Temporary tokens last only about 24 hours: create a permanent System User token and put it in WHATSAPP_ACCESS_TOKEN.',
  131030: 'This number is not on the allowed recipient list. Add it (and enter the code WhatsApp sends to it) under Meta > WhatsApp > API Setup > To > Manage phone number list.',
  131026: 'The message could not be delivered: the number may not have WhatsApp, or has not accepted the latest terms.',
  131047: 'More than 24 hours have passed since this customer last wrote to you, so only approved templates can be sent.',
  131042: 'Meta reports a billing/payment problem on the WhatsApp Business account.',
  131056: 'Too many messages to this number in a short time. Try again later.',
  132000: 'The number of variables sent does not match the template. The template in Meta must have exactly the variables listed in src/notify/templates.js.',
  132001: 'That template name does not exist in that language, or is not approved yet. Check its name, language code (WHATSAPP_TEMPLATE_LANGUAGE) and that its status in WhatsApp Manager is Approved.',
  132005: 'The template text is too long after filling in the variables.',
  132007: 'The template content breaks a WhatsApp policy.',
  132012: 'A variable has the wrong format for this template.',
  132015: 'This template is paused because of low quality. Check WhatsApp Manager.',
  132016: 'This template has been disabled. Check WhatsApp Manager.',
  132018: 'A variable contains line breaks, tabs or too many spaces, which WhatsApp does not allow.',
  130429: 'WhatsApp is rate limiting this account. Try again later.',
  100: 'Meta rejected the request. Check that WHATSAPP_PHONE_NUMBER_ID is the "Phone number ID" (not the WhatsApp Business Account ID or the phone number itself) and that the token belongs to the same app.',
}

// WhatsApp template variables may not contain line breaks or tabs, or runs of 4+ spaces.
export const cleanParam = (value) => String(value ?? '').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim().slice(0, 1000)

// https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
export async function sendWhatsAppTemplate(
  { phoneNumberId, accessToken, apiVersion, defaultLanguage, fetchImpl = fetch, timeoutMs = 15_000 },
  { to, template, params = [], language },
) {
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`
  const body = {
    messaging_product: 'whatsapp',
    to: to.replace(/^\+/, ''), // the API wants digits only: 911234567890, not +91 12345 67890
    type: 'template',
    template: {
      name: template.name,
      language: { code: language ?? defaultLanguage },
      ...(params.length && { components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text: cleanParam(text) })) }] }),
    },
  }

  let res
  try {
    res = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: withTimeout(timeoutMs),
    })
  } catch (err) {
    throw new NotifyError(isTimeout(err) ? `WhatsApp did not answer within ${timeoutMs / 1000} s` : `Could not reach WhatsApp: ${err.message}`)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok || data?.error) {
    const e = data?.error ?? {}
    const detail = e.error_data?.details ? ` (${e.error_data.details})` : ''
    const hint = HINTS[e.code] ? ` Hint: ${HINTS[e.code]}` : ''
    throw new NotifyError(`WhatsApp error ${e.code ?? res.status}: ${e.message ?? 'no details given'}${detail}.${hint}`, { status: res.status })
  }
  const id = data?.messages?.[0]?.id
  if (!id) throw new NotifyError('WhatsApp accepted the request but returned no message id')
  return { id }
}
