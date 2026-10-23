TaskMaster Backend
Node.js + Express backend for a task tracking and management application using PostgreSQL and Sequelize.
Provides user authentication (bcrypt + JWT), task CRUD, teams, comments, attachments, and optional real‑time notifications via Socket.io.

Quick Overview
Tech stack

Node.js (Express)

PostgreSQL (Docker)

Sequelize ORM

JWT for authentication

bcrypt for password hashing

Socket.io for optional real‑time events

Multer for file uploads

What this repo contains

API endpoints for auth, users, teams, tasks, comments, attachments

Sequelize models and associations

Example .env.example

uploads/ for attachments (local dev)

docker-compose.yml example for Postgres (optional)

Prerequisites
Node.js LTS installed and available on PATH (node -v, npm -v)

Docker Desktop running (for PostgreSQL) or a reachable PostgreSQL instance

Git installed and configured

Optional: gh CLI if you want to create repos and PRs from the terminal

Environment Variables
Create a file named .env in the project root (do not commit). Example values:

env
PORT=4000
NODE_ENV=development
JWT_SECRET=YOUR_GENERATED_SECRET_HERE
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_manager_db
DB_USER=task_user
DB_PASSWORD=task_password
UPLOAD_DIR=uploads
Notes

Replace YOUR_GENERATED_SECRET_HERE with a secure random string.

If you used the default Postgres postgres user, set DB_USER=postgres and DB_PASSWORD accordingly.

Keep .env out of version control.

Setup and Run Locally
Clone or open the TaskMaster folder in your terminal.

Start PostgreSQL with Docker (recommended)

Create docker-compose.yml in project root (if not present) with the Postgres service, then:

bash
docker compose up -d
Confirm container is running:

bash
docker ps --filter "name=taskmaster_db"
Create DB user and database (run once; skip if already created)

bash
docker exec -it taskmaster_db psql -U postgres -c "CREATE USER task_user WITH PASSWORD 'task_password';"
docker exec -it taskmaster_db psql -U postgres -c "CREATE DATABASE task_manager_db;"
docker exec -it taskmaster_db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE task_manager_db TO task_user;"
Install Node dependencies

bash
npm install
If npm is not available locally, you can run:

bash
docker run --rm -v ${PWD}:/app -w /app node:20 bash -c "npm install"
Create uploads folder

bash
mkdir uploads
Start the server

bash
npm run dev
# or
npm start
Expected logs:

Code
Database connected.
Server running on port 4000
API Endpoints Summary
Auth

POST /api/auth/register — register user
Body: { name, email, password }

POST /api/auth/login — login
Body: { email, password }

Users

GET /api/users/me — get profile (Auth)

PUT /api/users/me — update profile (Auth)

Teams

POST /api/teams — create team (Auth)

GET /api/teams — list teams for user (Auth)

POST /api/teams/:teamId/join — join public team (Auth)

POST /api/teams/:teamId/invite — invite user by email (Auth, admin)

Tasks

POST /api/tasks — create task (Auth)
Body: { title, description, dueDate, priority, assigneeId, teamId }

GET /api/tasks — list tasks with query params: status, assigneeId, teamId, q, sortBy, order, page, limit (Auth)

GET /api/tasks/:id — get task with comments and attachments (Auth)

PUT /api/tasks/:id — update task (Auth)

POST /api/tasks/:id/complete — mark complete (Auth)

POST /api/tasks/:id/comments — add comment (Auth)
Body: { content }

POST /api/tasks/:id/attachments — upload file (form-data file) (Auth)

DELETE /api/tasks/:id — delete task (Auth)

Auth header

Code
Authorization: Bearer <token>
Testing the API
Use curl, Postman, or HTTP client.

Health check

bash
curl http://localhost:4000/api/health
Register

bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
Login

bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
Copy the returned token and use it for protected endpoints.

Real Time Notifications
Socket.io is wired in src/server.js.

Client should connect and emit('joinTeam', teamId) to join a team room.

Server emits events: taskAssigned, taskUpdated, taskCompleted, commentAdded, attachmentAdded.

Security and Production Notes
Use HTTPS and secure environment variables in production.

Replace local uploads/ with cloud storage (S3) for production.

Replace sequelize.sync({ alter: true }) with proper migrations.

Add rate limiting, input sanitization, and stricter CORS rules.

Git and GitHub Workflow
Add .gitignore

Create .gitignore with:

Code
node_modules/
.env
uploads/
.DS_Store
.vscode/
npm-debug.log
Initial commit and push only TaskMaster folder

Run these commands inside the TaskMaster folder:

bash
git init
git add .
git commit -m "Initial commit: TaskMaster backend"
Create a new public GitHub repository

Option A Web UI: create a new repo named TaskMaster (do not initialize with README).

Option B CLI (if gh installed):

bash
gh repo create yourusername/TaskMaster --public --source=. --remote=origin --push
Push to GitHub

bash
git remote add origin https://github.com/yourusername/TaskMaster.git
git branch -M main
git push -u origin main
Create a feature branch and open a PR

bash
git checkout -b feature/readme
# make changes (e.g., add README.md)
git add README.md
git commit -m "docs: add README"
git push -u origin feature/readme
Open a Pull Request on GitHub from feature/readme to main. If you use gh:

bash
gh pr create --title "docs: add README" --body "Add setup and run instructions" --base main --head feature/readme
Should README be added to feature branch
Yes. Add README.md to the feature branch (feature/readme) and push that branch. Create the PR from that branch to main. This keeps your initial main commit clean and lets reviewers see documentation changes in the PR.

Final Checklist before submission
.env created locally and not committed

docker compose up -d started Postgres

npm install completed

uploads/ folder exists

Server runs: Database connected. and Server running on port 4000

Basic API tests pass (register, login, create task)

Repo pushed to GitHub and PR opened from feature branch

Provide GitHub repo URL and PR URL for review
