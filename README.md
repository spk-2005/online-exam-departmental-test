# 📝 Online Exam Departmental Test Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.x-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Twilio](https://img.shields.io/badge/Twilio-Notifications-F22F46?style=for-the-badge&logo=twilio)](https://www.twilio.com/)
[![Deployed on Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify)](https://departmental-tests.netlify.app)

A modern, full-stack, Computer-Based Test (CBT) and exam preparation platform specifically designed for candidates appearing in **Government Departmental Tests** (such as Andhra Pradesh & Telangana departmental exams). 

The platform offers a bilingual (English & Telugu) test experience, automated real-time evaluation, live leaderboards, verifiable response sheets, downloadable PDF scorecards, seamless UPI enrollment, and Twilio-powered admin notifications.

---

## 🌟 Key Features

### 🎯 1. Realistic Computer-Based Test (CBT) Engine
- **Accurate Exam Simulation**: Designed to emulate official government departmental online examinations.
- **Real-Time Countdown Timer**: Tracks remaining time dynamically and triggers auto-submission upon timeout.
- **Interactive Question Palette**: Visual color-coded status tracking (Answered, Flagged for Review, Not Visited, Current Question).
- **Anti-Cheat & Accidental Navigation Protection**: Prevents unintentional page reloads (disables `F5`, `Ctrl+R`, `Ctrl+F5`) and includes route change confirmation guards.

### 🌐 2. Bilingual Interface (English & తెలుగు)
- Dual-language support across user instructions, guidance banners, dashboard controls, and system alerts to maximize accessibility for government employees and aspirants.

### 🚀 3. Free Demo / Sample Test
- Prospective students can test-drive the CBT examination environment with sample departmental questions without requiring an initial login or payment.

### 🔐 4. User Authentication & Attempt Quota Management
- Secure JWT-based authentication with 24-hour persistent sessions.
- Granular tracking of candidate test attempts per paper and group, preventing unauthorized or over-quota attempts.

### 🏆 5. Live Leaderboard & Performance Analytics
- Real-time ranking of test takers with comprehensive sorting and filtering:
  - Filter by Exam Group and individual Test Paper.
  - Search candidates by name.
  - Sort by Percentage, Raw Score, Time Taken, or Completion Date.

### 📋 6. Instant Response Sheet & Answer Explanations
- Comprehensive question-by-question breakdown after submission:
  - Selected option vs. correct answer.
  - Status indicators (Correct, Incorrect, Unattempted).
  - Detailed answer explanations and references.

### 📄 7. Instant PDF Scorecard Generation
- Server-side PDF certificate/scorecard generation using **jsPDF** and **jspdf-autotable**.
- Includes candidate info, test category, score breakdown, accuracy percentage, time taken, and official grading badge.

### 💳 8. Enrollment & Payment Verification
- Payment registration with group selection and UPI QR scanner integration.
- Instant submission with payment transaction screenshot upload (Base64 encoding).
- Automated SMS/WhatsApp notifications sent to administration via **Twilio** upon new payment submissions.
- Built-in compliance pages: Terms & Conditions, Privacy Policy, Refund Policy, Return Policy, and Shipping Policy.

### 🛠️ 9. In-App Issue & Error Reporting
- Students can report question errors, key discrepancies, or technical issues directly through an integrated feedback system with auto-filled candidate credentials.

---

## 📚 Supported Departmental Exam Groups

| Group Code | Description | Key Focus Papers |
| :--- | :--- | :--- |
| **EOT GROUP** | Executive Officers Test | Departmental manuals, service rules, and executive procedures |
| **GOT GROUP** | Gazetted Officers Test | Accounts code, financial code, and administrative acts |
| **EOT & GOT GROUP** | Combined Comprehensive Bundle | Full access to both EOT and GOT test series |
| **CODE 8 & 10 GROUP** | Special Departmental Code Tests | Departmental test for sub-ordinate officers |
| **CODE 146 & 148 GROUP** | Specialized Accounts Papers | Treasury code, local acts, and specialized accounts |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (Pages Router)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with PostCSS & Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **PDF Generation**: `jspdf` & `jspdf-autotable`
- **SMS & WhatsApp Alerts**: [Twilio SDK](https://www.twilio.com/)
- **Deployment**: [Netlify](https://www.netlify.com/) (with Netlify Functions support)

---

## 📁 Project Directory Structure

```text
online-exam-departmental-test/
├── .netlify/                      # Netlify serverless functions & configuration
│   └── functions/
│       └── notify.js              # Background notification function
├── data/                          # Seed data & submission logs
│   └── submissions.json
├── pages/                         # Next.js Pages & Views
│   ├── _app.js                    # Custom App wrapper & global styles
│   ├── _document.js               # Document head configuration
│   ├── index.js                   # Landing page (Login, Demo CTA, Leaderboard)
│   ├── login.js                   # Candidate login portal
│   ├── dashboard.js               # User dashboard & remaining attempts
│   ├── instructions.js            # Exam guidelines & candidate undertaking
│   ├── instructions2.js           # Supplementary test instructions
│   ├── quiz.js                    # Main CBT Examination engine
│   ├── Responsesheet.js           # Post-exam review & detailed answers
│   ├── Samplequiz.js              # Free public demo test engine
│   ├── SampleResponsesheet.js     # Response review for demo tests
│   ├── Sampletestsavailable.js    # Directory of public sample tests
│   ├── Leaderboard.js             # Live ranks & student performance
│   ├── Paymentform.js             # Enrollment form & UPI screenshot submission
│   ├── paymentredirect.js         # Post-payment status redirect
│   ├── IssueReportingForm.js      # Student grievance & feedback form
│   ├── Contactpage.js             # Support page
│   ├── components/                # Modular UI components
│   │   ├── AvailableTests.js      # Grid of allocated tests for student
│   │   ├── Contactus.js           # WhatsApp & phone support details
│   │   ├── footer.js              # Universal footer with policy links
│   │   ├── privacypolicy.js       # Privacy policy
│   │   ├── refundpolicy.js        # Refund policy
│   │   ├── returnpolicy.js        # Return policy
│   │   ├── shippingpolicy.js      # Shipping/service delivery policy
│   │   └── termsandconditions.js  # Terms of service
│   └── api/                       # Next.js REST API endpoints
│       ├── auth/                  # Authentication endpoints (login, verify)
│       ├── tests/                 # Exam questions & test retrieval
│       ├── sampletest/            # Demo questions endpoints
│       ├── results/               # Submission calculation & leaderboard
│       ├── users/                 # Remaining attempts & profile
│       ├── Response/              # Response sheet storage & retrieval
│       ├── payment.js             # Payment handler & notification dispatch
│       ├── notify.js              # Twilio WhatsApp/SMS sender
│       ├── generate-pdf.js        # jsPDF scorecard generator
│       ├── issues.js              # Issue ticket storage
│       ├── decrease.js            # Attempt decrementer
│       └── lib/
│           ├── mongodb.js         # Cached Mongoose connection helper
│           ├── authMiddleware.js  # JWT token validation middleware
│           └── models/            # Mongoose Schemas (User, Test, Result, etc.)
├── public/                        # Static assets (favicons, scanner.jpg QR, images)
├── styles/                        # Global Tailwind styles
├── next.config.mjs                # Next.js configuration
├── tailwind.config.js             # Tailwind CSS tokens & theme
└── package.json                   # Dependencies and scripts
```

---

## 🗄️ Database Schemas (Mongoose)

- **`User`**: Username, encrypted password, contact number, and array of allowed `groupAttempts` with test names and remaining attempt counters.
- **`Test`**: Questions, multiple-choice options (`A`, `B`, `C`, `D`), correct answer key, test code, and associated departmental group.
- **`Result`**: Candidate name, group, test title, raw score, attempted/unattempted count, total marks, percentage, pass/fail status, and duration taken.
- **`Payment`**: Candidate name, phone number, purchased groups, payment screenshot (Base64), transaction timestamp, and approval status (`pending`, `approved`, `rejected`).
- **`Issue`**: Candidate identifier, issue description, question reference, and reporting timestamp.
- **`ResponseSheet`**: Candidate submission record linking questions, selected answers, and correct keys for audit and review.

---

## 🔌 API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate candidate with username & password; returns JWT token |
| `/api/users/attempts` | `GET` | Fetch remaining test attempts for the authenticated user |
| `/api/tests/gettests` | `GET` | Retrieve questions for a specific group and test paper |
| `/api/sampletest/tests` | `GET` | List available free sample tests |
| `/api/sampletest/questions` | `GET` | Retrieve demo questions without authentication |
| `/api/results/submit` | `POST` | Submit completed exam, calculate score, and record result |
| `/api/results/results` | `GET` | Fetch global rankings and filtered leaderboard records |
| `/api/Response/get` | `GET` | Retrieve saved question responses for a completed test |
| `/api/generate-pdf` | `GET` | Generate and stream a customized PDF scorecard |
| `/api/payment` | `POST` | Submit enrollment form with payment screenshot |
| `/api/notify` | `POST` | Trigger Twilio SMS / WhatsApp admin alert |
| `/api/issues` | `POST` | Log candidate bug report or question dispute |

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and configure the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/departmental_exams?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_encryption_key

# Public App Base URL
NEXT_PUBLIC_BASE_URL=https://departmental-tests.netlify.app

# Twilio Credentials (Optional / for Admin Notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
ADMIN_PHONE_NUMBER=whatsapp:+91XXXXXXXXXX
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or 20+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A running [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster or local MongoDB instance

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/spk-2005/online-exam-departmental-test.git
   cd online-exam-departmental-test
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file using the template shown in the [Environment Variables](#️-environment-variables) section.

4. **Run the local development server**:
   ```bash
   npm run dev
   ```

5. **Open the browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Build & Production

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## 🌐 Deployment

The application is optimized for deployment on **Netlify** or **Vercel**:

- **Netlify**: Configured with `.netlify/functions` and `public/_redirects`. Connect the repository in the Netlify dashboard, configure build command `npm run build` and publish directory `.next`, and add environment variables under Site Settings.
- **Vercel**: Import the repository on Vercel, set the framework preset to `Next.js`, configure environment variables, and deploy.

---

## 🤝 Support & Contact

If you have questions, feedback, or need assistance:
- **WhatsApp Support**: [+91 8309179509](https://wa.me/918309179509)
- **Phone**: +91 8309179509
- **Live Platform**: [departmental-tests.netlify.app](https://departmental-tests.netlify.app)

---

## 📄 License

This project is proprietary and developed for departmental test preparation services. All rights reserved.
