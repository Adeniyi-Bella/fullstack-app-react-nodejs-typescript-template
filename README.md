# 🚀 Enterprise Fullstack Template

A production-ready, high-performance fullstack boilerplate designed for scalability and maintainability. This template implements industry best practices for security, caching, routing, and testing.

## 🛠 Tech Stack

### Frontend (UI)
- **Framework:** React 19 (Vite:Rolldown)
- **Language:** TypeScript
- **Routing:** [TanStack Router](https://tanstack.com/router) (File-based routing)
- **State & Caching:** [TanStack Query](https://tanstack.com/query)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest (Unit) & Cypress (End-to-End)

### Backend (API)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Caching:** Redis (IOredis)
- **Architecture:** Dependency Injection (tsyringe)
- **Testing:** Vitest (Unit & Integration)

---

## 🛡️ Backend Security & Middleware Architecture

The backend is engineered with a "Security First" approach. The application entry point implements a robust middleware stack designed to handle traffic efficiently and securely before it reaches the business logic.

### Core Middleware Features

Based on the implementation in `src/app.ts`, the system includes:

1.  **Dynamic CORS Handling**
    -   Requests are matched against a strict `WHITELIST_ORIGINS` configuration.
    -   Unauthorized domains are rejected with specific error logging before processing.

2.  **Security Headers (`Helmet`)**
    -   Automatically sets HTTP headers (Strict-Transport-Security, X-Frame-Options, etc.) to secure the app against common web vulnerabilities.

3.  **Traffic Control (`Rate Limiting`)**
    -   Protects against brute-force and DDoS attacks by limiting repeated requests from the same IP using `express-rate-limit`.

4.  **Bot Detection (`BotGuard`)**
    -   *Production Only:* Analyzes traffic patterns to block malicious bots and scrapers before they consume system resources.

5.  **Performance Optimization**
    -   **Compression:** Gzip compression enabled for response bodies >1kb.
    -   **Resilience:** Listeners for `uncaughtException` and `unhandledRejection` prevent silent server failures.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose (Recommended for DB/Redis)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```

2.  **Install Dependencies**
    ```bash
    # Install Backend Deps
    cd api && npm install

    # Install Frontend Deps
    cd ../ui && npm install
    ```

3.  **Environment Setup**
    Create `.env` files in both `api/` and `ui/` directories based on the `.env.example` files provided.

4.  **Start Infrastructure**
    ```bash
    docker-compose up -d mongo redis
    ```

5.  **Run Development Servers**
    ```bash
    # Terminal 1: Backend
    cd api && npm i && npm run dev

    # Terminal 2: Frontend
    cd ui && npm i && npm run dev
    ```

---

## 🧪 Testing Strategy

This template enforces high code quality through a dual-layer testing strategy.

### Backend Testing
We use **Vitest** for fast execution of unit and integration tests.

```bash
cd api
npm run test        # Run all tests
```

### Frontend Testing
Unit Tests (Vitest): For utility functions, hooks, and isolated components.
End-to-End (Cypress): For simulating real user flows (Login -> Dashboard -> Logout).
```bash
cd ui

# Run Unit Tests
npm run test

# Run E2E Tests (Headless)
npm run cypress:e2e:headless

# Open Cypress UI
npm run cypress
```
