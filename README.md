# Al Shujaiat Foundation Jammu & Kashmir (ASFJK)

> **Official Web Platform & Administrative Governance Portal**  
> Empowering communities across Jammu & Kashmir through humanitarian relief, healthcare, education, sustainable infrastructure, and transparent welfare.

---

## 📁 Repository File & Directory Structure

The codebase is organized into modular domains, strictly separating public-facing routes, donor portals, executive administration, reusable UI components, services, and backend integration.

```text
asfjk-web/
├── api/                                # Serverless & Edge API endpoints
│   └── send-email.ts                   # Resend / Nodemailer transactional email handler
│
├── public/                             # Static public assets (served at root)
│   ├── images/                         # Official branding, banners, seals, & signatures
│   ├── CNAME                           # Custom production domain (www.asfjk.org)
│   ├── _redirects                      # SPA routing fallback rules
│   ├── logo.png                        # Primary brand emblem
│   ├── manifest.json                   # PWA web app manifest
│   ├── offline.html                    # Offline service worker fallback page
│   ├── robots.txt                      # Search engine crawler governance
│   ├── sitemap.xml                     # XML sitemap for SEO indexing
│   └── sw.js                           # Progressive Web App service worker
│
├── scripts/                            # Operational & build-time utility scripts
│   ├── blendNewLogo.cjs                # Logo alpha-channel blending
│   ├── computeHashes.cjs               # PBKDF2 credential hash verification
│   ├── cropLogo.cjs                    # Asset dimensions trimmer
│   ├── genLogo.js                      # Canvas logo generator
│   ├── processSealAndSignature.cjs     # Official credential seal processing
│   └── typecheck.cjs                   # TypeScript compiler check
│
├── src/                                # Application Source Code
│   ├── components/                     # Reusable React UI Components
│   │   ├── admin/                      # Admin-specific widgets (TOTP setup, etc.)
│   │   ├── campaign/                   # Emergency & seasonal appeal cards
│   │   ├── common/                     # Global utilities (CookieConsent, ScrollToTop, etc.)
│   │   ├── donation/                   # Multi-currency donation modal & gateway forms
│   │   ├── layout/                     # Shell components (Navbar, Footer, MobileBottomNav)
│   │   ├── leadership/                 # Board of Trustees & Executive profiles
│   │   ├── membership/                 # Patron membership cards & digital passes
│   │   ├── project/                    # Humanitarian project cards & progress indicators
│   │   └── volunteer/                  # Volunteer applications & digital ID card preview
│   │
│   ├── contexts/                       # React Context Providers & State Machines
│   │   ├── AuthContext.tsx             # RBAC authentication, PBKDF2 verification, & sessions
│   │   ├── CurrencyContext.tsx         # Real-time multi-currency converter (USD, INR, EUR, etc.)
│   │   ├── DatabaseContext.tsx         # Centralized reactive datastore & local persistence
│   │   ├── LanguageContext.tsx         # Multilingual i18n support (English & Urdu RTL)
│   │   ├── ThemeContext.tsx            # Dark / Light theme manager
│   │   └── ToastContext.tsx            # Global actionable notifications
│   │
│   ├── data/                           # Static & Seed Data Repositories
│   │   ├── initialData.ts              # Seed projects, trustees, audit reports, & settings
│   │   └── translations.ts             # English & Urdu localization strings
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   ├── useCountUp.ts               # Animated statistics counter
│   │   └── usePageMeta.ts              # Dynamic SEO meta tags, title, & social graph
│   │
│   ├── lib/                            # Third-party SDK initializers
│   │   └── supabaseClient.ts           # Supabase client singleton
│   │
│   ├── pages/                          # Application Route Views
│   │   ├── admin/                      # Executive Administrative Suite
│   │   │   ├── AdminAuthGate.tsx       # Secured staff 2FA authentication gate
│   │   │   └── AdminPortal.tsx         # Comprehensive multi-tab foundation management portal
│   │   ├── donor/                      # Donor Experience & Self-Service
│   │   │   ├── AuthPages.tsx           # Donor login, registration, & password reset
│   │   │   ├── DonorDashboardPage.tsx  # Personal giving dashboard & tax history
│   │   │   ├── DonorProfilePage.tsx    # Donor settings, profile, & tax identifiers
│   │   │   ├── MyDonationsPage.tsx     # Historic donation archive
│   │   │   ├── MyReceiptsPage.tsx      # Section 80G tax receipt downloads
│   │   │   └── MyRecurringPage.tsx     # Active recurring pledge manager
│   │   └── public/                     # Public Foundation Website
│   │       ├── AboutPage.tsx           # Foundation history, mission, & charter
│   │       ├── CampaignDetailsPage.tsx # Specific emergency appeal details
│   │       ├── CampaignsPage.tsx       # All active appeals & urgent campaigns
│   │       ├── ContactPage.tsx         # Inquiries, office locations, & feedback
│   │       ├── DonatePage.tsx          # Dedicated multi-tier donation gateway
│   │       ├── FAQPage.tsx             # Donor, volunteer, & tax FAQ
│   │       ├── HomePage.tsx            # Landing page with hero, stats, & highlights
│   │       ├── ImpactPage.tsx          # Beneficiary numbers, reports, & metrics
│   │       ├── LeadershipPage.tsx      # Verified Board of Trustees & Executive directory
│   │       ├── LegalPages.tsx          # Privacy Policy, Terms of Service, & Refunds
│   │       ├── MembershipPage.tsx      # Annual & lifetime foundation membership
│   │       ├── NewsPage.tsx            # Press releases & foundation news
│   │       ├── NotFoundPage.tsx        # 404 error page
│   │       ├── OurWorkPage.tsx         # Programmatic sectors & welfare pillars
│   │       ├── PartnersPage.tsx        # Corporate CSR & institutional partners
│   │       ├── ProjectDetailsPage.tsx  # Project milestones, budget, & field gallery
│   │       ├── ProjectsPage.tsx        # Searchable program directory
│   │       ├── StoriesPage.tsx         # Field beneficiary impact stories
│   │       ├── TransparencyPage.tsx    # Statutory filings, 80G/12A, & audit reports
│   │       └── VolunteerPage.tsx       # Volunteer registration & deployment
│   │
│   ├── services/                       # Business Logic, Security, & Document Generators
│   │   ├── emailService.ts             # Transactional email dispatcher
│   │   ├── logoAsset.ts                # High-res base64 brand emblem for PDF generation
│   │   ├── membershipCardService.ts    # jsPDF membership card generator
│   │   ├── paymentService.ts           # Razorpay & Stripe gateway coordinator
│   │   ├── receiptService.ts           # Section 80G official PDF tax receipt engine
│   │   ├── reportService.ts            # Excel & CSV financial ledger exports
│   │   ├── securityService.ts          # Session storage, audit log hashing, & rate limiting
│   │   ├── stampAsset.ts               # Official seal & authorized signature asset
│   │   ├── totpService.ts              # RFC 6238 Time-based One-Time Password engine
│   │   ├── turnstileService.ts         # Cloudflare bot protection validation
│   │   ├── validationService.ts        # Input sanitization & PAN/IFSC format validators
│   │   └── volunteerIdCardService.ts   # jsPDF official volunteer ID card generator
│   │
│   ├── tests/                          # Automated Quality Assurance & Security Tests
│   │   └── security.test.ts            # Vitest authorization, RBAC, & validation test suite
│   │
│   ├── types/                          # TypeScript Type Definitions & Interfaces
│   │   └── index.ts                    # Canonical data schemas (Projects, Donors, Receipts, etc.)
│   │
│   ├── utils/                          # Utility Helpers
│   │   └── imageOptimizer.ts           # Responsive image formatting
│   │
│   ├── App.tsx                         # Core application router & shell wrapper
│   ├── index.css                       # Global Tailwind CSS directives & custom animations
│   ├── main.tsx                        # Application mount point & root provider tree
│   └── vite-env.d.ts                   # Vite environment typings
│
├── supabase/                           # Supabase Database & Edge Functions
│   ├── functions/                      # Deno Edge Functions
│   │   ├── create-razorpay-order/      # Server-side order creation
│   │   ├── razorpay-webhook/           # Asynchronous payment confirmation webhook
│   │   └── verify-razorpay-payment/    # Cryptographic HMAC-SHA256 signature verification
│   └── schema.sql                      # Complete PostgreSQL schema with Row-Level Security (RLS)
│
├── .env.example                        # Environment variable documentation template
├── index.html                          # Single-Page Application entry document
├── package.json                        # NPM package manifest & scripts
├── tailwind.config.js                  # Tailwind design tokens, typography, & animations
├── tsconfig.json                       # TypeScript compiler configuration
├── vercel.json                         # Vercel deployment headers & SPA rewrites
└── vite.config.ts                      # Vite build pipeline & chunking optimization
```

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 (TypeScript)
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS 3 with custom brand tokens & keyframe animations
- **Iconography**: Lucide React
- **Document Generation**: jsPDF & jsPDF-AutoTable (Section 80G Tax Receipts, Volunteer ID Cards, Membership Cards)
- **Data Export**: SheetJS (XLSX) & CSV
- **Backend / Database**: Supabase (PostgreSQL with Row-Level Security) & Supabase Edge Functions (Deno)
- **Payments**: Razorpay (UPI, Netbanking, Cards), Stripe (International Cards), & Direct Bank Transfer (NEFT/RTGS)
- **Test Framework**: Vitest

---

## 🚀 Available NPM Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local development server (`http://localhost:3000` or `3001`) |
| `npm run build` | Compiles TypeScript and builds production distribution in `/dist` |
| `npm test` | Runs the full Vitest automated security & authorization test suite |
| `npm run preview` | Previews the production build locally |

---

## 📜 Compliance & Statutory Accreditations

- **Section 80G Tax Exemption**: `CIT(EXEMPTION), CHANDIGARH / 80G / 2019-20 / A / 10234`
- **Section 12A Registration**: `TRUST / 12A / 2018-19 / A / 8891`
- **NITI Aayog NGO Darpan**: `JK/2018/0190361`
- **FCRA Registration**: `FCRA-PRI-08912/2021`
