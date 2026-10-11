# BUILDTRACK AI
**Smart Construction Site Management Platform**

BuildTrack AI is a centralized full-stack construction operations platform designed to solve common industry problems including worker attendance tracking, material over-requesting, stock mismanagement, delayed daily reporting, and lack of accountability.

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Lucide React, Modern CSS
- **Backend:** Node.js, Express.js (REST API), CORS, Dotenv
- **Security:** JWT Authentication, bcryptjs password hashing, Role-Based Access Control (RBAC)
- **Database:** PostgreSQL with Prisma ORM

---

## User Roles

1. **Super Admin:** Platform administrator (Company registration review, approval/rejection, system audit logs).
2. **Company Admin:** Organization lead (Projects, workers, budget, reports, master settings).
3. **Site Engineer:** On-site execution (Daily progress logs, attendance recording, material requests).
4. **Store Manager:** Site warehouse management (Inventory, issuing, purchase orders, receiving inspection).
5. **Contractor:** Subcontractor access (Assigned tasks and worker rosters).
6. **Client:** Project owner transparency view (Milestones, progress %, approved reports).

---

## Project Structure

```text
BUILDTRACK-AI/
├── client/          # React 18 frontend (Vite)
├── server/          # Node.js + Express REST API
└── README.md
```

---

## Quickstart

### 1. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Accessible at: `http://localhost:3000`

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
Accessible at: `http://localhost:5000/api/health`



## WhatsApp Material Request Notifications Configuration

This project includes a WhatsApp Notification System for Material Requests. It supports two modes:

### A. Development Mode (Click-to-Chat)
By default, if no API credentials are provided, the system falls back to generating WhatsApp click-to-chat links (`wa.me`) with pre-filled messages.

### B. Production Mode (WhatsApp Business API)
To send notifications automatically, configure the Meta WhatsApp Business Platform API:

1. Create a Meta Developer App and add the WhatsApp product.
2. Obtain a temporary or permanent Access Token.
3. Obtain your Phone Number ID.
4. Add the credentials to your backend `.env` file:

```env
# .env in server directory
WHATSAPP_API_TOKEN="your_meta_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"

# Optional: Number to send test notifications to (useful if user model doesn't store phone numbers yet)
TEST_WHATSAPP_PHONE="919876543210"

# Frontend URL to generate direct links in the WhatsApp message
FRONTEND_URL="http://localhost:3000"
```

If these variables are missing, the backend safely falls back to Development mode. Never expose these credentials in the frontend code or commit them to version control.
