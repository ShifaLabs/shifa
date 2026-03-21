# ─── Database ───────────────────────────────────────────
MONGO_URI=
DB_NAME=

# ─── Auth (NextAuth) ────────────────────────────────────
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# ─── Google OAuth ───────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── Email (SMTP / Gmail App Password) ──────────────────
EMAIL_USER=
EMAIL_PASS=

# ─── SSLCommerz Payment ─────────────────────────────────
STORE_ID=
STORE_PASSWD=
SSL_MODE=sandbox           # "sandbox" or "production"
SANDBOX_LINK=              # SSLCommerz sandbox init URL (optional in production)

# ─── Cloudinary (Image Upload) ──────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=

# ─── Stream.io (Video Calls) ────────────────────────────
STREAM_API_KEY=
STREAM_SECRET=
STREAM_WEBHOOK_SECRET=     # optional — for verifying Stream webhooks

# ─── Cron Job Security ──────────────────────────────────
CRON_SECRET=               # used by /api/video/no-show to protect the cron endpoint

# ─── App ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=       # e.g. http://localhost:3000 or https://shifa-medi.vercel.app
NODE_ENV=development       # development | production | test