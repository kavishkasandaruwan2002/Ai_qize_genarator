# 🧠 AI Study Assistant

An AI-powered study tool that turns your PDF notes into **summaries, flashcards, and MCQ quizzes** — built as a full-stack MERN application with a production-style DevOps pipeline (Docker, CI/CD, AWS).

[![CI Pipeline](https://github.com/kavishkasandaruwan2002/Ai_qize_genarator/actions/workflows/ci.yml/badge.svg)](https://github.com/kavishkasandaruwan2002/Ai_qize_genarator/actions)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-ECR%20%7C%20EC2-FF9900?logo=amazonaws&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 📄 **PDF Upload** – Upload lecture notes or textbook chapters as PDF
- 🤖 **AI-Generated Content** – Automatic summaries, flashcards, and MCQ quizzes powered by AI (Gemini/OpenAI)
- 🔐 **Authentication** – Secure JWT-based login and registration
- ⭐ **Favorites & Study Room** – Save and revisit generated study material
- 📊 **Dashboard** – Track your uploaded notes and quiz progress
- 🐳 **Fully Dockerized** – Multi-stage builds for both frontend and backend
- ⚙️ **CI/CD Pipeline** – Automated lint, build, and deploy via GitHub Actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | MongoDB Atlas (Mongoose) |
| **Auth** | JWT |
| **AI** | Google Gemini / OpenAI API |
| **File Handling** | Multer (in-memory), pdf-parse |
| **Containerization** | Docker (multi-stage builds), Nginx |
| **CI/CD** | GitHub Actions |
| **Cloud** | AWS ECR, EC2, IAM, CloudWatch *(in progress)* |
| **IaC** | Terraform *(planned)* |

---

## 🏗️ Architecture

```
Developer
   │
   ▼
GitHub (push to main)
   │
   ▼
GitHub Actions CI
   ├─ Lint & syntax check
   ├─ Build Docker images (client + server)
   └─ Push images → Amazon ECR
                        │
                        ▼
                  Amazon EC2
             ┌──────────┴──────────┐
             ▼                     ▼
       Nginx (client)        Node.js (server)
             │                     │
             └────── /api/* ───────┘
                                   │
                                   ▼
                          MongoDB Atlas
                          Gemini/OpenAI API
```

---

## 📂 Project Structure

```
Ai_qize_genarator/
├── server/                 # Express REST API
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth guard, file upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI integration, PDF parsing
│   │   └── index.js        # App entry point
│   └── Dockerfile
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   └── services/       # API client
│   ├── Dockerfile
│   └── nginx.conf
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- A MongoDB Atlas connection string
- A Gemini or OpenAI API key

### Option A — Run with Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/kavishkasandaruwan2002/Ai_qize_genarator.git
cd Ai_qize_genarator

# Set up environment variables
cp .env.example .env
# then edit .env with your MongoDB URI, JWT secret, and AI API key

# Build and run
docker compose up --build
```

App runs at **http://localhost** (Nginx serves the client and proxies `/api/*` to the backend).

### Option B — Run locally without Docker

**Backend**
```bash
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev
```

**Frontend** (in a separate terminal)
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

> ⚠️ Never commit your real `.env` file — it contains secrets. Use `.env.example` as the template.

---

## ⚙️ CI/CD Pipeline

Every push to `main` triggers a GitHub Actions workflow that:

1. Installs dependencies for both client and server
2. Lints the frontend and syntax-checks the backend
3. Authenticates with AWS using a scoped IAM user (least-privilege access)
4. Builds multi-stage Docker images for both services
5. Pushes tagged images (`latest` + commit SHA) to **Amazon ECR**

```yaml
on:
  push:
    branches: [main]
```

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the full pipeline.

**Planned next steps:**
- [ ] Automated deployment (CD) to EC2 via SSH
- [ ] Infrastructure provisioning with Terraform
- [ ] CloudWatch logging & alerting
- [ ] Secrets migrated to AWS Secrets Manager

---

## 🔒 Security Notes

- Secrets (JWT secret, DB URI, AI API keys) are managed via **GitHub Actions secrets** and local `.env` files — never committed to source control
- A dedicated IAM user with **least-privilege** permissions is used for CI/CD, rather than root AWS credentials
- PDF uploads are handled in-memory (not written to disk) and restricted to 10MB

---

## 🗺️ Roadmap

- [x] Core MERN application (auth, PDF upload, AI generation)
- [x] Dockerize client and server
- [x] CI pipeline: lint, build, push to ECR
- [ ] Provision EC2 with Terraform
- [ ] CD pipeline: auto-deploy to EC2
- [ ] CloudWatch monitoring & alarms
- [ ] Migrate secrets to AWS Secrets Manager

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙋 Author

**Kavishka Sandaruwan**
🔗 [GitHub](https://github.com/kavishkasandaruwan2002) · Built as a hands-on DevOps portfolio project.
