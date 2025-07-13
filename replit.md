# SkillAdder - Employee Skill Management System

## Overview

SkillAdder is a full-stack web application for managing employee skills and endorsements within organizations. Built with React frontend and Express backend, it provides a highly gamified platform for employees to showcase their skills, receive endorsements from colleagues, and track their professional development through an engaging points-based system with streaks, challenges, and rewards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom bronze/gold color scheme for gamification
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with JSON responses

### Data Storage
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations
- **Development Storage**: In-memory storage class for development/testing

## Key Components

### Database Schema
- **Users**: Core user information with gamification (levels, points)
- **Skills**: User skills with categories and proficiency levels
- **Endorsements**: Peer endorsements linking users and skills
- **Achievements**: Gamification system for tracking user milestones

### API Endpoints
- **User Management**: CRUD operations for users and user stats
- **Skill Management**: Adding, updating, and deleting skills
- **Endorsement System**: Creating and managing peer endorsements
- **Leaderboard**: Ranking systems and achievement tracking

### Frontend Pages
- **Dashboard**: Overview of user stats and recent activity
- **Skills**: Personal skill management with filtering and CRUD operations
- **Endorsements**: View received endorsements and endorse others
- **Directory**: Browse and endorse colleagues' skills

### UI Components
- **Gamification**: Achievement notifications, level badges, progress tracking, daily challenges, skill streaks
- **Modals**: Enhanced add skills modal with suggestions, import functionality, reward previews
- **Cards**: Skill cards with source tracking, employee cards, stats cards with bronze/gold theming
- **Navigation**: Persistent navbar with user level display
- **Engagement**: Skill update reminders, daily challenges, streak tracking, milestone rewards

## Data Flow

1. **User Authentication**: Hardcoded user ID for demo (user ID: 1)
2. **Skill Management**: Users create skills → stored in database → displayed with endorsement counts
3. **Endorsement Process**: Users endorse colleagues → points awarded → skill counts updated
4. **Gamification**: Actions trigger point awards → level progression → achievement notifications
5. **Real-time Updates**: React Query invalidates cache on mutations for instant UI updates

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React Query for data fetching
- **Database**: Drizzle ORM, Neon Database serverless driver
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Development**: Vite, TypeScript, ESBuild for production builds

### Styling and Design
- **Design System**: shadcn/ui components with "new-york" style
- **Icons**: Lucide React icons throughout the application
- **Color Scheme**: Custom bronze/gold theme for gamification elements
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Validation and Forms
- **Form Management**: React Hook Form with Hookform Resolvers
- **Schema Validation**: Zod for runtime type checking
- **Drizzle Integration**: Drizzle-zod for database schema validation

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **Backend**: tsx for TypeScript execution with nodemon-like reloading
- **Database**: Neon Database with connection pooling
- **Environment**: NODE_ENV=development with development-specific middleware

### Production Build
- **Frontend**: Vite build to `/dist/public` directory
- **Backend**: ESBuild compilation to `/dist/index.js`
- **Static Serving**: Express serves built frontend files in production
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Build Process
- **Type Checking**: TypeScript compilation check
- **Database Migrations**: Drizzle Kit push for schema updates
- **Asset Optimization**: Vite handles code splitting and optimization
- **Environment Variables**: DATABASE_URL required for database connection

### Architecture Decisions

**Problem**: Need for real-time UI updates after data mutations
**Solution**: React Query with aggressive cache invalidation
**Rationale**: Ensures immediate feedback while maintaining performance

**Problem**: Type safety between frontend and backend
**Solution**: Shared schema definitions and TypeScript throughout
**Rationale**: Reduces runtime errors and improves developer experience

**Problem**: Scalable UI component system
**Solution**: Radix UI primitives with shadcn/ui and Tailwind CSS
**Rationale**: Provides accessible, customizable components with consistent styling

**Problem**: Gamification without overwhelming complexity
**Solution**: Multi-layered gamification with points, streaks, challenges, and rewards
**Rationale**: Motivates frequent engagement while maintaining clean interface

**Problem**: Keeping skills data updated regularly (fluidic nature)
**Solution**: Daily challenges, update reminders, skill suggestions, and streak tracking
**Rationale**: Encourages employees to return frequently and keep skills current

**Problem**: Making skill addition engaging and effortless
**Solution**: Enhanced modal with tabs, suggestions, import functionality, and reward previews
**Rationale**: Reduces friction while increasing motivation through gamification