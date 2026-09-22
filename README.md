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

