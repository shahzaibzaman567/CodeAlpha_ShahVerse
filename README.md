<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/1685392c-4fde-407d-952c-9eee8a0290e5" />


# ShahVerse — Premium Fashion E-Commerce

> **CodeAlpha Task 1** — Full-Stack E-Commerce Platform

A premium full-stack fashion e-commerce platform built with the MERN stack.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | _Deploy to Vercel_ |
| Backend API | https://code-alpha-shah-verse.vercel.app |

---

## 🧰 Tech Stack

**Frontend**
- React + Vite
- Redux Toolkit
- Tailwind CSS
- Framer Motion
- Lucide React Icons
- Recharts

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Stripe Payments
- bcryptjs

---

## 📁 Project Structure

```
CodeAlpha_ShahVerse/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── routes/
│   │   ├── store/
│   │   └── App.jsx
│   ├── .env.example
│   └── vercel.json
│
└── backend/           # Node.js + Express API
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   └── server.js
    ├── .env.example
    └── vercel.json
```

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/CodeAlpha_ShahVerse.git
cd CodeAlpha_ShahVerse
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

### 4. Seed Database
```bash
cd backend
node src/utils/seeder.js
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | shahzaibzaman465@gmail.com | admin123 |
| User | user@shahverse.com | user123456 |

---

## ✨ Features

### Customer
- Registration & Login (JWT)
- Product browsing with filters & search
- Product detail with reviews
- Shopping cart (persistent)
- Wishlist
- Stripe checkout
- Order history & tracking
- Profile management
- Dark / Light mode

### Admin Panel
- Analytics dashboard with charts
- Product CRUD
- Order management & status updates
- User management
- Category management
- Coupon management
- Newsletter subscribers

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```

### Backend → Vercel
```bash
cd backend
vercel --prod
```

Set all environment variables in Vercel dashboard.

---

## 📝 CodeAlpha Requirements Covered

- ✅ User Registration & Login
- ✅ Product Listings
- ✅ Product Details Page
- ✅ Shopping Cart
- ✅ Order Processing (Stripe)
- ✅ Products, Users, Orders Database (MongoDB)
- ✅ HTML5, CSS3, JavaScript (ES6+) via React
- ✅ Node.js + Express.js Backend

---

**Built by Shahzaib Zaman** — CodeAlpha Internship Task 1
