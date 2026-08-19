# Digital Academic Records

Digital Academic Records is a comprehensive system designed to digitize, secure, and streamline the issuance and verification of academic credentials, integrated with Ethiopia's national identity system (Fayda).

## 🌟 Core Functionalities

- **Identity & Access Management:** Secure Fayda integration with Role-Based Access Control (RBAC) and robust session management.
- **Academic Registry Management:** Centralized management for student profiles, institutions, degree issuance, and national exam records.
- **Verification & Authenticity:** Secure QR code generation and an instant verification portal to check record authenticity. Tamper-proof backend design.
- **Student Self-Service:** A digital dashboard for students to view records, request official digital shares, and formally request corrections.
- **Administrative Workflows:** Dashboards for reviewing requests, comprehensive audit logging, and high-level system analytics.

*(For detailed functionalities, refer to [PROJECT_FUNCTIONALITIES.md](./PROJECT_FUNCTIONALITIES.md))*

## 🛠️ Technology Stack

**Backend:**
- Node.js & Express.js
- PostgreSQL (relational persistence)
- JWT Authentication, HTTP-only cookies, & Bcrypt
- Swagger/OpenAPI Documentation

**Frontend (React 19 & Vite):**
- **Admin Panel:** High-density interface with Recharts for analytics, Radix UI primitives.
- **Public Panel:** User-friendly, responsive interface with dark mode support.
- **Shared Tech:** Tailwind CSS 4, TanStack Query (React Query) for state management, Zod for type-safe validation, jsPDF for dynamic document generation.

## 📁 Project Structure

```text
.
├── backend/                # Express API Server
├── frontend/
│   ├── admin-panel/        # Admin interface for institutional registrars
│   └── public-panel/       # Public-facing portal for students and verification
├── fayda/                  # Fayda ID Integration Module
├── PROJECT_FUNCTIONALITIES.md # Core features documentation
└── system_architecture_diagram.png # Architecture visualization
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables:
Create a `.env` file in the `backend` directory (ensure database credentials and JWT secrets are properly set).

Run database migrations and seed (optional):
```bash
npm run migrate
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 2. Admin Panel Setup

```bash
cd frontend/admin-panel
npm install
npm run dev
```

### 3. Public Panel Setup

```bash
cd frontend/public-panel
npm install
npm run dev
```

## 🔒 Security
- Full authentication flow with HTTP-only cookies.
- Rate-limited APIs to prevent abuse.
- Event-driven automated auditing system tracking all sensitive data modifications.

