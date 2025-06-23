Great! Here is your **final `README.md`** with your name and enrollment number filled in, and image references properly linked:

---

```markdown
# 🎯 ShortLink Pro – Advanced URL Shortener with Analytics

📌 **Roll Number**: 2203051050647  
👨‍💻 **Name**: Yash Kumar

This repository is part of the submission and contains:

1. 📂 `Logging Middleware` – Custom logger utility  
2. 📂 `Frontend Test Submission` – A Next.js-based advanced URL shortener with built-in analytics

---

## 📁 Folder Structure

```

2203051050647/
├── Logging Middleware/
│   └── logger.ts
├── Frontend Test Submission/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── middleware/
│   ├── public/
│   ├── styles/
│   └── config + root files

````

---

## 1️⃣ Logging Middleware

Custom middleware for logging simulated HTTP requests in a structured format.

### 🔧 Features:
- Logs: Method, URL, Timestamp, Message
- Log levels: `info`, `warn`, `error`

```ts
logger("POST", "/shorten", "User submitted a URL", "info");
````

---

## 2️⃣ Frontend Test Submission – ShortLink Pro

A full-featured, responsive URL shortener with analytics built using **Next.js**, **TypeScript**, and **Tailwind CSS**.

### 🧩 Key Features

#### 🔗 URL Shortener:

* Accept up to 5 URLs
* Optional custom shortcode input
* Set expiration (in days/hours)
* Real-time URL validation
* Copy to clipboard

#### 📊 Analytics Dashboard:

* Summary: total URLs, total clicks, active/expired
* Table view:

  * Short link, clicks, location, referrer
  * Expandable details per URL
* Mock analytics data

---

## ⚙️ Tech Stack

| Tool                     | Purpose            |
| ------------------------ | ------------------ |
| **Next.js (App Router)** | Frontend Framework |
| **TypeScript**           | Static typing      |
| **Tailwind CSS**         | UI Styling         |
| **PNPM**                 | Package management |

---

## 🚀 How to Run

```bash
cd "Frontend Test Submission"
pnpm install
pnpm dev
```

Go to: [http://localhost:3000](http://localhost:3000)

---

## 📸 Screenshots

### 🔧 Shorten URL Form

![Shorten URL Page](./Screenshot%202025-06-23%20134835.png)

### ✅ URL Successfully Shortened

![Shortened Success](./Screenshot%202025-06-23%20134911.png)

### 🔁 Redirect Countdown

![Redirect Page](./Screenshot%202025-06-23%20134936.png)

> 📁 **Place these images inside**:
> `Frontend Test Submission/public/`
>
> * screenshot-url-form.png
> * screenshot-success.png
> * screenshot-redirect.png

---

## 🧪 Known Issues

* Some TypeScript warnings in Grid layout
* Analytics data is mock-generated (no backend)

---

## 👨‍💻 Submitted By

* **Name**: Yash Kumar
* **Enrollment Number**: 2203051050647
* **Track**: Frontend

---

```

✅ Let me know if you want:
- The Markdown file zipped
- A backend API version
- Logger file (`logger.ts`) auto-generated
```
