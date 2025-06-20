# 🎨 LMS Frontend

This repository contains the **frontend** of the Learning Management System (LMS), built using **React.js**, **Vite**, and **Material UI (MUI)** for a modern, fast, and responsive user interface.

---

## ⚙️ Tech Stack
| Layer        | Technology          |
|--------------|---------------------|
| **Frontend** | React.js (w/ Vite)  |
| **Styling**  | Material UI (MUI v5)|
| **Routing**  | React Router DOM    |
| **State**    | Context API         |
| **Auth**     | JWT + Google OAuth2 |
| **HTTP**     | Axios               |
| **UI Extras**| Toasts, Loaders     |

---

## 📁 Project Structure
lms-frontend/
│
├── src/
│ ├── assets/ # Images & logos
│ ├── components/ # Reusable components
│ ├── context/ # Auth & global context
│ ├── pages/ # Main page views by role
│ ├── services/ # Axios API services
│ ├── utils/ # Theme, constants
│ ├── App.jsx # Root component
│ └── main.jsx # App entry point
│
├── public/
│ └── index.html
├── .env
└── README.md

markdown
Copy
Edit

---

## 🎯 Main Features
- **Public landing page** with course search
- **Student dashboard**
  - Enroll & browse courses
  - View lessons, quizzes, assignments
  - Track progress
- **Instructor dashboard**
  - Create/edit courses, modules, lessons
  - Manage quizzes, assignments, submissions
- **Admin dashboard**
  - Approve courses, manage users
- **Authentication**
  - Email/password login
  - Google OAuth2
- **Responsive UI** (mobile-friendly)

---

## 🚀 Setup & Run

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/lms-frontend.git
   cd lms-frontend
Install dependencies

bash
Copy
Edit
npm install
Configure .env

env
Copy
Edit
VITE_API_URL=http://localhost:3001/api
Start the dev server

bash
Copy
Edit
npm run dev
Visit: http://localhost:5173

🔐 Authentication
JWT is stored in localStorage after login.

Axios sends token in Authorization header.

Auth context is used to manage user state across the app.

📸 Demo Pages
Screenshots are available in the /appendix or report:

Landing Page

Login / Register

Student Dashboard

Instructor Course Manager

Admin Panel

Course Player

Quiz Attempt Page

Assignment Upload Page

🛠️ Deployment
Deploy with Vercel, Netlify, or GitHub Pages:

bash
Copy
Edit
npm run build
Then upload /dist folder to your hosting provider.

📡 API Integration
All routes are based on backend at:

bash
Copy
Edit
Base URL: http://localhost:3001/api
Ensure CORS is configured on the backend.

🖋️ License
MIT © 2025 Baha Fareed Turki Jdaitawi

👤 Author
Baha Fareed Turki Jdaitawi
Hussein Technical University — Upskilling Program
GitHub • LinkedIn
