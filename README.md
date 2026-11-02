# CampusConnect

A university community platform for students to connect, share ideas, discover campus events, and buy or sell used textbooks.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas + Mongoose
- Authentication: JWT

## Project structure
- `frontend/` — React user interface
- `backend/` — Express API
- `docs/` — project documentation

## Requirements
- Node.js (current LTS recommended)
- npm
- A MongoDB database URI

## Local setup

### 1. Configure the backend
```powershell
cd backend
npm install
Copy-Item .env.example .env
```
Edit `backend/.env` with your own values. Do not commit `.env`. Required settings are documented in `.env.example`. Keep the JWT secret private and use a strong random value.

Start the API:
```powershell
npm run dev
```
API base: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

### 2. Start the frontend
In another terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open the local URL Vite prints (normally `http://localhost:5173`).

## Core workflows
- Sign in using an existing student account.
- Publish a post.
- Like and unlike a post. The frontend derives the signed-in identity from the JWT `sub` claim and reconciles displayed like status/count with the API. The Like model defines a unique `{ user, post }` index.
- Open a post's discussion, retrieve comments, and submit an authenticated comment.
- Sign out using the account control.

## API checks
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/posts?page=1&limit=10` (Bearer token)
- `POST /api/posts` (Bearer token)
- `GET /api/posts/:postId/likes`
- `PUT /api/posts/:postId/like` (Bearer token)
- `DELETE /api/posts/:postId/like` (Bearer token)
- `GET /api/posts/:postId/comments`
- `POST /api/posts/:postId/comments` (Bearer token)

## Final verification checklist
- [ ] Backend connects to the intended database.
- [ ] Login works with a test account.
- [ ] Feed loads and post creation works.
- [ ] Like state is accurate before and after refresh.
- [ ] Repeated Like requests do not create extra records.
- [ ] Unlike removes only the current user's Like.
- [ ] Comments load for the selected post.
- [ ] Comment submission displays the new comment.
- [ ] Test at desktop and mobile widths.
- [ ] Review Git status and confirm no `.env`, tokens, or private data are staged.

## Notes
Some navigation destinations and planned modules may remain previews. Only represent functionality as complete after verifying it in your environment.
