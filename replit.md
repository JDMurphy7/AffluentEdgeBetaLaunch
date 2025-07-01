# AffluentEdge - Premium AI Trading Journal

## Overview

AffluentEdge is a premium AI-powered trading journal and analytics suite that combines sophisticated trade analysis, custom strategy validation, and community features. The application allows traders to log trades through natural language input or advanced forms, leverages GPT-4 Vision for analysis, and provides comprehensive performance metrics and AI-driven insights.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom glass morphism design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API endpoints with structured error handling
- **Middleware**: Request logging, JSON parsing, CORS handling

### Design System
- **Color Palette**: Gold (#F9E086), Bronze (#E4BB76), Charcoal (#0F0F0F), White (#FFFFFF)
- **UI Style**: Premium glass morphism with backdrop blur effects
- **Typography**: Inter font family for professional appearance
- **Responsive**: Mobile-first design with desktop optimization

## Key Components

### Trading Journal Core
- **Trade Input**: Dual-mode system supporting natural language parsing and advanced form entry
- **AI Analysis**: GPT-4 integration for trade grading, strategy adherence scoring, and risk assessment
- **Strategy System**: Custom strategy validation with built-in and user-created strategies
- **Portfolio Tracking**: Real-time balance tracking with snapshot history

### AI Integration
- **Natural Language Processing**: Parses conversational trade inputs ("Bought 100 EURUSD at 1.0850")
- **Trade Analysis**: Grades trades A-F based on discipline rather than profit/loss
- **Vision API**: Screenshot analysis for chart-based trade documentation
- **Strategy Adherence**: Quantifies rule-following with percentage scores

### Analytics Dashboard
- **Performance Metrics**: Win rate, profit factor, maximum drawdown calculations
- **Equity Curve**: Interactive Chart.js visualization of account growth
- **Strategy Performance**: Comparative analysis across different trading approaches
- **Risk Management**: Position sizing and stop-loss placement evaluation

## Data Flow

### Trade Logging Process
1. User inputs trade via natural language or form
2. AI parses input to extract trade parameters
3. Trade stored in database with initial analysis
4. Background AI analysis generates comprehensive feedback
5. Portfolio metrics updated automatically
6. Dashboard reflects new performance data

### Analysis Pipeline
1. Trade data validation and normalization
2. Strategy rule matching and adherence scoring
3. Risk management evaluation
4. AI-powered feedback generation
5. Grade assignment and improvement suggestions
6. Historical performance correlation

## External Dependencies

### Core Libraries
- **Database**: Drizzle ORM with Neon PostgreSQL serverless
- **AI Services**: OpenAI GPT-4 and GPT-4 Vision APIs
- **UI Framework**: Radix UI primitives for accessibility
- **Charts**: Chart.js for data visualization
- **Validation**: Zod for schema validation and type safety

### Development Tools
- **Package Manager**: npm with lockfile for consistent dependencies
- **TypeScript**: Strict type checking with custom path aliases
- **Build**: ESBuild for production bundling
- **Development**: tsx for TypeScript execution in development

### External Integrations
- **Authentication**: Planned integration with modern auth providers
- **CRM**: HubSpot integration for lead capture and user onboarding
- **Database**: Neon serverless PostgreSQL for scalable data storage

## Deployment Strategy

### Development Environment
- **Platform**: Replit for rapid prototyping and beta testing
- **Hot Reload**: Vite development server with instant updates
- **Database**: Neon serverless with connection pooling
- **Environment Variables**: Secure API key management

### Production Considerations
- **Backend Hosting**: Railway for scalable backend services
- **Frontend**: Static site deployment with CDN optimization
- **Database**: Production Neon instance with backup strategies
- **Monitoring**: Error tracking and performance monitoring integration

### Build Process
- **Client Build**: Vite bundling with code splitting and optimization
- **Server Build**: ESBuild compilation to ESM modules
- **Database**: Drizzle migrations for schema management
- **Assets**: Optimized asset bundling with cache-busting

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Successfully implemented strict brand color consistency with dark glassmorphic theme using charcoal (#0F0F0F) background, gold/bronze accents, and premium aesthetic throughout the application
- July 01, 2025. Enhanced Add Trade page with image upload functionality, dual-mode entry (Quick Upload vs Advanced Upload), and AI-powered screenshot analysis for comprehensive trade documentation
- July 01, 2025. Successfully integrated HubSpot CRM for beta user registration with automatic contact creation and lead management
- July 01, 2025. Enhanced HubSpot integration with custom properties for geographic analysis including residency tracking, beta status management, and automatic property creation