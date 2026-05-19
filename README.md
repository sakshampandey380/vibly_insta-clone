# GitHub Repository Short Description

Vibley is a modern full-stack Instagram-inspired social media platform built with React, TypeScript, Node.js, Express, MySQL, and Tailwind CSS featuring reels, chat, stories, profiles, authentication, media uploads, themes, notifications, and real-time social interactions.

---

# README.md

# Vibley — Modern Instagram Clone Social Media Platform

Vibley is a premium full-stack Instagram-inspired social media application designed with a modern Gen-Z social media experience in mind. The platform combines smooth UI animations, responsive layouts, reels, stories, messaging, profiles, media sharing, and customizable themes into one scalable social platform.

The application is built using React + TypeScript on the frontend and Node.js + Express + MySQL on the backend.

---

# Preview

Vibley provides:

* Instagram-inspired UI/UX
* Responsive mobile + desktop experience
* Reels system
* Stories section
* Real-time styled messaging UI
* Post creation and sharing
* User authentication system
* Profile customization
* Notification system
* Animated transitions with Framer Motion
* Media uploads
* Theme customization system
* Secure backend APIs
* JWT authentication
* MySQL database support

---

# Tech Stack

## Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* React Router DOM
* Lucide React Icons

## Backend

* Node.js
* Express.js
* TypeScript
* MySQL
* JWT Authentication
* Multer
* Bcrypt
* Zod Validation
* CORS
* Dotenv

---

# Main Features

## Authentication System

* User Signup
* User Login
* JWT Authentication
* Password Hashing with Bcrypt
* Protected Routes
* Session Persistence
* Authentication Modal

---

## Home Feed

* Modern social media feed
* Like and reaction system
* Comments section
* Share functionality
* Post interactions
* Animated feed cards
* Responsive feed layout

---

## Stories System

* Story circles UI
* Interactive story previews
* Instagram-inspired story design
* Smooth transitions and animations

---

## Reels System

* Vertical reels viewer
* Video-based social content
* Modern swipe experience
* Mobile-first reel interaction

---

## Messaging System

* Chat list interface
* Modern messaging window
* Message bubbles
* Conversation-based layout
* Responsive mobile chat UI

---

## User Profiles

* Dynamic profile pages
* User profile previews
* Profile editing
* Profile banner support
* Avatar/profile image support
* Bio section
* Website links
* Social links
* Personal information customization

---

## Post Management

* Create posts
* Upload media
* Image and video support
* Caption system
* Location support
* Post visibility options
* Post detail pages
* Comment drawer system

---

## Search System

* User search
* Search bar UI
* User discovery system
* Profile navigation

---

## Notification System

* Notifications page
* Notification items
* Social interaction alerts
* Interactive UI components

---

## Theme & Customization System

* App theme customization
* Chat theme customization
* Notification color customization
* Personalized user experience

---

# Frontend Structure

## Main Pages

* Home Feed Page
* Login Page
* Signup Page
* Search Page
* Messages Page
* Create Post Page
* Reels Page
* Notifications Page
* Profile Page
* Post Detail Page
* Edit Profile Page
* Settings Page

---

## Components Included

### Feed Components

* PostCard
* StoryBar
* StoryCircle
* ReactionBar
* ShareModal
* CommentDrawer

### Chat Components

* ChatList
* ChatWindow
* MessageBubble

### Profile Components

* ProfileHeader
* PostGrid
* ProfilePreviewCard
* ProfilePreviewTrigger

### Layout Components

* Sidebar
* TopBar
* MobileBottomNav
* Layout

### Common Components

* AuthModal
* FlashToast
* Avatar
* LoadingSkeleton
* MediaLightbox
* EmptyState
* Logo
* AlertMessage

---

# Backend Features

## API Routes

### Authentication Routes

* Signup API
* Login API
* Authentication middleware
* JWT token generation

### User Routes

* Profile management
* Search users
* Account settings
* Preferences system
* Password changing
* Profile customization
* Block system
* Follow system

### Post Routes

* Feed API
* Create post API
* Update post API
* Delete post API
* Comment APIs
* Media upload APIs

### Message Routes

* Conversation APIs
* Messaging APIs

### Notification Routes

* Notifications APIs

### Reel Routes

* Reel feed APIs
* Reel interactions

---

# Security Features

* Password hashing using Bcrypt
* JWT secured authentication
* Request validation with Zod
* Protected routes
* Secure media upload handling
* Error handling middleware
* Input sanitization

---

# Folder Structure

```bash
Vibley - Insta_Clone/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── lib/
│   │   ├── data/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.mjs
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── data/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   └── package.json
│
├── db/
│   ├── schema.sql
│   └── seed-notes.md
│
└── package.json
```

---

# Installation Guide

## Clone Repository

```bash
git clone https://github.com/yourusername/vibley.git
cd vibley
```

---

## Install Dependencies

```bash
npm install
```

---

## Setup Frontend

```bash
cd client
npm install
```

---

## Setup Backend

```bash
cd server
npm install
```

---

# Environment Variables

## Client `.env`

```env
VITE_API_URL=http://localhost:5000
```

## Server `.env`

```env
PORT=5000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vibley
```

---

# Run Development Server

## Start Full Project

```bash
npm run dev
```

---

## Start Frontend Only

```bash
npm run dev:client
```

---

## Start Backend Only

```bash
npm run dev:server
```

---

# Build Project

```bash
npm run build
```

---

# UI & Design Highlights

* Premium Gen-Z social media design
* Smooth animations using Framer Motion
* Mobile-first responsive design
* Glassmorphism inspired interface
* Modern social platform aesthetics
* Interactive hover effects
* Clean typography and spacing
* Dark modern social UI

---

# Future Improvements

* Real-time socket messaging
* Push notifications
* Live streaming
* Story uploads
* AI-based recommendations
* Video calling
* Group chats
* Admin dashboard
* Explore page algorithm
* Advanced analytics

---

# Why This Project?

Vibley was built to demonstrate advanced full-stack development skills while creating a production-style modern social media application. The project focuses on:

* Frontend architecture
* Backend API development
* Authentication systems
* Database integration
* Responsive design
* User experience
* Scalable component structure
* Modern UI animation systems

---

# Developer

Developed by Saksham Pandey

* Full Stack Developer
* AI Generalist
* Prompt Engineer
* Gen AI Enthusiast

---

# License

This project is for educational and portfolio purposes.

---

# Final Notes

Vibley is not just a clone project — it is a complete modern social media platform architecture showcasing frontend engineering, backend development, responsive UI design, API structuring, authentication handling, media management, and scalable project organization.

The project was designed with modern startup-level UI inspiration and production-oriented architecture to simulate a real-world social media platform experience.
