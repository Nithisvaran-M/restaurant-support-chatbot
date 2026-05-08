# 🤖 CyberBot Pro - AI Restaurant Support System

An "Ace Project" implementation of **PRJ-008: Restaurant Support Chatbot**. This application is a comprehensive, production-grade solution for the digital dining industry, featuring a self-learning AI concierge, real-time table management, and an advanced admin control center.

## 🚀 Live Demo & Deployment Instructions

### How to Deploy to GitHub & Vercel (Recommended)

1.  **Create a GitHub Repository:**
    *   Go to [GitHub](https://github.com) and create a new repository named `restaurant-support-chatbot`.
2.  **Upload the Code:**
    *   Initialize git in your project folder: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Initial commit - Ace Project Implementation"`
    *   Link to GitHub: `git remote add origin <your-github-repo-url>`
    *   Push: `git push -u origin main`
3.  **Deploy to Vercel:**
    *   Sign in to [Vercel](https://vercel.com) using your GitHub account.
    *   Click **"Add New"** > **"Project"**.
    *   Import your `restaurant-support-chatbot` repository.
    *   Click **"Deploy"**. Vercel will automatically detect the Vite build settings and provide you with a live URL.

---

## 🌟 Key Features

### 1. CyberBot: Self-Learning AI Concierge
*   **Intent Classification:** Recognizes Order Status, Bookings, Complaints, and Menu queries.
*   **Self-Learning Loop:** If the bot doesn't know an answer, it logs the question. Once an admin provides the answer, the AI is "trained" instantly.
*   **Sentiment Aware:** Automatically escalates complaints to management with high-priority tickets.
*   **Security Protocol:** Protects against privilege escalation and unauthorized system access attempts.

### 2. Smart Table Management
*   **Conflict Prevention:** Real-time database (localStorage) check to prevent double-booking the same time slot.
*   **Order-to-Table Sync:** Users can order food items directly to their table number.
*   **Interactive Reservations:** Users can click their reservation cards to view active table orders.

### 3. Admin Control Center
*   **Analytics Dashboard:** Visual trends of chat volume and query categories using Recharts.
*   **Knowledge Base Manager:** Admins can train the AI by adding/deleting FAQs.
*   **Chat Auditor:** View full interaction logs between users and the AI with the ability to intervene.

---

## 🛠 Tech Stack
*   **Frontend:** React 18, Vite (Fast HMR)
*   **Styling:** Tailwind CSS (Modern, Responsive)
*   **Animations:** Framer Motion (Fluid transitions)
*   **Charts:** Recharts (Data visualization)
*   **Database Simulation:** Persistent LocalStorage System
*   **Icons:** Lucide-React

---

## 📝 Setup & Installation

1.  **Clone the project:** `git clone <repo-url>`
2.  **Install dependencies:** `npm install`
3.  **Run locally:** `npm run dev`
4.  **Build for production:** `npm run build`

---

## 👨‍🎓 Student Info
*   **Name:** Nithisvaran M PDKV
*   **Department:** Cyber
*   **Project Code:** PRJ-008
*   **Project Name:** Restaurant Support Chatbot
