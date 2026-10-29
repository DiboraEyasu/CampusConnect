# CampusConnect

CampusConnect is a university community platform designed to help students connect, share ideas, discover campus events, and buy or sell used textbooks.

## Project Goals

- Connect students through a shared community feed.
- Enable students to share posts and interact with others.
- Help students discover campus events.
- Provide a marketplace for used textbooks.

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
- `backend/` — Express API, models, controllers, middleware, and routes
- `docs/` — Project documentation, if applicable

## Implemented Features

- [x] Express backend setup
- [x] MongoDB Atlas connection
- [x] Student registration
- [x] Student login with JWT authentication
- [x] Password hashing with bcryptjs
- [x] Protected profile retrieval
- [x] Profile updates with validation
- [x] Community posts API
  - [x] Create posts
  - [x] Retrieve posts
  - [x] Update own posts
  - [x] Delete own posts
  - [x] Retrieve posts with pagination

## In Progress / Planned

- [ ] Complete remaining Posts API security and validation checks
- [ ] Comments API
- [ ] Likes API
- [ ] Campus events and attendance
- [ ] Used textbook listings and search
- [ ] React frontend integration
- [ ] Real-time messaging
- [ ] Final security and integration testing

## API Endpoints

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API and database status |

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Log in |

### User Profiles

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users/me` | Retrieve authenticated user's profile |
| PATCH | `/api/users/me` | Update authenticated user's profile |

### Community Posts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/posts` | Retrieve posts with pagination |
| GET | `/api/posts/:id` | Retrieve a post by ID |
| POST | `/api/posts` | Create a post |
| PATCH | `/api/posts/:id` | Update own post |
| DELETE | `/api/posts/:id` | Delete own post |

Protected endpoints require:

`Authorization: Bearer <token>`

## Running the Backend

From the `backend/` directory:

```bash
npm install
npm run dev
```

Configure the required environment variables in `backend/.env`:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (if configurable in the server code)

Never commit `.env` files, database credentials, JWT secrets, or real authentication tokens.

## Running the Frontend

CampusConnect Login + Real Posts Integration

Copy src/App.jsx and src/App.css into your frontend/src folder, replacing those two files. Keep your existing main.jsx, index.css, package.json, and other project files.

Run the backend from backend: npm run dev
Run the frontend from frontend: npm run dev

Sign in with your existing test account. After login, the dashboard requests:
GET http://localhost:5000/api/posts?page=1&limit=10
with Authorization: Bearer <your JWT>

The feed displays real post content, author name, and creation date returned by the API. If your browser reports a CORS error, confirm app.js allows http://localhost:5173. The composer and like/comment actions are still preview-only and are not saved to the backend in this milestone.

Security note: the JWT is held in React memory for this MVP. Refreshing the page signs you out. Never paste tokens or passwords into chat.


## Development Workflow

CampusConnect is being developed incrementally:

1. Design the feature.
2. Implement the backend model, controller, and routes.
3. Test API behavior in Postman.
4. Validate authentication, permissions, and error handling.
5. Connect the frontend.
6. Document and commit completed milestones.

