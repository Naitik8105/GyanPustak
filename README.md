# GyanPustak

GyanPustak is a full-stack book management system for students, support staff, administrators, and super admin users.  
It supports book browsing, cart management, orders, reviews, tickets, employee management, and course-book mapping.

## Tech Stack

**Frontend:** React, Vite, React Router  
**Backend:** Node.js, Express.js, bcrypt, JWT  
**Database:** MySQL, mysql2  
**Deployment:** Render for frontend and backend, Railway MySQL for database hosting

## Features

- Student registration and login
- Book browsing and search
- Add to cart and remove from cart
- Place orders
- Rent and buy book support
- Book reviews and ratings
- Trouble ticket system
- Employee and admin management
- Course and university book mapping
- Role-based access control

## Project Structure

```bash
backend/   # Express API, database logic, routes, controllers
frontend/  # React UI using Vite
```
## Environment Variables

### Backend

```bash
PORT=10000
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_secret_key
```

### Frontend
```bash
VITE_API_URL=http://localhost:10000/api
```

## Deployment
- Backend is deployed on Render as a Web Service
- Frontend is deployed on Render as a Static Site
- Database is hosted on Railway MySQL
