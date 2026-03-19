# 🚀 DBF Gateway

**DBF Gateway** is a simple system used to take attendance and redirect participants to online sessions. It is designed
to be a generic tool for any gathering, such as YMHT sessions, MBA sessions, or general satsangs.

## 🛠 Tech Stack

* **Framework**: Next.js 16 (App Router)
* **UI Library**: HeroUI
* **Styling**: Tailwind CSS v4
* **Language**: TypeScript

<p align="center">
    <a href="https://www.dadabhagwan.org/">
        <img src="https://skillicons.dev/icons?i=nextjs,react,tailwindcss,ts" alt="tech stack" />
    </a>
</p>

---

## ✨ Key Features

* **Dynamic Setup**: Change the session name, banner, and footer in one config file without touching the code.
* **Fast Check-in**: Remembers user details for the day so they do not have to re-type their information.
* **Automatic Data**: Captures the user's city and a unique device ID automatically.
* **Audio Feedback**: Custom sounds play when switching themes or submitting the form.
* **Google Sheets Integration**: Sends all attendance data directly to a Google Sheet.

---

## 📂 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory and add your credentials:

```env
# Google Apps Script Web App URL
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/xyz.../exec

# The destination meeting link (Google Meet, Zoom, etc.)
NEXT_PUBLIC_MEET_URL=https://meet.google.com/xyz-xyz-xyz

```

### 2. Configuration

Update `src/config/site.ts` with your specific text and images.

### 3. Assets

Place your logos and banners in the `public/assets/` folder.

---

## 📝 How it Works

1. **Identify**: The app identifies the user's device on page load.
2. **Submit**: The user enters their name and mobile number.
3. **Log**: Data is saved to a Google Sheet via a background API call.
4. **Join**: The user is instantly redirected to the meeting link.

---

## 🚀 Deployment

The project is deployed using **Vercel CI/CD pipelines**.

| Branch    | Environment | Purpose                       |
|-----------|-------------|-------------------------------|
| `main`    | Production  | Live public site              |
| `develop` | Development | Testing & preview environment |

Each push automatically triggers a deployment on Vercel.

---

## 🌿 Branching Strategy (Git Workflow)

We follow a simple feature‑branch workflow.

### Creating a new task branch

```
feature/<feature-name>
bugfix/<issue-name>
```

### Development Flow

1. Create a feature/bugfix branch from `develop`
2. Implement changes
3. Merge into `develop` → auto deploys to Dev site
4. After testing, merge `develop` → `main` → deploys to Production

---

## 🤝 Contribution Guidelines

* Never push directly to `main`
* Use feature or bugfix branches
* Ensure build works locally before creating PR
* Keep commits meaningful and small

---

## 📊 Data Storage

Attendance data is stored in Google Sheets using Google Apps Script as a webhook endpoint.

Stored fields typically include:

* Name
* Mobile Number
* City
* Device ID
* Timestamp

---

## 📌 Purpose

The goal of DBF Gateway is to provide a **fast, reusable attendance gateway** for any online gathering without needing a
new project each time — only configuration changes.
