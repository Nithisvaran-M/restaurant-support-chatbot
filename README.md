# 🤖 CyberBot Pro - AI Restaurant Support System (PRJ-008)

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge&logo=vercel)](https://restaurant-support-chatbot.vercel.app/)
[![Project Code](https://img.shields.io/badge/Project-PRJ--008-blue?style=for-the-badge)](https://restaurant-support-chatbot.vercel.app/)

> **Implementation by Nithisvaran M PDKV**
> An advanced GenAI-powered restaurant concierge that manages bookings, tracks orders, and escalates complaints with human-in-the-loop self-learning.

---

## 📸 Preview
#DEMO PAGR: https://restaurant-support-chatbot.vercel.app/


<img width="1366" height="606" alt="ONE" src="https://github.com/user-attachments/assets/898632b5-7758-4c6a-ae9b-14a1a527bb4e" />

*(Interface features high-end Anime-themed Glassmorphism, interactive charts, and real-time chat)*
##USER
<img width="641" height="581" alt="ONE ONE" src="https://github.com/user-attachments/assets/c0e3fb5f-7cfe-4c30-85dc-adef95f601d0" />
<img width="492" height="318" alt="ONETHREE" src="https://github.com/user-attachments/assets/973f4a9d-4cf6-4c27-ba77-c2e62a7ae365" />
<img width="436" height="483" alt="ONE TWO" src="https://github.com/user-attachments/assets/b29f1628-3be0-43fa-bb69-475fed254446" />


##ADMIN
<img width="678" height="548" alt="TWO" src="https://github.com/user-attachments/assets/d28a8278-aeea-47bb-9e3e-b92fbb847ccf" />
<img width="718" height="378" alt="TWOTHREE" src="https://github.com/user-attachments/assets/da8f722b-2af3-4ee7-b4cd-8b6a2c2112f9" />
<img width="660" height="459" alt="TWO FOUR" src="https://github.com/user-attachments/assets/75d415b7-d4d2-4cc5-958e-e064c2974caa" />

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
