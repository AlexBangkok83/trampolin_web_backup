# Trampolin Web App Migration - Product Requirements Document

## Project Overview

**Product Name:** Trampolin Web App  
**Project Type:** Slack App to SaaS Web App Migration  
**Timeline:** Phase 1 - Foundation & Framework Setup  
**Version:** 1.0

### Executive Summary

Trampolin is migrating from a Slack-based Facebook Ads analytics tool to a standalone SaaS web application. The current Slack app analyzes product URLs and generates reach analytics with downloadable CSV files. The web app will provide the same core functionality with improved UX, user management, and subscription-based access.

## Current State Analysis

### Existing Slack App Functionality

- **Input:** Product URLs (single or multiple)
- **Processing:** Facebook Ads Library data analysis
- **Output:** Reach analytics graphs + CSV downloads
- **User Base:** Internal team + prospective clients
- **Pricing:** Currently free (credit-based system)

### Key Features

1. **Product Reach Analysis:** Aggregated reach data over time
2. **Creative Breakdown:** Individual creative performance analysis
3. **Batch Processing:** Multiple URL analysis simultaneously
4. **Data Export:** CSV file downloads
5. **Credit System:** Usage tracking (8000+ credits currently)

## Goals & Objectives

### Primary Goals

- **Migrate core functionality** from Slack to web platform
- **Implement user authentication** and subscription management
- **Create modern, intuitive UI** for better user experience
- **Enable scalable business model** with tiered subscriptions

### Success Metrics

- Successful migration of all existing functionality
- User authentication and role-based access working
- Clean, modern interface matching design standards
- Foundation ready for future feature additions

## User Personas & Roles

### Internal Users

- **Admin/Internal Team**
  - Unlimited URL analysis access
  - User management capabilities
  - Advanced features (competitor search by demographics)

### External Users (Subscription-Based)

- **Basic Tier:** $29/month - 500 URL analyses
- **Mid Tier:** $39/month - 1000 URL analyses
- **Premium Tier:** Higher volume tiers (TBD)

### User Permissions

- Monthly billing cycle reset
- No overage charges (upgrade required)
- No team accounts initially (future consideration)

## Core Features & Requirements

### Phase 1 Features (Current Project Scope)

#### 1. User Authentication & Management

- **Sign up/Login:** Email + password authentication
- **Role-based access:** Admin vs. subscription tiers
- **Subscription management:** Usage tracking, billing cycle management
- **Profile management:** Basic user settings

#### 2. URL Analysis Interface

- **URL input:** Single or multiple product URLs
- **Processing feedback:** Progress indicators, success messages
- **Results display:** Interactive web-based analytics (no CSV downloads)
- **Save/Bookmark:** Save analyzed products for future reference
- **Quick update:** Re-analyze saved products with one click

#### 3. Dashboard & Navigation

- **Dashboard:** Recent searches, usage stats, account status
- **Search history:** View all previous analyses
- **Saved products:** Bookmarked products for easy re-analysis
- **Account page:** Usage limits, subscription details

#### 4. Core Analytics Display

- **Reach graphs:** Product reach over time (aggregated)
- **Basic data display:** Web-based spreadsheet view instead of CSV
- **Date tracking:** Historical data up to 1 year
- **Bookmark functionality:** Save high-performing products

### Future Features (Not in Current Scope)

- Interactive graph features (zoom, filters, date ranges)
- Advanced analytics (impressions, demographics)
- API access for higher tiers
- Team collaboration features
- Result sharing capabilities
- Competitor discovery tools (admin-only initially)

## Technical Requirements

### Frontend Framework

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling (modern SaaS design)
- **Responsive design** for all device sizes

### Backend & Database

- **NextAuth.js** for authentication
- **PostgreSQL** database with Prisma ORM
- **Subscription management** with usage tracking
- **Role-based middleware** for access control

### Infrastructure

- **Docker** containerization
- **Environment configuration** for dev/prod
- **Database migrations** and seeding

## User Experience Requirements

### Design Principles

- **Clean, modern SaaS aesthetic** (inspired by provided design example)
- **Intuitive navigation** with clear information hierarchy
- **Responsive design** across all devices
- **Fast, efficient workflows** for common tasks

### Key User Flows

#### New User Onboarding

1. Sign up with email/password
2. Choose subscription tier
3. Complete payment setup
4. Access dashboard with guided first analysis

#### Daily Usage Flow

