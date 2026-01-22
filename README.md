# 🎉 EventsApp - Complete Event Management Platform

A modern, full-stack event management application that allows users to discover, create, and book events. Built with Next.js, Node.js, Express.js, and Supabase.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
6. [Running the Application](#running-the-application)
7. [Testing the Application](#testing-the-application)
8. [Email Configuration](#email-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Project Architecture](#project-architecture)

---

## ✨ Features

### User Features
- 🔐 **User Authentication** - Register, login, and secure JWT-based authentication
- 🎫 **Event Discovery** - Browse and search events by category, location, or keywords
- 🎟️ **Ticket Booking** - Book tickets with real-time availability checking
- 📧 **Email Confirmations** - Receive booking confirmations with event details
- 📅 **My Bookings** - View and manage all your event bookings
- 🔍 **Advanced Search** - Filter events by category, date, and location
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### Organizer Features
- 📝 **Create Events** - Easy event creation with all necessary details
- 📊 **Dashboard** - Manage your events and view attendee insights
- 👥 **Attendee Management** - Track bookings and attendees
- ⚙️ **Settings** - Manage your profile and preferences

### Admin Features
- 👤 **User Management** - View and manage all users
- 📈 **Analytics** - Track platform statistics and event performance

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with server-side rendering
- **Tailwind CSS** - Modern utility-first CSS framework
- **React Icons** - Icon library
- **Axios** - HTTP client for API requests
- **Zustand** - State management
- **date-fns** - Date formatting and manipulation
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase** - PostgreSQL database with authentication
- **JWT** - JSON Web Tokens for authentication
- **Nodemailer** - Email sending service
- **QRCode** - QR code generation for tickets
- **Express Validator** - Input validation

### Database
- **Supabase (PostgreSQL)** - Managed PostgreSQL database with real-time capabilities

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed on your computer:

### 1. **Node.js and npm**
   - **Version Required:** Node.js 16.x or higher
   - **Download:** Visit [https://nodejs.org/](https://nodejs.org/)
   - **Installation:**
     - Download the LTS (Long Term Support) version
     - Run the installer and follow the prompts
     - Accept default settings
   - **Verify Installation:**
     ```bash
     node --version
     # Should show: v16.x.x or higher
     
     npm --version
     # Should show: 8.x.x or higher
     ```

### 2. **Git** (for cloning the repository)
   - **Download:** Visit [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - **Installation:** Run installer with default settings
   - **Verify Installation:**
     ```bash
     git --version
     # Should show: git version 2.x.x
     ```

### 3. **Code Editor**
   - **Recommended:** Visual Studio Code
   - **Download:** [https://code.visualstudio.com/](https://code.visualstudio.com/)

### 4. **Supabase Account** (Free)
   - **Sign Up:** Visit [https://supabase.com/](https://supabase.com/)
   - Click "Start your project" → Sign up with GitHub or email
   - You'll create a project in the setup steps below

### 5. **Gmail Account** (for sending emails)
   - You need a Gmail account to send booking confirmation emails
   - You'll configure this in the setup steps below

---

## 📁 Project Structure

```
EventsApp/
├── frontend/                  # Next.js frontend application
│   ├── components/           # Reusable React components
│   │   ├── EventCard.js     # Event display card
│   │   ├── EventDetails.js  # Event detail page
│   │   ├── EventsList.js    # Events grid listing
│   │   ├── Hero.js          # Homepage hero section
│   │   ├── Layout.js        # Main layout wrapper
│   │   ├── Navbar.js        # Navigation bar
│   │   ├── SearchBar.js     # Search functionality
│   │   └── CategoryFilter.js # Category filtering
│   ├── contexts/            # React context providers
│   ├── lib/                 # Utility functions
│   │   └── api.js          # Axios API client
│   ├── pages/               # Next.js pages (routes)
│   │   ├── index.js        # Homepage
│   │   ├── events/         # Event pages
│   │   ├── auth/           # Authentication pages
│   │   └── dashboard/      # User dashboard
│   ├── store/               # Zustand state management
│   ├── styles/              # Global styles
│   ├── package.json         # Frontend dependencies
│   └── next.config.js       # Next.js configuration
│
├── backend/                  # Express.js backend API
│   ├── config/              # Configuration files
│   │   └── supabase.js     # Supabase client setup
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── booking.controller.js
│   │   └── user.controller.js
│   ├── middleware/          # Express middleware
│   │   └── auth.middleware.js # JWT authentication
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   └── booking.routes.js
│   ├── services/            # Business logic services
│   │   ├── email.service.js
│   │   └── reminder.service.js
│   ├── database/            # Database schemas
│   │   └── schema.sql
│   ├── .env                 # Environment variables
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
│
└── README.md                 # This file
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Download the Project

#### Option A: Clone with Git (Recommended)
```bash
# Open Terminal (Mac/Linux) or PowerShell (Windows)
# Navigate to where you want to store the project
cd Desktop

# Clone the repository
git clone <your-repository-url>

# Navigate into the project
cd EventsApp
```

#### Option B: Download ZIP
1. Download the project as a ZIP file
2. Extract it to your desired location
3. Open Terminal/PowerShell and navigate to the folder:
   ```bash
   cd path/to/EventsApp
   ```

---

### Step 2: Set Up Supabase Database

#### 2.1 Create a Supabase Project
1. Go to [https://supabase.com/](https://supabase.com/)
2. Click **"Start your project"** → Sign up/Login
3. Click **"New Project"**
4. Fill in the details:
   - **Name:** `EventsApp` (or any name you like)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free
5. Click **"Create new project"** (takes 1-2 minutes)

#### 2.2 Get Your Supabase Credentials
1. Once the project is created, go to **Settings** (gear icon on left sidebar)
2. Click **"API"** in the settings menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
4. **COPY THESE** - you'll need them in Step 3

#### 2.3 Create Database Tables
1. In Supabase dashboard, click **"SQL Editor"** (in left sidebar)
2. Click **"New Query"**
3. Open the file `backend/database/schema.sql` in your code editor
4. Copy the ENTIRE contents of that file
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. You should see: "Success. No rows returned"

**✅ Your database is now set up with all necessary tables!**

---

### Step 3: Configure Backend Environment Variables

#### 3.1 Navigate to Backend Folder
```bash
cd backend
```

#### 3.2 Create Environment File
The backend folder should already have a `.env` file. Open it in your code editor.

#### 3.3 Update the .env File
Replace the values with your own:

```env
# Server Configuration
PORT=3002
NODE_ENV=production

# Supabase Configuration
# Replace these with YOUR Supabase credentials from Step 2.2
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_anon_key_here

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_random_string_here_change_this
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration (use YOUR Gmail)
EMAIL_FROM=your-email@gmail.com

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password_here
```

**Important Notes:**
- Replace `SUPABASE_URL` with your Project URL from Step 2.2
- Replace both `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY` with your anon/public key
- Replace `JWT_SECRET` with any random long string (e.g., `my_super_secret_key_12345`)
- We'll configure email in Step 4

---

### Step 4: Configure Gmail for Sending Emails

#### 4.1 Enable 2-Step Verification on Your Gmail
1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Sign in with your Gmail account
3. Scroll to **"Signing in to Google"**
4. Click on **"2-Step Verification"**
5. Click **"Get Started"** and follow the setup process
6. You'll need your phone to receive verification codes

#### 4.2 Generate App Password
1. After 2-Step Verification is enabled, go to:
   [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. In **"App name"** field, type: `EventsApp`
3. Click **"Create"**
4. Google will show a 16-character password (e.g., `abcd efgh ijkl mnop`)
5. **Copy this password** (you won't see it again!)

#### 4.3 Update .env with Email Settings
In your `backend/.env` file, update these lines:

```env
EMAIL_FROM=your-actual-email@gmail.com
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=abcdefghijklmnop  # Paste the 16-char password WITHOUT SPACES
```

**Example:**
```env
EMAIL_FROM=john.doe@gmail.com
SMTP_USER=john.doe@gmail.com
SMTP_PASS=xyzw1234abcd5678
```

**✅ Email sending is now configured!**

---

### Step 5: Install Backend Dependencies

Still in the `backend` folder:

```bash
# Install all required packages
npm install
```

This will install:
- express
- supabase
- nodemailer
- jsonwebtoken
- bcryptjs
- And all other dependencies

**Wait for it to complete** (may take 1-3 minutes)

---

### Step 6: Configure Frontend Environment

#### 6.1 Navigate to Frontend Folder
```bash
# Go back to root, then to frontend
cd ..
cd frontend
```

#### 6.2 Create/Update Environment File
Create a file named `.env.local` in the frontend folder:

```bash
# For Windows PowerShell
New-Item .env.local

# For Mac/Linux Terminal
touch .env.local
```

#### 6.3 Add Frontend Environment Variables
Open `.env.local` and add:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

**✅ Frontend is configured!**

---

### Step 7: Install Frontend Dependencies

Still in the `frontend` folder:

```bash
npm install
```

This will install:
- next
- react
- tailwindcss
- axios
- zustand
- And all other dependencies

**Wait for it to complete** (may take 2-5 minutes)

---

## 🎯 Running the Application

You need to run **both** the backend and frontend servers.

### Option 1: Using Two Terminal Windows (Recommended for Beginners)

#### Terminal 1 - Backend Server
```bash
# Navigate to backend folder
cd backend

# Start the backend server
node server.js
```

**You should see:**
```
📅 Reminder service initialized
✅ Starting server setup...
🚀 Server running on port 3002
📍 Environment: production
✅ Server is ready to accept connections
```

**✅ Backend is running on http://localhost:3002**

**⚠️ Keep this terminal window open!**

---

#### Terminal 2 - Frontend Server
Open a **NEW** terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Start the frontend development server
npm run dev
```

**You should see:**
```
- ready started server on 0.0.0.0:3000
- event compiled client and server successfully
- Local: http://localhost:3000
```

**✅ Frontend is running on http://localhost:3000**

**⚠️ Keep this terminal window open too!**

---

### Option 2: Using One Terminal with Background Processes

#### For Windows PowerShell:
```powershell
# Start backend in background
Start-Process powershell -ArgumentList "cd backend; node server.js"

# Start frontend in background
Start-Process powershell -ArgumentList "cd frontend; npm run dev"
```

#### For Mac/Linux:
```bash
# Start backend in background
cd backend && node server.js &

# Start frontend in background
cd ../frontend && npm run dev &
```

---

## 🧪 Testing the Application

### Step 1: Open the Application
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:3000**
3. You should see the EventsApp homepage with a blue hero section

### Step 2: Register a New Account
1. Click **"Register"** in the top right
2. Fill in the form:
   - Full Name: `Test User`
   - Email: Your email address
   - Password: At least 6 characters
3. Click **"Register"**
4. You should be redirected to the homepage and see your name in the navbar

### Step 3: Create an Event
1. Click **"Create Event"** button
2. Fill in event details:
   - Title: `My First Event`
   - Description: Some description
   - Date: Pick a future date
   - Location: `New York`
   - Category: Choose any
   - Price: `10`
   - Total Tickets: `100`
3. Click **"Create Event"**
4. You should see a success message

### Step 4: Book an Event
1. Go back to homepage
2. Click on any event card
3. Select number of tickets
4. Click **"Book Now"**
5. **Check your email** for booking confirmation! 📧

### Step 5: View Your Bookings
1. Click on your name in the navbar
2. Click **"My Bookings"**
3. You should see your booking with:
   - Event details
   - Booking reference number
   - QR code

**🎉 Congratulations! Your EventsApp is fully working!**

---

## 📧 Email Configuration

### What You Should Receive via Email

When a user books an event, they automatically receive an email with:

1. **Event Details:**
   - Event title
   - Date and time
   - Location and venue
   - Number of tickets
   - Total amount paid

2. **Booking Information:**
   - Booking reference number
   - QR code (stored in database)
   - Link to view bookings

3. **Professional HTML Design:**
   - Beautiful gradient header
   - Well-formatted details
   - Call-to-action buttons

### Troubleshooting Email Issues

#### Email Not Received?

**1. Check Backend Terminal for Errors:**
Look for messages like:
```
📧 [Email Service] Sending booking confirmation to user@email.com
✅ Booking confirmation email sent
```

**2. Check Spam/Junk Folder:**
Gmail might filter the emails initially

**3. Verify App Password:**
- Make sure you removed all spaces from the password
- The password should be 16 characters, no spaces
- Format: `abcdefghijklmnop` (NOT `abcd efgh ijkl mnop`)

**4. Regenerate App Password if Needed:**
- Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Delete old password
- Create new one
- Update `.env` file
- Restart backend server

**5. Check 2-Step Verification:**
- Must be enabled for App Passwords to work
- Verify at [https://myaccount.google.com/security](https://myaccount.google.com/security)

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Port 3000 is already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### Issue 2: "Port 3002 is already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3002 | xargs kill -9
```

#### Issue 3: "Cannot find module 'xyz'"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### Issue 4: "Supabase connection failed"
**Solution:**
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Check if your Supabase project is active
- Make sure you ran the `schema.sql` file

#### Issue 5: "JWT authentication failed"
**Solution:**
- Clear browser cookies/localStorage
- Logout and login again
- Make sure `JWT_SECRET` is set in backend `.env`

#### Issue 6: Frontend shows "Network Error"
**Solution:**
- Make sure backend is running on port 3002
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Look for CORS errors in browser console

#### Issue 7: "Email sending failed"
**Solution:**
- Check Gmail App Password has no spaces
- Verify 2-Step Verification is enabled
- Check SMTP settings in `.env`
- Look at backend terminal for specific error message

---

## 🏗️ Project Architecture

### Authentication Flow
1. User registers → Password hashed with bcrypt → Stored in Supabase
2. User logs in → JWT token generated → Token stored in localStorage
3. Protected routes → Token verified → Access granted/denied

### Booking Flow
1. User selects event and tickets
2. Backend checks availability
3. Booking created in database
4. Tickets decremented
5. QR code generated
6. Email sent with confirmation
7. User redirected to bookings page

### Database Schema
```
users
├── id (uuid, primary key)
├── email (unique)
├── full_name
├── password_hash
├── role (user/organizer/admin)
└── created_at

events
├── id (uuid, primary key)
├── organizer_id (foreign key → users)
├── title
├── description
├── date
├── location
├── category
├── price
├── total_tickets
├── available_tickets
├── image_url
└── created_at

bookings
├── id (uuid, primary key)
├── user_id (foreign key → users)
├── event_id (foreign key → events)
├── booking_reference
├── number_of_tickets
├── total_amount
├── status
├── qr_code
└── created_at
```

---

## 📝 Default Admin Account

After running the database schema, you can create an admin account by:

1. Register normally through the UI
2. Go to Supabase Dashboard → Table Editor → users
3. Find your user and change `role` from `user` to `admin`
4. Refresh the app and you'll have admin access

---

## 🔒 Security Best Practices

1. **Never commit `.env` files to Git**
2. Change `JWT_SECRET` to a strong random string
3. Use strong passwords for Supabase
4. Keep dependencies updated: `npm update`
5. Use HTTPS in production
6. Enable rate limiting for API endpoints

---

## 📦 Production Deployment

### Deploy Backend (Example: Heroku)
```bash
heroku create eventsapp-backend
heroku addons:create heroku-postgresql
git push heroku main
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
# ... set all environment variables
```

### Deploy Frontend (Example: Vercel)
```bash
npm install -g vercel
cd frontend
vercel
# Follow prompts and add environment variables
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 💬 Support

If you encounter any issues:

1. Check this README thoroughly
2. Look at the Troubleshooting section
3. Check browser console for errors
4. Check backend terminal for error logs
5. Verify all environment variables are set correctly

---

## 🎓 Learning Resources

- **Next.js Documentation:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **React Documentation:** [https://react.dev/](https://react.dev/)
- **Express.js Guide:** [https://expressjs.com/](https://expressjs.com/)
- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**🎉 Happy Coding! Enjoy building with EventsApp!**
