# The Enchanted Co. - Childcare Marketplace Platform

## Overview

The Enchanted Co. is a full-stack web application that connects parents with verified babysitters through a modern marketplace platform. Built with React, Express, and PostgreSQL, it provides instant and scheduled childcare booking services with integrated payment processing, membership management, and communication features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme system
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack Query for server state, React Context for auth
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Payment**: Stripe Elements integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and express-session
- **Database**: PostgreSQL with Drizzle ORM
- **Communication**: Twilio for SMS/calling features
- **Email**: SendGrid for email services
- **Payment Processing**: Stripe with Connect for marketplace payments

## Key Components

### User Management
- **Dual User Types**: Parents and babysitters with different profile requirements
- **Profile Completion**: Multi-step onboarding process
- **Membership System**: Subscription-based access with one-time and installment options
- **Review System**: Bidirectional rating system between parents and babysitters

### Booking System
- **Instant Care**: Real-time babysitter matching for immediate needs
- **Scheduled Care**: Advanced booking for future childcare requirements
- **Status Management**: Complete booking lifecycle from request to completion
- **Payment Integration**: Automated payment processing with platform commission

### Communication Features
- **Masked Communication**: Twilio-powered SMS and calling without revealing personal numbers
- **In-App Messaging**: Direct messaging between parents and babysitters
- **Real-time Updates**: Booking confirmations and status updates

### Administrative Features
- **Profile Review**: Admin approval system for babysitter profiles
- **User Management**: Comprehensive admin dashboard
- **Payment Monitoring**: Transaction tracking and commission management

## Data Flow

1. **User Registration**: Users sign up and complete profile onboarding
2. **Membership Purchase**: Parents purchase membership to access booking features
3. **Profile Verification**: Babysitters submit profiles for admin review
4. **Booking Creation**: Parents create instant or scheduled care requests
5. **Sitter Matching**: System matches available babysitters based on criteria
6. **Payment Processing**: Automated payment with platform commission split
7. **Service Delivery**: Communication tools facilitate coordination
8. **Review & Rating**: Post-service feedback system

## External Dependencies

### Payment & Commerce
- **Stripe**: Payment processing and marketplace functionality
- **Stripe Connect**: Facilitates payments to babysitters

### Communication Services
- **Twilio**: SMS messaging and voice calling capabilities
- **SendGrid**: Email delivery for notifications and password resets

### Development Tools
- **Neon Database**: PostgreSQL hosting
- **Mapbox**: Location services and navigation features
- **Vite**: Build tool and development server

### Authentication & Security
- **bcrypt/scrypt**: Password hashing
- **express-session**: Session management
- **CORS**: Cross-origin resource sharing

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Local PostgreSQL or Neon cloud database
- **Environment Variables**: Local .env configuration

### Production Environment
- **Platform**: Replit deployment with autoscale
- **Build Process**: Vite build for frontend, esbuild for backend
- **Static Assets**: Served from dist/public directory
- **Session Storage**: In-memory store (suitable for single-instance deployment)

### Configuration
- **Port**: 5000 (internal) mapped to 80 (external)
- **Node Version**: 20.x
- **PostgreSQL**: Version 16

## Changelog

- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.