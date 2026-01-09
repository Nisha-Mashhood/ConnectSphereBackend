# 🌐 ConnectSphere

**A Scalable Mentorship & Collaboration Platform**

![Image]()

![Image]()

![Image]()

![Image]()

![Status]()
![Tech]()
![License]()
![Deployment]()

---

## 📌 Project Description

**ConnectSphere** is a full-stack web application designed to connect **learners and mentors** through structured mentorship, real-time communication, collaboration tools, and secure payments.

The project is built using **Repository Architecture** with **Dependency Injection**, ensuring clean separation of concerns, scalability, and maintainability—aligned with real-world industry standards.

---

## 📑 Table of Contents

* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Project Architecture](#-project-architecture)
* [Installation](#-installation-instructions)
* [Usage](#-usage)
* [API Overview](#-api-documentation)
* [Project Structure](#-project-structure)
* [Environment Variables](#-environment-variables)
* [Deployment](#-deployment)
* [Contributing](#-contributing-guidelines)
* [Visual Preview](#-visual-elements)
* [Author](#-author)

---

## 🚀 Features

### 👤 User & Mentor Management

* User, Mentor, and Admin authentication
* Role-based access control
* Profile management with skills, experience, and availability

### 🤝 Mentorship & Collaboration

* Send & accept mentorship requests
* Paid mentorship via **Stripe**
* One-to-one and group collaborations

### 💬 Communication

* Real-time chat using **Socket.IO**
* Typing indicators
* Media & file sharing
* Push notifications

### 📞 Video Calling

* One-to-one video calls using **WebRTC**
* Group video calls using **Jitsi**

### 🗂 Tasks & Groups

* Task creation and tracking
* Group management
* Activity-based notifications

### 🛠 Admin Panel

* Manage users & mentors
* Monitor payments & collaborations
* Analytics & reports
* Reviews and feedback management

---

## 🧰 Tech Stack

### Backend

* Node.js & Express
* TypeScript
* MongoDB Atlas
* Repository Architecture
* Inversify (Dependency Injection)
* JWT & OAuth (Google, GitHub)
* Socket.IO
* Stripe
* Redis Cloud (OTP)
* Multer & Cloudinary
* Winston Logger
* BetterStack (Cloud Logging)

---

## 🏗 Project Architecture

### Backend (Repository Architecture)

```text
Controller → Service → Repository → Modal(Database)
```

* **Controllers**: Handle API requests & responses
* **Services**: Business logic
* **Repositories**: Database operations
* **DTOs**: Safe data transfer to frontend
* **Inversify**: Dependency Injection


## ⚙️ Installation Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/Nisha-Mashhood/ConnectSphereBackend.git
cd connectSphere
```

### Step 2: Run Backend

```bash
cd backend
npm install
npm run dev
```

## ▶️ Usage

1. Register as a **User** or **Mentor**
2. Complete your profile
3. Send or accept mentorship requests
4. Communicate via chat or video calls
5. Track tasks and collaborations
6. Admin manages users, payments, and reports

---

## 🔗 API Documentation (Overview)

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| POST   | `/api/auth/login`         | User login          |
| POST   | `/api/auth/signup`        | User signup         |
| GET    | `/api/mentors`            | Get mentors list    |
| POST   | `/api/mentorship/request` | Send request        |
| POST   | `/api/payment/stripe`     | Payment processing  |
| GET    | `/api/chat/messages`      | Fetch chat messages |

> Detailed API documentation available via Postman collection.

---

## 📁 Project Structure

```text

backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dto/
│   ├── middlewares/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   ├── interfaces/
│   └── app.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```
---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000 
NODE_ENV=development

MONGO_URI=your_mongodb_uri 
JWT_SECRET=your_jwt_secret 
SESSION_SECRET=your_session_secret

ADMIN_EMAIL=admin_email 
PASSKEY_ADMIN=admin_passkey

BASE_URL=http://localhost:3000 
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id 
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id 
GITHUB_CLIENT_SECRET=your_github_client_secret 
GITHUB_CALLBACK_URL=http://localhost:3000/github/callback

EMAIL_SERVICE=gmail EMAIL_USER=your_email 
EMAIL_PASS=your_email_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_name 
CLOUDINARY_API_KEY=your_cloudinary_key 
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

REDIS_URL=your_redis_cloud_url

BETTERSTACK_LOG_TOKEN=your_betterstack_token 
BETTERSTACK_LOG_ENDPOINT=your_betterstack_endpoint LOG_LEVEL=debug

VAPID_PUBLIC_KEY=your_vapid_public_key 
VAPID_PRIVATE_KEY=your_vapid_private_key 
VAPID_EMAIL=your_email
```

## 🌍 Deployment

* **Frontend**: Vercel
* **Backend**: AWS
* **Database**: MongoDB Atlas

Frontend and backend are deployed **independently** for scalability.

---

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 🎨 Visual Elements

![Image]()

![Image]()

![Image]()

![Image]()

> Screenshots and demo GIFs .

---

## 👩‍💻 Author

**Nisha Mashhood**
Full-Stack MERN Developer
🔗 GitHub: [https://github.com/Nisha-Mashhood](https://github.com/Nisha-Mashhood)

---

## 📝 Final Note

ConnectSphere is built as a **real-world, production-grade application**, following clean architecture principles, strong typing, and scalable design patterns.
It reflects industry-level practices in authentication, communication, payments, and system design.
