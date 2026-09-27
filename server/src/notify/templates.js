// WhatsApp message templates.
//
// WhatsApp only lets a business start a conversation with a *pre-approved template*; free-form text
// works only inside 24 hours after the customer last wrote to you. So every message we send on our own
// is a template, created and approved once in Meta's WhatsApp Manager, then referenced here by name.
//
// The `body` below must be pasted into Meta exactly as written ({{1}}, {{2}}... are the variables, in
// this order), with the language and category shown. `examples` are the sample values Meta asks for.
export const WHATSAPP_TEMPLATES = {
  booking_confirmation: {
    name: 'booking_confirmation',
    category: 'UTILITY',
    body:
      'Hello {{1}}, thank you for booking with Premium Tours and Travels. Your booking reference is {{2}} for {{3}}, departing {{4}}. ' +
      'Our team is reviewing your request and will confirm shortly. We will send your trip updates here.',
    examples: ['Aisha', 'FT-AB12CDE', 'Dubai Luxe Escape', '12 Oct 2026'],
  },
}

// Meta's built-in template, present on every new WhatsApp account. Handy for checking your keys and
// recipient list before your own templates are approved. Its language is en_US, not "en".
export const HELLO_WORLD = {
  name: 'hello_world',
  language: 'en_US',
  body: 'Hello World. Welcome and congratulations! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API.',
}

// The text the customer will read, for log mode and for the admin to preview.
export const renderTemplate = (template, params = []) => template.body.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] ?? '')
