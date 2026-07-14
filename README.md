# StayFinder - Backend Server

StayFinder is a premium luxury vacation rental platform. This folder contains the standalone backend API server built with Node.js, Express, and TypeScript.

---

## 🚀 Tech Stack
- **Core runtime**: Node.js & Express.js
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens) with HTTP-Only secure cookies
- **Security Hashing**: BcryptJS for password hashing
- **Database**: MongoDB (Primary) with file-based JSON database fallback (`server/data/db.json`)

---

## 🛠️ Installation & Run

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The backend API will run on [http://localhost:5000](http://localhost:5000).

---

## 🔑 Demo Accounts
The database comes pre-seeded with traveler and host accounts:
- **Traveler**: `user@stayfinder.com` / `password123`
- **Host/Admin**: `admin@stayfinder.com` / `password123`
