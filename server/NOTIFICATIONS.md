# Email and WhatsApp notifications

## What happens

When someone submits the booking form, the server sends three messages:

| To | Channel | Content |
| --- | --- | --- |
| The client | Email | "We have your booking request", with the details |
| The client | WhatsApp | The `booking_confirmation` template (only if they ticked the consent box and have not opted out) |
| The agency (`AGENCY_EMAIL`) | Email | "New booking FT-XXXXXXX" with everything you need to act |

Sending never slows down or breaks the booking: the visitor gets their confirmation screen first, and a failed message is only recorded.
Every message is recorded in the `notificationlogs` collection (status `sent` / `failed` / `skipped`, the error, the provider's message id), and a message is never sent twice.
See what happened to a booking with `npm run find-submissions -- someone@example.com` (the `messages:` part).

## NOTIFY_MODE

| Value | What it does |
| --- | --- |
| `log` (default) | Nothing leaves the server. Each message is printed in the terminal exactly as it would be sent, and recorded with mode `log`. |
| `live` | Really sends, through Resend (email) and the WhatsApp Cloud API. Needs the keys below. |

If you run in `live` mode with only some keys, the other channel is switched off and shows up as `failed: ... is not configured` in the log (and in the start-up line), so add WhatsApp later without touching anything else.
Messages that were only logged never block real ones: switch to `live` and the same booking can still be sent.

## 1. Resend (email)

1. Sign up at <https://resend.com> **with the email address you want test emails to arrive at** (see the limits below), and confirm it.
2. Dashboard > **API Keys** > **Create API Key**. Name: `premium-server`. Permission: **Sending access**. Domain: all domains. Click **Add**.
3. Copy the key now (it starts with `re_` and is shown only once).
4. Put it in `server/.env` as `RESEND_API_KEY=...`.

**Limits of `onboarding@resend.dev` (the sender that needs no domain):**
- It only delivers to the email address your Resend account was created with. Emails to your clients are rejected (`403 validation_error`).
  So without a domain you can test the whole flow to yourself, but real clients will not get their confirmation.
- Free plan: **100 emails per day, 3,000 per month** (each booking sends 2 emails: about 50 bookings a day).
- Test emails from `resend.dev` may land in spam. Look there first.

**When you have a domain:** Resend > **Domains** > **Add Domain** > add the DNS records it shows (at the company you bought the domain from) > **Verify**.
Then set `EMAIL_FROM="Premium Tours and Travels <bookings@yourdomain.com>"` in `.env`. Clients can now receive emails. The free plan allows 3 domains.

## 2. WhatsApp Cloud API (Meta)

You need: a Facebook account, and the phone that has your WhatsApp number.
Meta changes its screens now and then; if a button has moved, the official guide is at <https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started>.

**A. Create the app and get the test number**
1. Go to <https://developers.facebook.com> > **My Apps** > **Create App**.
2. Choose the use case **Connect with customers through WhatsApp**. App name: `Premium Travels`. Pick (or create) a Business portfolio when asked. Click **Create app**.
3. In the app dashboard open **WhatsApp** > **API Setup** (button: **Start using the API**). Choose or create a WhatsApp Business Account when asked.
4. On that page, under **From**, Meta gives you a **test phone number**. Copy the **Phone number ID** (a long number, digits only) into `.env` as `WHATSAPP_PHONE_NUMBER_ID`.
   It is not the test number itself and not the "WhatsApp Business Account ID" shown next to it.

**B. Add your own number as a test recipient** (the test number can only message numbers you have added, up to 5)
1. On the same page, in the **To** box choose **Manage phone number list** > **Add phone number**.
2. Enter your number (`+91 12345 67890`). WhatsApp sends a code to it. Type the code in.
3. Click **Send message** (it sends the ready-made `hello_world` template). "Hello World" should arrive on your WhatsApp in a few seconds. If it does, the plumbing works.

**C. Access token**
- *Temporary token* (for a first try): on the API Setup page click **Generate access token**. It expires after about 24 hours. Put it in `.env` as `WHATSAPP_ACCESS_TOKEN`.
- *Permanent token* (what you actually want):
  1. Go to <https://business.facebook.com> > **Business settings** (gear icon).
  2. **Users** > **System users** > **Add**. Name: `premium-server`. Role: **Admin**. Click **Create system user**.
  3. Select that system user > **Add assets** > **Apps** > choose your app > switch on **Manage app** (full control) > **Save**.
  4. Click **Generate token**, select your app, set **Token expiration** to **Never** (if you are offered a choice), tick **whatsapp_business_messaging**, **whatsapp_business_management** and **business_management**, and click **Generate token**.
  5. Copy the token (long, starts with `EAA`) into `.env` as `WHATSAPP_ACCESS_TOKEN`. Meta shows it once.
  6. If sending later fails with a permissions error, also give the system user access to the WhatsApp account: Business settings > **Accounts** > **WhatsApp accounts** > your account > **Add people** > the system user > full control.
  Keep the token secret: anyone who has it can send messages as your business. If it leaks, delete it from the same screen and make a new one.

**D. The booking confirmation template** (WhatsApp only lets a business start a chat with a pre-approved template)
1. Open **WhatsApp Manager** (<https://business.facebook.com/wa/manage/message-templates>) > **Message templates** > **Create template**.
2. Category: **Utility**. Name: `booking_confirmation` (exactly). Language: **English**.
3. Body, pasted exactly (it is also in `src/notify/templates.js`):

   > Hello {{1}}, thank you for booking with Premium Tours and Travels. Your booking reference is {{2}} for {{3}}, departing {{4}}. Our team is reviewing your request and will confirm shortly. We will send your trip updates here.

4. When asked for sample values: `Aisha`, `FT-AB12CDE`, `Dubai Luxe Escape`, `12 Oct 2026`.
5. Submit. Approval usually takes minutes, sometimes up to a day. Wait until the status is **Active**.
6. If you picked "English (US)" instead of "English", add `WHATSAPP_TEMPLATE_LANGUAGE=en_US` to `.env` (the default is `en`).

**Limits of the test number:** it can only message the (up to 5) numbers you verified, so real clients will not receive WhatsApp messages until you register your business's own phone number in WhatsApp Manager (and later complete Meta business verification for higher volume).
Replies from customers do not appear in any phone app: with the Cloud API they go to a webhook, which is not built. That is why the message does not invite replies.

## 3. Lines for `server/.env`

Already there (log mode, safe): `NOTIFY_MODE=log`, `AGENCY_EMAIL`, `EMAIL_FROM`, `NOTIFY_TEST_EMAIL`, `NOTIFY_TEST_WHATSAPP`.
When you have the keys, fill in these three and change the mode:

```
NOTIFY_MODE=live
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Restart the server after editing `.env`. The start-up line tells you what is on:
`Notifications: LIVE mode. email on, WhatsApp on, agency alerts on.`

## 4. Testing in live mode, in this order

```
npm run notify:check -- --email-only      # a test email to NOTIFY_TEST_EMAIL
npm run notify:check -- --whatsapp-only   # hello_world to NOTIFY_TEST_WHATSAPP
npm run notify:check -- --whatsapp-only --template booking_confirmation   # once the template is Active
```

Then submit a real booking on the site (or ask Claude to). A failed step prints the reason and what to do about it. The usual ones:

| Message | Meaning |
| --- | --- |
| `Resend 403 ... only send testing emails to your own email address` | You are sending to someone other than your Resend account email. Verify a domain, or use your own address. |
| `Resend 401 ... API key is invalid` | Wrong or deleted `RESEND_API_KEY`. |
| `WhatsApp error 190` | The token expired (temporary ones last 24 h) or is wrong. |
| `WhatsApp error 131030` | The number is not on the recipient list (step B). |
| `WhatsApp error 132001` | The template does not exist in that language, or is not approved yet (step D). |
| `WhatsApp error 100` | Wrong `WHATSAPP_PHONE_NUMBER_ID` (use the Phone number ID from API Setup). |

## Not built yet (Phase 4)

The scheduled messages (weather 2 days before, flight-day morning, "Welcome to Dubai" after landing, check-ins every 15 days) and the cron endpoint that triggers them.
They will reuse everything here, and need their own templates, which will be listed in `src/notify/templates.js`.
Failed messages can already be retried with `notifications.retryFailed()`, which the cron endpoint will call.