1. Login → Dashboard (recent searches, usage stats)
2. Navigate to Analysis → Enter URL(s) → Process
3. View results → Save/Bookmark if valuable
4. Return to saved products → Quick re-analysis

#### Returning User Flow

1. Login → Dashboard
2. Access saved products → One-click update analysis
3. View updated results → Compare with historical data

## Page Structure & Navigation

### Main Navigation

- **Dashboard:** Usage overview, recent activity
- **Analyze:** URL input and processing interface
- **Saved Products:** Bookmarked analyses for re-processing
- **History:** All previous searches and results
- **Account:** Subscription, usage limits, settings

### Admin-Only Pages

- **User Management:** View/manage all users
- **Analytics Dashboard:** Platform usage statistics
- **Advanced Search:** Demographic/competitor tools

## Business Requirements

### Subscription Model

- **Billing:** Monthly subscription with auto-renewal
- **Usage Limits:** Hard limits per tier, no overages
- **Upgrade Flow:** In-app upgrade when limits reached
- **Billing Cycle Reset:** Usage resets on billing anniversary

### Success Criteria

- All current Slack functionality replicated
- User registration and authentication working
- Subscription limits properly enforced
- Modern, professional interface completed
- Foundation ready for advanced features

## Technical Architecture

### Database Schema Extensions

```sql
-- Extend existing User table
User {
  monthlySearchLimit: Int
  searchesUsed: Int
  billingCycleStart: DateTime
  subscriptionTier: String
}

-- New tables needed
SavedProduct {
  userId: String
  productUrl: String
  lastAnalyzed: DateTime
  bookmarked: Boolean
}

SearchHistory {
  userId: String
  productUrl: String
  searchDate: DateTime
  resultData: Json
}
```

### API Requirements

- **Authentication endpoints:** Login, signup, session management
- **Analysis endpoints:** URL processing, result retrieval
- **User management:** Profile, subscription, usage tracking
- **Data endpoints:** History, saved products, bookmarks

## Phase 1 Deliverables

### MVP Features

1. ✅ **User authentication system** (signup, login, logout)
2. ✅ **Role-based access control** (admin vs. subscriber)
3. ✅ **Subscription tier management** with usage tracking
4. ✅ **URL analysis interface** (input → process → results)
5. ✅ **Results display system** (web-based, no downloads)
6. ✅ **Save/bookmark functionality** for products
7. ✅ **Dashboard with recent activity** and usage stats
8. ✅ **Clean, modern UI design** across all pages

### Out of Scope (Phase 1)

- Advanced graph interactivity
- CSV/PDF export functionality
- Advanced analytics (demographics, impressions)
- API access
- Team collaboration features
- Mobile app development

## Design Requirements

### Visual Design

- **Modern SaaS aesthetic** with clean lines and professional appearance
- **Consistent color scheme** and typography
- **Clear visual hierarchy** with proper spacing
- **Loading states and feedback** for all user actions

### Responsive Design

- **Mobile-first approach** with desktop enhancement
- **Tablet optimization** for medium screen sizes
- **Touch-friendly interfaces** on mobile devices

## Success Metrics

### Launch Criteria

- [ ] All authentication flows working properly
- [ ] Subscription limits enforced correctly
- [ ] URL analysis functionality matches Slack app
- [ ] All main pages designed and functional
- [ ] User can complete full analysis workflow
- [ ] Admin functions accessible and working
- [ ] Modern, professional design implementation

### Post-Launch Goals

- User adoption from current Slack app users
- Successful subscription conversions
- Positive user feedback on interface improvements
- Foundation ready for Phase 2 feature additions

## Timeline & Milestones

### Phase 1: Foundation (Current Project)

- **Week 1-2:** Page structure and basic authentication
- **Week 3-4:** Core analysis interface and user flows
- **Week 5-6:** Design implementation and testing
- **Week 7-8:** Admin features and final polish

### Future Phases

- **Phase 2:** Advanced analytics and interactivity
- **Phase 3:** API development and integrations
- **Phase 4:** Mobile optimization and team features

## Risk Assessment

### Technical Risks

- **Data migration** from current system
- **Performance** with large datasets
- **Subscription billing** integration complexity

### Mitigation Strategies

- Gradual migration with parallel systems
- Performance testing with realistic data loads
- Simple billing implementation initially

## Conclusion

This PRD outlines the migration of Trampolin from a Slack app to a modern SaaS web application. Phase 1 focuses on replicating existing functionality with improved UX and user management, creating a solid foundation for future enhancements. The emphasis is on clean design, reliable functionality, and scalable architecture.
