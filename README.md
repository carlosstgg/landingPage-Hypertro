# HYPERTRO

**Hypertro** is a modern, performance-focused fitness web application designed to support hypertrophy training through intelligent routine management, real-time workout tracking, and gamified progression.

This project was built with a strong focus on **UX, performance, and data-driven training decisions**, aiming to bridge the gap between simple workout logging apps and tools that actively support progression during training sessions.

---

## 🎯 Why Hypertro?

During my own fitness journey, I noticed that most training apps focus on storing data, but offer very little assistance **during** the workout itself. Hypertro was created to address that gap by prioritizing:

- Real-time feedback while training  
- Clear visibility of past performance to support progressive overload  
- Simple but structured data relationships between routines, workouts, and exercises  
- A balance between performance, usability, and scalability  

Hypertro is both a **portfolio project** and a **long-term product** that will continue evolving.

---

## 🚀 Features

### 🏋️‍♂️ Smart Routine Builder
- Dynamic split generation based on selected weekly training frequency (Push/Pull/Legs, Upper/Lower, Full Body)
- Exercise organization by muscle groups
- Drag & drop interface for fast and intuitive routine customization
- Client-side validation to prevent invalid or overlapping routines

---

### 📊 Workout Tracking & Progress
- Live workout logging (weight, reps, RPE)
- Set-by-set history to compare current performance with previous sessions
- Volume tracking to support progressive overload
- Workout history lookup during active sessions

---

### 🏆 Gamification
- Rank system based on training consistency
- XP and level progression
- Streak tracking to reinforce long-term adherence

---

### 🔗 Sharing & Social
- Shareable routine links to easily distribute training plans
- Auto-generated workout summary cards optimized for social media sharing

---

## 🧩 Architecture Overview

Hypertro follows a modular and scalable frontend architecture with clear separation of concerns:

- **UI Components**: Reusable presentational components (buttons, cards, modals)
- **Feature Modules**: Routine builder, workout logger, progress tracking
- **State Management**: Context API for global session and workout state
- **Backend**: Supabase (PostgreSQL, authentication, APIs)

### Core Data Entities
- User
- Routine
- Workout
- Exercise
- Set

---

## 🛠️ Technology Stack

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS**
- Custom design system using vanilla CSS where needed

### Backend
- **Supabase** (PostgreSQL, Auth, APIs)

### State & Utilities
- Context API
- `framer-motion` / `tailwindcss-animate` (animations)
- `html-to-image` (workout card generation)
- `react-hot-toast` (notifications)

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- npm or pnpm
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/carlosstgg/Hypertro.git
   cd hypertro

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
