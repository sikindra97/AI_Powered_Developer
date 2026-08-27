AI Developer Productivity Platform

An AI-powered developer productivity platform that connects with GitHub and helps developers track repositories, commits, pull requests, issues, productivity, and development activity from one place.

Features
User Registration & Login
JWT Authentication
Protected Routes
GitHub OAuth Integration
Connect GitHub Account
GitHub Profile
View Repositories
View Repository Details
View Commits
View Pull Requests
View Issues
Repository Analysis
Productivity Tracking
AI Assistant
Developer Dashboard
API Rate Limiting
MongoDB Database
Tech Stack
Frontend
React.js
Vite
JavaScript
React Router DOM
Axios
Tailwind CSS
Context API
React Hooks
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt
GitHub OAuth
Axios
CORS
Cookie Parser
Express Rate Limit
dotenv
Project Structure
AI-Powered/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
└── frontend/
    └── my-project/
        ├── src/
        │   ├── api/
        │   ├── components/
        │   ├── context/
        │   ├── pages/
        │   ├── App.jsx
        │   ├── App.css
        │   ├── index.css
        │   └── main.jsx
        │
        ├── public/
        └── package.json
GitHub OAuth Flow
User Login
    ↓
Dashboard
    ↓
Connect GitHub
    ↓
GitHub Authorization
    ↓
OAuth Callback
    ↓
Verify OAuth State
    ↓
Get GitHub Access Token
    ↓
Get GitHub User
    ↓
Save GitHub Account
    ↓
GitHub Connected
API Routes
Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GitHub
GET  /api/github/login
GET  /api/github/callback
POST /api/github/connect
GET  /api/github/profile
GET  /api/github/repositories
GET  /api/github/repositories/:owner/:repo
GET  /api/github/repositories/:owner/:repo/commits
GET  /api/github/repositories/:owner/:repo/pulls
GET  /api/github/repositories/:owner/:repo/issues
Other APIs
/api/repositories
/api/commits
/api/pull-requests
/api/issues
/api/analysis
/api/ai
/api/productivity
Environment Variables
Backend

Create backend/.env

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

GITHUB_CLIENT_ID=your_github_client_id

GITHUB_CLIENT_SECRET=your_github_client_secret

GITHUB_CALLBACK_URL=http://localhost:5000/api/github/callback
Frontend

Create:

frontend/my-project/.env

Add:

VITE_BACKEND_URL=http://localhost:5000

Do not upload .env files to GitHub.

GitHub OAuth Setup

Create a GitHub OAuth App from GitHub Developer Settings.

Use:

Application URL:
http://localhost:5173

Authorization callback URL:
http://localhost:5000/api/github/callback

The callback URL must be the same in both GitHub and the backend .env.

Installation
1. Clone the project
git clone YOUR_GITHUB_REPOSITORY_URL
cd AI-Powered
2. Backend
cd backend
npm install
node src/server.js

Backend:

http://localhost:5000
3. Frontend

Open another terminal:

cd frontend/my-project
npm install
npm run dev

Frontend:

http://localhost:5173
Run the Project

You need two terminals.

Terminal 1

cd backend
node src/server.js

Terminal 2

cd frontend/my-project
npm run dev

Then open:

http://localhost:5173
Security

The project uses:

JWT authentication
Password hashing
Protected API routes
OAuth state validation
HTTP-only OAuth cookie
CORS
Rate limiting
Environment variables for secrets
Backend storage of GitHub access tokens
Health Check
GET /api/health

Example response:

{
  "success": true,
  "message": "Server is healthy"
}
Future Improvements
Advanced AI code analysis
AI repository summaries
Automated code review
GitHub Webhooks
Real-time activity
Team productivity analytics
Email notifications
More analytics and charts
Docker deployment

CI/CD pipeline
Author

Sikindra Kumar

B.Tech Information Technology

License
This project is created for learning, development, and portfolio purposes.