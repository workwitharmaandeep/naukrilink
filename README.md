# NEXAURA — AI-Powered Internship Discovery & Career Guidance Platform

> **Tagline:** *"Smarter Internships. Verified Opportunities. Guided Careers."*

NEXAURA connects forward-thinking students seeking internships with companies seeking capable interns through five integrated capabilities:
1. **Company Verification (Trust):** Real statutory checks (GSTIN format + Mod-36 checksum, CIN registry format, domain resolution, WHOIS) to ensure listings are genuine.
2. **Skill Assessment (Proof of Ability):** Timed quizzes with server-side validation and AI-assisted interviews.
3. **Smart Internship Matching (Relevance):** Explainable, weighted algorithmic matching scoring verified skills, preferences, and locations.
4. **Company-Led Mentorship (Guidance):** Scheduled slots with database-level capacity enforcement and automated reminders.
5. **Unified Student Dashboard (Control):** Live tracking of profile completeness, recommendations, applications, and skill growth.

---

## 1. Project Structure

The project is structured into two completely standalone directories:

```
naukrilink/
├── backend/                  # Node.js + Express + TypeScript + Prisma REST API
│   ├── prisma/
│   │   ├── schema.prisma     # Normalized PostgreSQL schema (29 models)
│   │   └── seed.ts           # Factual seed (Super Admin + standard skills only)
│   ├── src/
│   │   ├── config/           # Strict Zod environment & Pino logger configs
│   │   ├── db/               # Prisma singleton client
│   │   ├── middleware/       # Auth (JWT/httpOnly cookies), RBAC, rate-limit, errors
│   │   ├── modules/          # Auth, Students, Companies, Internships, Applications, Skills
│   │   ├── shared/           # Zod validation schemas, types, and constants
│   │   ├── app.ts            # Express app configuration & middleware
│   │   └── server.ts         # Entry point & HTTP server
│   ├── test/
│   │   └── unit-tests.ts     # Unit tests for matching engine & verification validators
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js 14 App Router + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/              # App Router pages (public, auth, student, company)
│   │   ├── components/       # Accessible UI primitives, Navbar, Sidebar, Badges
│   │   ├── lib/              # Axios client with auto-refresh & AuthContext
│   │   ├── shared/           # Frontend copy of types, constants, and schemas
│   │   └── styles/           # Tailwind CSS globals and tokens
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml        # Orchestrates PostgreSQL + backend + frontend
├── .env.example              # Environment variables template
└── README.md
```

---

## 2. Non-Negotiable Data Rules (No Fake Data)
- **Zero fake data:** No hardcoded or dummy users, companies, internships, quiz scores, mentors, testimonials, or statistics in code, migrations, or the UI.
- **Computed live:** All dashboards, metrics, and recommendations are computed live from real records in PostgreSQL.
- **Factual seeds only:** The database seed script initializes only **one Super Admin** account from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and factual reference taxonomy (e.g. standard skills, Indian states, industry categories).
- **Graceful empty states:** When no data exists yet, clear, friendly empty states guide the user on the next action.
- **Authentic badges:** Verification badges and match percentages are displayed *only* when calculated from real checks.

---

## 3. Data Sources & Integrations

| Data Source / Service | Purpose | Environment Variables | Fallback if Unconfigured |
|---|---|---|---|
| **Licensed GST Portal API** | Validates 15-character GSTIN format & active status | `GST_API_PROVIDER`, `GST_API_KEY`, `GST_API_URL` | Check status marked as `MANUAL_REVIEW` (no fake verification) |
| **MCA Registry Portal API** | Validates Corporate Identification Number (CIN) | `MCA_API_PROVIDER`, `MCA_API_KEY`, `MCA_API_URL` | Check status marked as `MANUAL_REVIEW` |
| **DNS / WHOIS Services** | Domain resolution and HTTPS identity verification | Built-in Node.js DNS lookup | Manual review queue in Admin Portal |
| **Anthropic Claude API** | Server-side role interview generation and structured Zod evaluation | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Disabled until key is provided |
| **SMTP Mail Server** | Nodemailer delivery of email verification & mentorship reminders | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Logs to terminal in development |
| **Local Disk Storage** | Resumes (PDF), company logos, and audit documents | `STORAGE_DRIVER=local`, `LOCAL_UPLOAD_DIR` | Local disk (`./uploads`), S3-swappable |

---

## 4. Entity Relationship Overview (29 Models)

- **Identity & Access:** `User`, `RefreshToken`, `AuditLog`, `Event`, `Notification`, `Feedback`
- **Profiles:** `StudentProfile`, `CompanyProfile`, `CollegeProfile`
- **Taxonomy & Skills:** `Skill`, `StudentSkill`, `InternshipSkill`
- **Internships & Applications:** `Internship`, `Application`, `ApplicationStatusHistory`
- **Verification Audit:** `VerificationRequest`, `VerificationCheck`, `Document`, `Report`
- **Assessments (Quizzes):** `QuizQuestion`, `QuizAttempt`, `QuizAnswer`
- **AI Interviews:** `Interview`, `InterviewMessage`, `InterviewEvaluation`
- **Matching Engine:** `MatchScore`
- **Company-Led Mentorship:** `MentorshipSession`, `MentorshipSlot`, `MentorshipEnrolment`

---

## 5. Running Locally

### Step 1: Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run test           # Runs 5 unit test suites
npm run dev            # Starts backend on http://localhost:5000/api/v1
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev            # Starts frontend on http://localhost:3000
```

### Docker Compose
To run PostgreSQL, Backend, and Frontend all together:
```bash
docker compose up --build
```
