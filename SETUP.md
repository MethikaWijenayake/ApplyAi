# ApplyAI — Part 1: Complete Setup Guide
# READ THIS ENTIRE FILE BEFORE TOUCHING ANYTHING

This guide is written assuming you have ZERO prior setup.
Follow every step in order. Do not skip anything.
Every command in a code block must be typed EXACTLY as shown.

---

# SECTION A — INSTALL REQUIRED SOFTWARE ON YOUR COMPUTER

Before writing a single line of code, you need 3 tools installed on your machine.
Check each one and install if missing.

---

## A1 — Node.js (version 18 or higher)

Node.js is the JavaScript runtime that runs everything — Next.js, Prisma, the workers.

**Check if you already have it:**
Open your terminal and type:
```
node -v
```
If you see something like `v18.17.0` or `v20.x.x` you are good.
If you see "command not found" or a version below 18, install it:

**How to install Node.js:**
1. Go to https://nodejs.org
2. Click the button that says "LTS" (Long Term Support) — this is the stable version
3. Download the installer for your operating system (Windows .msi / Mac .pkg)
4. Run the installer, click through all the defaults, click Finish
5. Close your terminal completely, reopen it, and type `node -v` again
6. You should now see a version number starting with 18 or higher

---

## A2 — Docker Desktop

Docker runs PostgreSQL (your database) and Redis (your queue system) locally on your
machine without you having to install them directly. It runs them in isolated containers.

**Check if you already have it:**
```
docker -v
```
If you see something like `Docker version 24.0.5` you are good.
If not, install it:

**How to install Docker Desktop:**
1. Go to https://www.docker.com/products/docker-desktop
2. Click "Download Docker Desktop" — it detects your OS automatically
3. Run the installer
   - On Mac: drag Docker to your Applications folder, then open it from there
   - On Windows: run the .exe, follow the installer, restart if asked
4. After installation, open Docker Desktop from your Applications/Start Menu
5. Wait for it to fully start — you'll see a whale icon in your taskbar/menu bar
6. Once the whale icon is steady (not animated), Docker is ready
7. Verify in terminal: `docker -v` should now show a version

**Important:** Docker Desktop must be OPEN and RUNNING every time you work on this project.
The database won't work if Docker is closed.

---

## A3 — Git

Git is used for version control (saving snapshots of your code).

**Check if you already have it:**
```
git -v
```
If you see a version number, you're good.

**How to install Git:**
- Mac: Run `xcode-select --install` in terminal (installs developer tools including Git)
- Windows: Download from https://git-scm.com/download/win and run the installer

---

# SECTION B — CREATE THE PROJECT

---

## B1 — Choose Where Your Project Will Live

Decide on a folder on your computer where you want the project to be.
Most developers use a folder called `projects` or `code` in their home directory.

**Create and navigate to that folder:**

On Mac/Linux:
```
mkdir -p ~/projects
cd ~/projects
```

On Windows (in PowerShell):
```
mkdir C:\projects
cd C:\projects
```

---

## B2 — Create the Next.js App

This single command creates the entire Next.js project structure with all the right settings:

