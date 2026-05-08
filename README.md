# 🤖 CyberBot Pro - AI Restaurant Support System (PRJ-008)

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge&logo=vercel)](https://restaurant-support-chatbot.vercel.app/)
[![Project Code](https://img.shields.io/badge/Project-PRJ--008-blue?style=for-the-badge)](https://restaurant-support-chatbot.vercel.app/)

> **Implementation by Nithisvaran M PDKV**
> An advanced GenAI-powered restaurant concierge that manages bookings, tracks orders, and escalates complaints with human-in-the-loop self-learning.

---

## 📸 Preview
#DEMO PAGR: https://restaurant-support-chatbot.vercel.app/
*(Interface features high-end Anime-themed Glassmorphism, interactive charts, and real-time chat)*

---

## 🌟 Core Features (PRJ-008 Requirements)

### 1. 🧠 Intelligent AI Assistant (CyberBot)
*   **Intent Classification:** CyberBot uses keyword-based NLP to identify if a user is asking for a menu, checking order status, or filing a complaint.
*   **FAQ Retrieval (RAG Simulation):** Dynamically retrieves answers from a persistent JSON knowledge base.
*   **Self-Learning Mechanism:** Questions that CyberBot cannot answer are flagged for the Admin. Once the Admin provides an answer, the bot learns it instantly.

### 2. 📅 Smart Table Management
*   **Conflict Prevention:** Real-time database checks prevent double-booking the same table at the same time slot.
*   **Order Forwarding:** Integrated "Order to Table" system that links food orders directly to a user's active table number.

### 3. 🎫 Support & Escalation
*   **Auto-Escalation:** Complaints detected in chat automatically generate high-priority support tickets.
*   **User Feedback:** Customers can rate the service after a ticket is resolved by the administrator.

### 4. 🛠 Administrator Command Center
*   **Performance Metrics:** Live dashboards showing chat volume, booking trends, and ticket status using **Plotly/Recharts**.
*   **AI Training Hub:** Dedicated section for the Admin to "teach" the AI new responses.
*   **Interaction Auditor:** Full transparency into user-bot conversations.

### 🛡 Security Protocol
*   **Privilege Escalation Protection:** Built-in guardrails detect unauthorized attempts to access system commands (e.g., "sudo", "hack") and trigger security alerts.

---

## 🛠 Tech Stack
*   **Frontend:** React 18 + Vite (for high-speed performance)
*   **UI/UX:** Tailwind CSS + Framer Motion (Glassmorphism & Anime Aesthetics)
*   **Analytics:** Plotly / Recharts
*   **Deployment:** Vercel (Production-grade hosting)
*   **Database:** Persistent JSON-based state management (localStorage simulation)

---

## 📝 Setup & Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/nithisvaran-m/restaurant-support-chatbot.git
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
4.  **Build for Production:**
    ```bash
    npm run build
    ```

---
