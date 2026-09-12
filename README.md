# Velozity Global Solutions — Real-Time Client Project Dashboard

A full-stack real-time project management dashboard with JWT authentication, role-based access control, task management, WebSocket activity feeds, notifications, and automated overdue-task detection.

## Features

- JWT authentication with access and refresh tokens
- Refresh token stored in an HttpOnly cookie
- Role-based access control:
  - Admin
  - Project Manager
  - Developer
- API-level authorization middleware
- Project management
- Task creation, editing, deletion, assignment, and status updates
- Role-scoped project and task access
- Task status history using ActivityLog
- Real-time WebSocket activity feed
- Missed activity recovery from the latest 20 database events
- Online/offline user presence
- Real-time notifications
- Unread notification count
- Mark individual/all notifications as read
- Automatic overdue-task detection using node-cron
- PostgreSQL database with Prisma ORM
- Zod request validation
- Centralized error handling
- TypeScript across frontend and backend

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React
- WebSocket

### Backend

- Node.js
- Express
- TypeScript
- WebSocket (`ws`)
- JWT
- bcryptjs
- Zod
- node-cron

### Database

- PostgreSQL
- Prisma ORM

## Project Structure

```text
velozity/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── jobs/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── validation/
│       ├── websocket/
│       ├── app.ts
│       └── server.ts
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       └── main.tsx
│
└── README.md