```
npx create-next-app@14 applyai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**What this command does:**
- `npx create-next-app@14` — downloads and runs the Next.js 14 project creator
- `applyai` — names your project folder "applyai"
- `--typescript` — sets up TypeScript (typed JavaScript, catches errors early)
- `--tailwind` — sets up Tailwind CSS (the styling system we use)
- `--eslint` — sets up ESLint (code quality checker)
- `--app` — uses the App Router (Next.js 14's routing system)
- `--src-dir` — puts all code inside a `src/` folder (keeps things organised)
- `--import-alias "@/*"` — lets you write `@/components/...` instead of `../../components/...`

**The command will ask you some questions. Answer exactly as follows:**
- "Ok to proceed?" → press Enter (yes)
- It may ask about the import alias — just press Enter to confirm @/*

The command takes 1-3 minutes. You'll see it downloading packages.
When it finishes, you'll see "Success! Created applyai at ..."

**Now move into the project folder:**
```
cd applyai
```

**Open the project in VS Code:**
```
code .
```

VS Code will open with your project. From this point on, use VS Code's built-in terminal
for all commands. Open it with: View → Terminal (or Ctrl+` on Windows, Cmd+` on Mac).

---

## B3 — Copy the Files from This Package Into Your Project

The ZIP you downloaded contains config files that must be placed in your project.

**How to do this:**
1. Extract/unzip the downloaded ZIP file somewhere on your computer
2. Inside the extracted folder you'll see files and folders
3. Copy ALL of them into your `applyai` project folder
4. When it asks "do you want to replace existing files?" — click YES/Replace All

**After copying, your project root should contain:**
```
applyai/
├── prisma/
│   └── schema.prisma         ← database structure definition
├── src/
│   ├── app/                  ← all the page and API route folders (empty for now)
│   ├── components/           ← UI component folders (empty for now)
│   └── lib/                  ← utility library folders (empty for now)
├── workers/
│   ├── crawlers/             ← job crawler code goes here (Part 5)
│   ├── matching/             ← job matching code goes here (Part 6)
│   ├── application/          ← application submission code goes here (Part 9)
│   └── index.ts              ← workers entry point
├── docker-compose.yml        ← starts PostgreSQL and Redis
├── .env.local.example        ← template for your secret keys
├── .gitignore                ← prevents secrets from being committed to Git
├── tsconfig.json             ← TypeScript configuration
└── package.scripts.json      ← scripts to add to your package.json
```

---

## B4 — Update the Scripts in package.json

Your project has a `package.json` file at the root. Open it in VS Code.
Find the section that says `"scripts": {` — it will have a few default scripts in it.
Replace the ENTIRE scripts section with this:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "prisma:reset": "prisma migrate reset",
  "workers:start": "ts-node --project tsconfig.json workers/index.ts"
},
```

Save the file (Ctrl+S or Cmd+S).

---

# SECTION C — INSTALL ALL DEPENDENCIES

Run each of these commands one at a time in the VS Code terminal.
WAIT for each command to fully finish before running the next one.
You'll know it's done when you see the terminal prompt (`$` or `>`) appear again.

---

## C1 — Database & ORM
```
npm install prisma @prisma/client
```
**What this does:** Prisma is the tool that talks to your database. It lets you write
TypeScript code instead of raw SQL. `@prisma/client` is the generated client you use in code.

---

## C2 — Background Job Queue
```
npm install bullmq ioredis
```
**What this does:** BullMQ is a queue system — it lets you run tasks in the background
(like crawling jobs or submitting applications) without blocking the web server.
IORedis is the Redis client that BullMQ uses underneath.

---

## C3 — Authentication
```
npm install next-auth @auth/prisma-adapter
```
**What this does:** NextAuth handles login, registration, Google OAuth, and sessions.
The Prisma adapter stores sessions in your PostgreSQL database.

---

## C4 — HTTP Requests & Web Scraping
```
npm install axios cheerio
```
**What this does:** Axios makes HTTP requests (like fetching a webpage).
Cheerio parses HTML — it's like jQuery for the server side, used to extract job data from pages.

---

## C5 — OpenAI (AI Features)
```
npm install openai
```
**What this does:** The official OpenAI SDK. Used for cover letter generation,
job matching scoring, and the email communication agent.

---

## C6 — Stripe (Payments)
```
npm install stripe @stripe/stripe-js
```
**What this does:** Stripe handles subscription billing. `stripe` is the server-side SDK,
`@stripe/stripe-js` is used on the frontend for the payment form.

---

## C7 — Email (Mailgun)
```
npm install mailgun.js form-data nodemailer
```
**What this does:** Mailgun sends and receives emails. Each user gets a unique
@mail.applyai.com address — Mailgun powers this. `form-data` is a required dependency
of mailgun.js.

---

## C8 — File Storage (AWS S3)
```
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```
**What this does:** Stores CV files securely in the cloud. When a user uploads their CV,
it goes to S3. This SDK lets your code upload and retrieve files.

---

## C9 — Input Validation
```
npm install zod
```
**What this does:** Zod validates data coming into your API routes. For example, it checks
that an email address is actually an email before you try to save it to the database.

---

## C10 — Security & Utility
```
npm install bcryptjs jsonwebtoken uuid
```
**What this does:**
- `bcryptjs` — hashes passwords so you never store them as plain text
- `jsonwebtoken` — creates and verifies JWT tokens for auth
- `uuid` — generates unique IDs

---

## C11 — File Handling
```
npm install multer pdf-parse
```
**What this does:**
- `multer` — handles file uploads coming into your API routes
- `pdf-parse` — extracts text from PDF files (used when parsing CVs)

---

## C12 — TypeScript Type Definitions
```
npm install -D @types/bcryptjs @types/jsonwebtoken @types/uuid @types/multer @types/nodemailer @types/cheerio
```
**What this does:** TypeScript needs type definitions to understand libraries written in
plain JavaScript. The `-D` flag means "dev dependency" — only needed during development.

---

## C13 — TypeScript Runner (for Workers)
```
npm install -D ts-node
```
**What this does:** `ts-node` lets you run TypeScript files directly without compiling
them first. Used to run the background workers.

---

## C14 — Browser Automation (Playwright)
```
npm install playwright
```

Then install the Chromium browser that Playwright uses:
```
npx playwright install chromium
```

**What this does:** Playwright controls a real browser in the background. It's how ApplyAI
fills in job application forms on company websites automatically.

**The second command downloads Chromium (~170MB). This is normal. Let it run fully.**
You'll see progress like "Downloading Chromium 120.0..." — just wait.

---

## C15 — UI Components (shadcn/ui)

First run the initialisation:
```
npx shadcn-ui@latest init
```

It will ask you several questions. Answer them EXACTLY like this:
- "Which style would you like to use?" → Use arrow keys to select **Default**, press Enter
- "Which color would you like to use as base color?" → Select **Slate**, press Enter
- "Would you like to use CSS variables for colors?" → Type **y**, press Enter

After init completes, install all the UI components you'll need:
```
npx shadcn-ui@latest add button card input label badge toast tabs dialog select checkbox slider switch progress avatar dropdown-menu separator sheet
```

This installs pre-built, accessible UI components into `src/components/ui/`.
It takes about a minute.

---

## C16 — Initialise Prisma
```
npx prisma init
```

This creates the `prisma/` folder. Since you already copied `schema.prisma` from this
package, it will be overwritten by Prisma's default — that's fine, because you already
have the correct `schema.prisma` file in your project from Step B3.

**Verify the schema is correct:** Open `prisma/schema.prisma` in VS Code.
It should show all the models (User, Profile, CV, Job, etc.) — NOT the default Prisma template.
If it shows the default template, copy the schema.prisma from this package again.

---

# SECTION D — GET YOUR API KEYS

This section explains exactly how to get each API key and secret.
**You do NOT need all of them for Part 1.** Only the DATABASE_URL, REDIS_URL,
NEXTAUTH_SECRET, NEXTAUTH_URL, and NEXT_PUBLIC_APP_URL are needed right now.
The rest are filled in when we reach those build parts.

---

## D1 — DATABASE_URL and REDIS_URL (needed NOW)

These come from Docker — no account needed.

The values are determined by what you put in `docker-compose.yml` (already configured).
Use these exact values for local development:

```
DATABASE_URL="postgresql://applyai:applyai_password@localhost:5432/applyai_db"
REDIS_URL="redis://localhost:6379"
```

Explanation of DATABASE_URL:
- `postgresql://` — the database type
- `applyai` — the database username (set in docker-compose.yml)
- `applyai_password` — the database password (set in docker-compose.yml)
- `localhost:5432` — your computer, port 5432 (PostgreSQL's default port)
- `applyai_db` — the database name (set in docker-compose.yml)

---

## D2 — NEXTAUTH_SECRET (needed NOW)

This is a random secret string used to encrypt session tokens. Generate one:

On Mac/Linux, run in terminal:
```
openssl rand -base64 32
```

On Windows (if openssl isn't available), go to this website and click Generate:
https://generate-secret.vercel.app/32

Copy the output (it will look like: `xK9mP2qR7vL4nJ8wE3cF6yA1tH5uG0sD`) and use it as the value.

---

## D3 — NEXTAUTH_URL and NEXT_PUBLIC_APP_URL (needed NOW)

For local development, these are just:
```
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

When you deploy to production later, you'll change these to your real domain.

---

## D4 — GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (needed in Part 2)

These let users sign in with their Google account.

**Step-by-step to get them:**
1. Go to https://console.cloud.google.com
2. Sign in with your Google account
3. At the top, click "Select a project" → click "NEW PROJECT"
4. Name it "ApplyAI" → click "CREATE"
5. Wait for it to create, then make sure "ApplyAI" is selected at the top
6. In the left sidebar, click "APIs & Services" → "OAuth consent screen"
7. Select "External" → click "CREATE"
8. Fill in:
   - App name: ApplyAI
   - User support email: your email
   - Developer contact email: your email
   - Click "SAVE AND CONTINUE" through all the steps (you can skip the scopes for now)
9. In the left sidebar, click "APIs & Services" → "Credentials"
10. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
11. Application type: "Web application"
12. Name: "ApplyAI Web Client"
13. Under "Authorised redirect URIs", click "+ ADD URI" and add:
    `http://localhost:3000/api/auth/callback/google`
14. Click "CREATE"
15. A popup shows your Client ID and Client Secret — copy both
16. GOOGLE_CLIENT_ID = the Client ID
17. GOOGLE_CLIENT_SECRET = the Client Secret

**Leave these blank for now and fill them in during Part 2.**

---

## D5 — OPENAI_API_KEY (needed in Part 3)

**Step-by-step:**
1. Go to https://platform.openai.com
2. Sign up or sign in
3. Click your profile icon (top right) → "API keys"
4. Click "+ Create new secret key"
5. Name it "ApplyAI" → click "Create secret key"
6. IMMEDIATELY copy the key — it starts with `sk-...`
   **You cannot see this key again after closing the dialog.**
7. Paste it somewhere safe (like a password manager)

**Note:** You need to add a payment method to use the API.
Go to "Billing" → "Payment methods" → add a credit card.
OpenAI charges per use — for development this will be under $5.

**Leave this blank for now and fill it in during Part 3.**

---

## D6 — MAILGUN_API_KEY and MAILGUN_DOMAIN (needed in Part 4)

Mailgun handles email sending and receiving for the platform.

**Step-by-step:**
1. Go to https://www.mailgun.com → click "Sign Up Free"
2. Create an account (email + password, verify your email)
3. Once logged in, you're on the dashboard
4. To get your API key:
   - Click your profile (top right) → "API Security"
   - Under "Mailgun API keys", click "Add new key"
   - Description: "ApplyAI" → click "Create Key"
   - Copy the key that appears (starts with `key-...`)
5. To set up your sending domain:
   - In the sidebar click "Sending" → "Domains"
   - For testing you'll see a sandbox domain like `sandbox123abc.mailgun.org`
   - For production you'll add your real domain (e.g. `mail.applyai.com`)
   - MAILGUN_DOMAIN = your sandbox domain for now

**Leave these blank for now and fill them in during Part 4.**

---

## D7 — AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION (needed in Part 3)

AWS S3 stores the users' CV files securely in the cloud.

**Step-by-step:**
1. Go to https://aws.amazon.com → click "Create an AWS Account"
2. Fill in email, password, account name → continue through signup
3. You'll need to verify a phone number and add a credit card
   (S3 storage is very cheap — under $1/month for this app's usage)
4. Once logged in to the AWS Console (console.aws.amazon.com):
5. **Create an S3 bucket:**
   - Search "S3" in the search bar → click "S3"
   - Click "Create bucket"
   - Bucket name: `applyai-cvs-yourname` (must be globally unique — add your name)
   - Region: choose one close to you (e.g. us-east-1 for US, eu-west-1 for Europe)
   - Leave all other settings as default → click "Create bucket"
   - AWS_BUCKET_NAME = the name you chose
   - AWS_REGION = the region you chose (e.g. `us-east-1`)
6. **Create an IAM user for API access:**
   - Search "IAM" in the search bar → click "IAM"
   - Click "Users" in the sidebar → "Create user"
   - Username: `applyai-s3-user` → click Next
   - Select "Attach policies directly"
   - Search for "AmazonS3FullAccess" and check it → click Next → "Create user"
   - Click on the user you just created
   - Click "Security credentials" tab
   - Click "Create access key"
   - Select "Application running outside AWS" → Next → Create
   - Copy the Access Key ID and Secret Access Key
   - AWS_ACCESS_KEY_ID = the Access Key ID
   - AWS_SECRET_ACCESS_KEY = the Secret Access Key
   - **You cannot see the Secret Access Key again after this screen**

**Alternative (easier for beginners): Use Cloudflare R2**
Cloudflare R2 is cheaper than S3 and has a generous free tier (10GB free).
If you prefer R2, we'll configure it in Part 3 with special instructions.

**Leave these blank for now and fill them in during Part 3.**

---

## D8 — STRIPE_SECRET_KEY and related keys (needed in Part 12)

Stripe handles subscription payments.

**Step-by-step:**
1. Go to https://stripe.com → click "Start now"
2. Create an account (email + password, verify email)
3. Once on the dashboard, make sure you're in "Test mode"
   (toggle in the top right — should say "Test mode")
4. **Get your secret key:**
   - Click "Developers" (top right) → "API keys"
   - Copy the "Secret key" (starts with `sk_test_...`)
   - STRIPE_SECRET_KEY = this key
5. **Create subscription products (you'll do this in Part 12):**
   - STRIPE_PRO_PRICE_ID and STRIPE_PREMIUM_PRICE_ID come from here
6. **Webhook secret (set up in Part 12):**
   - STRIPE_WEBHOOK_SECRET is created when you set up a webhook endpoint

**Leave all Stripe keys blank for now. Fill them in during Part 12.**

---

# SECTION E — SET UP ENVIRONMENT VARIABLES

Now that you understand what each key is, set up your local environment file.

---

## E1 — Create .env.local

In the VS Code terminal:
```
cp .env.local.example .env.local
```

This copies the example file to `.env.local` — the actual file your app reads.
`.env.local` is in `.gitignore` so it will NEVER be committed to Git.

---

## E2 — Fill in the Values You Have Right Now

Open `.env.local` in VS Code (click it in the file explorer on the left).
Fill in these values — they're all you need for Part 1:

```
DATABASE_URL="postgresql://applyai:applyai_password@localhost:5432/applyai_db"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="paste-the-value-from-step-D2-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Leave all other values as empty strings `""` for now.

Save the file (Ctrl+S / Cmd+S).

---

# SECTION F — START THE DATABASE AND REDIS

Docker must be open and running before this step.
Look for the Docker whale icon in your taskbar/menu bar.

---

## F1 — Start PostgreSQL and Redis

In the VS Code terminal:
```
docker compose up -d
```

**What this does:** Downloads the PostgreSQL and Redis images (first time only, ~200MB)
and starts them as background services.

**First run:** This may take 2-3 minutes as it downloads the images.
You'll see output like "Pulling postgres..." — just wait.

**Verify they started correctly:**
```
docker compose ps
```

You should see output like this:
```
NAME                STATUS
applyai_postgres    Up 30 seconds (healthy)
applyai_redis       Up 30 seconds (healthy)
```

Both must say "Up" and ideally "healthy". If you see "Exit" or "Error", something went wrong:
- Make sure Docker Desktop is fully open (whale icon in taskbar, not animating)
- Make sure port 5432 and 6379 are not in use by other programs
- Try: `docker compose down` then `docker compose up -d` again

---

# SECTION G — SET UP THE DATABASE

---

## G1 — Generate the Prisma Client

This command reads your `prisma/schema.prisma` file and generates TypeScript code
that lets you interact with the database:

```
npm run prisma:generate
```

You should see: "Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client"

---

## G2 — Create the Database Tables

This command reads your schema and creates all the actual tables in PostgreSQL:

```
npm run prisma:migrate
```

It will ask: **"Enter a name for the new migration:"**
Type: `init` and press Enter.

You should see:
```
✔ Generated Prisma Client
✔ Applying migration `20240101000000_init`

The following migration(s) have been applied:
migrations/
  └─ 20240101000000_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

If you see an error about "Can't reach database server":
- Make sure `docker compose ps` shows postgres as "Up"
- Make sure DATABASE_URL in `.env.local` exactly matches the docker-compose.yml credentials

---

## G3 — Verify the Database Was Created Correctly

Open Prisma Studio — a visual database browser:
```
npm run prisma:studio
```

A browser tab opens at http://localhost:5555

In the left sidebar, you should see all 13 tables:
- users
- profiles
- cvs
- assigned_emails
- application_rules
- jobs
- job_matches
- applications
- emails
- notifications
- accounts
- sessions
- verification_tokens

If all 13 appear — your database is set up perfectly.
Press Ctrl+C in the terminal to stop Prisma Studio when done.

---

# SECTION H — VERIFY THE PROJECT RUNS

---

## H1 — Start the Development Server

```
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
- Ready in 2.3s
```

Open your browser and go to: http://localhost:3000

You should see the default Next.js welcome page. That's fine — the real UI is built in later parts.

Press Ctrl+C to stop the server when you're done checking.

---

# SECTION I — PART 1 FINAL CHECKLIST

Go through every item below. Only move to Part 2 when ALL boxes can be checked.

□ `node -v` shows version 18 or higher
□ Docker Desktop is installed and running (whale icon in taskbar)
□ `npm run dev` starts without errors at http://localhost:3000
□ `docker compose ps` shows BOTH postgres AND redis as "Up"
□ `npm run prisma:studio` opens at http://localhost:5555 showing all 13 tables
□ `.env.local` exists and has DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL filled in
□ The `workers/` folder exists at the project root
□ `src/components/ui/` contains shadcn component files (button.tsx, card.tsx, etc.)
□ `prisma/schema.prisma` shows all 10 models + 3 NextAuth models (not the default template)
□ No red errors in the VS Code terminal

---

# TROUBLESHOOTING

**"Cannot connect to the Docker daemon" or "Docker is not running"**
→ Open Docker Desktop from your Applications/Start Menu and wait for it to fully load.
   The whale icon must be steady, not spinning. Then retry.

**"Port 5432 already in use"**
→ You have another PostgreSQL running on your machine.
   Option 1: Stop it (if you know how)
   Option 2: Change the port in docker-compose.yml from 5432 to 5433, and update
   DATABASE_URL in .env.local to use 5433 instead.

**"Port 6379 already in use"**
→ Same issue with Redis. Change 6379 to 6380 in docker-compose.yml and REDIS_URL.

**"npm run prisma:migrate" fails with "P1001: Can't reach database server"**
→ Step 1: Run `docker compose ps` — is postgres showing as "Up"?
   Step 2: Check DATABASE_URL in .env.local — does the username/password/port match
   exactly what's in docker-compose.yml?
   Step 3: Try `docker compose down` then `docker compose up -d` then retry.

**"npx create-next-app" fails or hangs**
→ Your internet connection may be slow. Try again.
   If npm is the issue: `npm cache clean --force` then retry.

**"shadcn-ui init" fails with "Could not find a Next.js config file"**
→ You must be inside the `applyai` folder when running this. Run `pwd` to check your location.

**"Playwright install" fails**
→ Some antivirus software blocks it. Temporarily disable antivirus, run the install, re-enable.
   Or try: `npx playwright install chromium --force`

**schema.prisma shows the default template (datasource only, no models)**
→ The file from this package didn't copy correctly. Open schema.prisma, select all (Ctrl+A),
   delete everything, then paste the content from this package's schema.prisma file.

---

When your checklist is all ticked, go back to Claude and say "Part 2 ready".
