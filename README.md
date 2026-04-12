# 🚀 Taskify – MERN Stack Todo App

A full-stack **Task Management (Todo) Application** built using the **MERN Stack** (MongoDB, Express, React, Node.js).  
This app helps users manage daily tasks with features like priority marking, completion tracking, and secure authentication.

---

## 📌 Features

- ✅ User Authentication (Login / Register)
- 📝 Create, Update, Delete Tasks
- 📋 Multiple Tasks inside a Todo
- ⭐ Mark tasks as **Important**
- ✔️ Mark tasks as **Completed**
- ⏱️ Track completion time (`completedAt`)
- 🎯 Set Priority (Low / Medium / High)
- 🔐 Protected Routes (User-specific data)
- ⚡ Clean UI with React + CSS

---

## 🏗️ Tech Stack

### 🎨 Frontend
- React.js
- CSS / Tailwind (if used)
- Axios

### ⚙️ Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

## 📂 Project Structure
```
taskify/
│
├── backend/
│ ├── models/
│ │ └── Todo.js
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── css/
│ │ └── App.jsx
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
bash
git clone https://github.com/Prahlad800/taskify
cd taskify

cd backend
npm install

Create a .env file in the backend folder:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

Run backend:
npm run dev



cd frontend
npm install
npm run dev


```
## 📊 API Endpoints

### 🔐 User Authentication (`/user`)

- `POST /user/signup` → Register new user  
- `POST /user/login` → Login user  

---

### 🏠 Notes / Titles (`/home`)

- `POST /home/` → Create new title  
- `GET /home/` → Get all titles  
- `GET /home/:id` → Get single title with content  
- `PUT /home/:id` → Update title/content  
- `DELETE /home/:id` → Delete note  

---

### 📝 Tasks (`/task`)

#### 🔹 Task Title
- `POST /task/` → Create task title  
- `GET /task/` → Get all task titles  
- `GET /task/:id` → Get specific task with items  
- `PUT /task/:id` → Update task content  
- `DELETE /task/:id` → Delete task  

#### 🔹 Task Items (Inside Task)
- `PUT /task/:id/:todoId` → Update specific task item (checkbox / important / text)

---

## 🔒 Middleware Used

- `auth_signup` → Validate signup data  
- `auth_login` → Validate login data  
- `auth_notes_page` → Protect routes (JWT आधारित authentication)

---
```

🧠 Key Learnings
Handling nested schema in MongoDB (tasks inside todo)
Managing state in React efficiently
Authentication using JWT
Backend–Frontend integration
Clean component-based architecture


⚠️ Common Issues (Solved)
❌ completedAt not showing
➝ Fix by updating schema and backend logic
❌ Git push error
➝ Check remote origin setup
❌ Data not fetching
➝ Ensure .select() is not limiting fields


🚀 Future Improvements
📱 Mobile responsive UI
🔔 Notifications / Reminders
📅 Calendar integration
🌙 Dark Mode
📊 Analytics Dashboard
🤝 Contribution

Pull requests are welcome!
If you find a bug or want to improve something — feel free to contribute 💪

📄 License

This project is open-source and free to use.

👑 Author

Prahlad
MERN Stack Developer 🚀

```

---

## 🌐 Live Demo

🔗 **Frontend:** https://taskify-notes-task.vercel.app
🔗 **Backend API:** https://taskify-gcxc.onrender.com

> ⚠️ Note: Backend may take a few seconds to start (free hosting).


## 🚀 Deployment

- Frontend deployed on **Vercel**
- Backend deployed on **Render / Railway**
- Database hosted on **MongoDB Atlas**


