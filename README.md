# NotifyHub

Centralized notification gateway for **Email** and **WhatsApp**. Multiple projects can send notifications through one API with per-project API keys, audit logs, and rate limiting.

## Stack

- Node.js 18+, TypeScript, Express
- MongoDB (Atlas free tier) — API keys & notification logs
- Nodemailer + Gmail (free) — email delivery
- WhatsApp: Meta Cloud API (free dev tier) or CallMeBot (free, dev/personal)

## Quick start

```bash
npm install
cp .env.example .env   # configure your values
npm run dev
```

On first start, if no API keys exist, a bootstrap key is printed to the console. Save it immediately.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_USER` | Yes | Gmail address |
| `EMAIL_PASSWORD` | Yes | Gmail [App Password](https://myaccount.google.com/apppasswords) |
| `DB_*` or `MONGODB_URI` | Yes | MongoDB connection |
| `MASTER_API_KEY` | For admin | Protects `/v1/admin/*` |
| `WHATSAPP_*` or `CALLMEBOT_*` | For WhatsApp | See below |

## API authentication

All notification routes require an API key:

```http
Authorization: Bearer nh_<keyId>.<secret>
```

or

```http
X-API-Key: nh_<keyId>.<secret>
```

### Create API keys (admin)

```bash
curl -X POST http://localhost:3000/v1/admin/api-keys \
  -H "Authorization: Bearer YOUR_MASTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"my-app","name":"production"}'
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check (DB + email) |
| GET | `/ready` | — | Readiness probe |
| POST | `/v1/notifications/email` | API key | Send email (raw or template) |
| POST | `/v1/notifications/templates` | API key | Create email template |
| GET | `/v1/notifications/templates` | API key | List email templates |
| GET | `/v1/notifications/templates/:templateId` | API key | Get email template |
| PUT | `/v1/notifications/templates/:templateId` | API key | Update email template |
| DELETE | `/v1/notifications/templates/:templateId` | API key | Delete email template |
| POST | `/v1/notifications/whatsapp` | API key | Send WhatsApp |
| POST | `/v1/notifications/whatsapp/media` | API key | Send WhatsApp media |
| POST | `/v1/notifications/batch` | API key | Batch send (max 50) |
| GET | `/v1/notifications/logs` | API key | List logs for project |
| POST | `/v1/admin/api-keys` | Master key | Create API key |
| DELETE | `/v1/admin/api-keys` | Master key | Revoke API key |
| GET | `/v1/admin/api-keys` | Master key | List API keys |

### Send email (raw HTML/text)

```bash
curl -X POST http://localhost:3000/v1/notifications/email \
  -H "Authorization: Bearer nh_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello",
    "text": "Message body"
  }'
```

### Email templates

Templates are stored in MongoDB per project. Each template row gets an `_id` from the database — use that value as `templateId` when sending. Use Handlebars placeholders like `{{name}}`.

**Create template**

```bash
curl -X POST http://localhost:3000/v1/notifications/templates \
  -H "Authorization: Bearer nh_..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Email",
    "subject": "Welcome, {{name}}!",
    "html": "<html><body><h2>Hi {{name}}</h2><p>Thanks for joining.</p></body></html>",
    "text": "Hi {{name}}, thanks for joining."
  }'
```

Response includes `_id` (example: `675a1b2c3d4e5f6789012345`). Use that as `templateId`.

**Send email using template**

```bash
curl -X POST http://localhost:3000/v1/notifications/email \
  -H "Authorization: Bearer nh_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "templateId": "675a1b2c3d4e5f6789012345",
    "variables": {
      "name": "Ankit"
    }
  }'
```

Optional fields when sending with a template:
- `subject` — override/render a custom subject
- `replyTo` — reply-to address

### Send WhatsApp

```bash
curl -X POST http://localhost:3000/v1/notifications/whatsapp \
  -H "Authorization: Bearer nh_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "919876543210",
    "message": "Hello from NotifyHub"
  }'
```

Phone numbers: country code + number, digits only (e.g. `919876543210`).

### Send WhatsApp media

```bash
curl -X POST http://localhost:3000/v1/notifications/whatsapp/media \
  -H "Authorization: Bearer nh_..." \
  -F "to=15551234567" \
  -F "mediaType=document" \
  -F "caption=Invoice attached" \
  -F "fileName=invoice.pdf" \
  -F "file=@./invoice.pdf"
```

## WhatsApp setup (free)

### Option A — Meta WhatsApp Cloud API (recommended)

1. Create a [Meta Developer](https://developers.facebook.com/) app with WhatsApp.
2. Add test recipients in the WhatsApp → API Setup panel.
3. Set `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` in `.env`.

### Option B — CallMeBot (dev/personal)

1. Follow [CallMeBot setup](https://www.callmebot.com/blog/free-api-whatsapp-messages/).
2. Set `CALLMEBOT_API_KEY` and optionally `CALLMEBOT_PHONE`.

### Option C — WireWeb

1. Set `WIREWEB_API_KEY`
2. Set `WIREWEB_SESSION_ID` (a session on the WireWeb provider)
3. Optionally set `WIREWEB_BASE_URL` and `WIREWEB_SEND_ENDPOINT` (defaults match `https://app.wireweb.co.in` and `/api/v1/messages`)

WireWeb request used by NotifyHub:

```bash
curl -X POST https://app.wireweb.co.in/api/v1/messages \
  -H "Authorization: Bearer <WIREWEB_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"ws_h7x2q","to":"15551234567","text":"Deployment complete"}'
```

Environment variables:

```env
WIREWEB_API_KEY=your-api-key
WIREWEB_SESSION_ID=your-session-id
WIREWEB_BASE_URL=https://app.wireweb.co.in
WIREWEB_SEND_ENDPOINT=/api/v1/messages
WIREWEB_MEDIA_ENDPOINT=/api/v1/media
```

## Project structure

```
src/
├── config/          # env, database
├── controllers/     # HTTP handlers
├── lib/             # mongo URI builder
├── middleware/      # auth, validation, errors
├── models/          # Mongoose schemas
├── providers/       # WhatsApp provider adapters
├── repositories/    # data access
├── routes/          # route definitions
├── services/        # business logic
├── types/
├── utils/
├── app.ts
└── server.ts
```

## Production

```bash
npm run build
npm start
```

- Set `NODE_ENV=production`
- Use a strong `MASTER_API_KEY`
- Configure Meta WhatsApp for production messaging
- Run behind HTTPS (reverse proxy)

## License

MIT
