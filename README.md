# CampusConnect

A university community platform where students can connect, share ideas, discover campus events, and buy or sell used textbooks.

## Technology Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcryptjs
- **API Testing:** Postman
- **Version Control:** Git + GitHub

## Project Structure

- `frontend/` — User interface
- `backend/` — Express API, database models, and business logic
- `docs/` — Project documentation

## Implemented Features

- [x] Express backend setup
- [x] MongoDB Atlas connection
- [x] Student registration
- [x] Secure password hashing
- [x] Student login with JWT authentication
- [x] Protected profile retrieval
- [x] Profile updates with field validation
- [x] Postman tests for authentication and profile endpoints

## In Progress

- [ ] Community posts API
- [ ] Comments and likes
- [ ] Campus events and attendance
- [ ] Used textbook listings
- [ ] React frontend integration

## Running the Backend

From the `backend/` directory:

```bash
npm install
npm run dev
```

Configure your environment variables in `backend/.env`. Required settings include `MONGODB_URI`, `JWT_SECRET`, and optionally `PORT`.

**Never commit `.env` or expose database credentials, JWT secrets, or real authentication tokens.**

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API and database status |
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Log in |
| GET | `/api/users/me` | Retrieve the authenticated user's profile |
| PATCH | `/api/users/me` | Update the authenticated user's profile |

Protected endpoints require an `Authorization: Bearer <token>` header.

## Development Approach

CampusConnect is being developed incrementally, with backend endpoints tested in Postman before frontend integration.
