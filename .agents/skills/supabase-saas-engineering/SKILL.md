---
name: supabase-saas-engineering
description: Production-oriented, multi-tenant QR-based restaurant ordering SaaS engineering guidelines using FastAPI, Supabase PostgreSQL, RLS, Table Sessions, and React.
---

# Skill: Supabase SaaS Engineering for system

## Role and Objective

Act as a senior full-stack engineer, Supabase architect, PostgreSQL database specialist, DevOps engineer, and application security reviewer.

Build a production-oriented, multi-tenant QR-based restaurant ordering SaaS for Atmiya Dosa. The platform must support multiple restaurants using the same codebase. Onboarding a new restaurant should primarily require configuration and data entry, not rewriting the application.

## Technology Stack

- Frontend: React, JavaScript, HTML, CSS.
- Backend: Python with FastAPI.
- Database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- File storage: Supabase Storage when required.
- Realtime: Supabase Realtime where appropriate.
- Database migrations: version-controlled SQL migrations.
- Testing: pytest for backend, plus suitable frontend and integration tests.
- Deployment: environment-based configuration, secure secrets management, automated checks, and documented deployment procedures.

## 1. Architecture Rules

1. Inspect the existing repository, dependencies, configuration, database schema, and code before making changes.
2. Preserve existing working functionality. Avoid unnecessary rewrites and unrelated modifications.
3. Design a modular, configuration-driven, multi-tenant SaaS architecture.
4. Use reusable components, shared business logic, clear API boundaries, and consistent naming conventions.
5. Separate frontend presentation, backend business logic, database access, authentication, and authorization.
6. Establish one authoritative source of truth for transactional restaurant data: PostgreSQL.
7. Use Supabase for the selected database, authentication, storage, and realtime services. Do not introduce Appwrite or duplicate business data across multiple databases.
8. Avoid hardcoding restaurant names, table counts, menus, prices, themes, or business settings in application logic.
9. Prefer small, maintainable changes over unnecessary complexity. Do not build speculative features without a requirement.

## 2. Multi-Tenant Database Design

The application must securely support multiple independent restaurants.

Create normalized, appropriately indexed tables for:

- restaurants
- restaurant_members
- restaurant_settings
- restaurant_tables
- qr_codes, if a separate table is justified
- menu_categories
- menu_items
- table_sessions
- orders
- order_items
- payments
- coupons
- employees or restaurant_members with roles
- audit_logs

Add other tables only when justified by actual requirements.

Database requirements:

1. Use UUID primary keys where appropriate and foreign keys for relational integrity.
2. Add a restaurant_id tenant identifier to relevant business records.
3. Enforce tenant-scoped relationships, constraints, and queries.
4. Use suitable numeric types for monetary values, timestamps with time zones, explicit status fields, and appropriate indexes.
5. Use database constraints to prevent invalid states and inconsistent relationships.
6. Use version-controlled migrations for schema changes.
7. Never create separate copies of the schema for individual restaurants.
8. Avoid destructive migrations and production data resets without explicit approval.
9. Define transaction boundaries for order creation, payment updates, session closure, and other operations requiring consistency.
10. Design for concurrent orders, duplicate submissions, and safe retries.

## 3. Supabase Security

Security is mandatory, not optional.

1. Enable Row Level Security (RLS) on every exposed table containing protected data.
2. Create and test explicit policies for SELECT, INSERT, UPDATE, and DELETE as required.
3. Verify restaurant membership and roles before allowing access to tenant data.
4. Never trust restaurant_id, role, price, payment status, or ownership supplied by an untrusted client without server-side validation.
5. Never expose the Supabase service_role key or secret keys in frontend code, public repositories, logs, or client-visible configuration.
6. Use the least-privilege database permissions possible.
7. Use parameterized queries and safe database access patterns.
8. Protect employee administration, reports, customer information, orders, and payments against unauthorized access.
9. Treat QR codes as identifiers, not authentication credentials. Use sufficiently unpredictable tokens when needed and validate all order submissions server-side.
10. Implement suitable validation, rate limits, safe error responses, and audit logging.
11. Test cross-tenant access explicitly. A user belonging to Restaurant A must not be able to access Restaurant B's protected records.
12. Never claim that RLS is secure without examining and testing the actual policies.

## 4. FastAPI Backend

Implement clean, modular API endpoints with:

- Input and output validation using Pydantic.
- Authentication and authorization for protected routes.
- Secure verification of Supabase-issued access tokens.
- Restaurant membership and role checks.
- Centralized error handling and structured logging.
- Database transaction handling for critical operations.
- Consistent HTTP status codes and API response formats.
- Pagination and filtering for large order and activity lists.
- Idempotency protection for operations vulnerable to retries.
- Automated tests for successful requests, invalid input, unauthorized access, and failures.

Do not assume that hiding a button in React secures the corresponding API.

## 5. Restaurant Ordering and Table Sessions

The system must support this workflow:

1. Each restaurant has its own tables and permanent table QR codes.
2. A QR scan identifies the intended restaurant and table after server-side validation.
3. The backend finds the valid active table session or creates one according to the restaurant's session rules.
4. Multiple order tickets may belong to the same table session.
5. Each order has independent preparation and fulfilment status.
6. Payment status and table-session status are tracked separately.
7. Clearing browser data must not destroy an active session stored in the database.
8. Completing an order must not automatically terminate its table session.
9. Closing a session must follow explicit checkout and table-turnover rules.
10. After a session is closed, a new dining visit can create a new session without changing the permanent QR.
11. Handle concurrent scans, duplicate submissions, unavailable items, cancellations, and payment retries safely.
12. Never trust a browser's claim that payment was received. Verify online payments using the payment provider's trusted server-side confirmation or webhook. Cash payments require an authorized employee action.

## 6. Frontend Engineering

Build a premium, intuitive, responsive restaurant admin dashboard using reusable React components.

Brand palette:

- Primary Orange: #F97316
- Pure White: #FFFFFF
- Action Green: #16A34A
- Soft Orange: #FFF7ED
- Slate Dark: #1F2937
- Light Gray: #F3F4F6

The interface should include, as appropriate:

- Dashboard and sales summaries.
- Live order queue and order details.
- Table and QR management.
- Menu, category, price, availability, and discount management.
- Employee accounts and role management.
- Payment tracking and coupon management.
- Reports with daily, weekly, monthly, and yearly filters.
- Employee activity and audit history.
- Restaurant settings.

Follow accessibility, responsive design, clear typography, consistent spacing, useful loading states, error states, empty states, and confirmation dialogs for destructive actions.

Do not use fabricated statistics as real production data. Use clearly labelled sample data only in mockups and development fixtures.

## 7. Realtime and Performance

1. Use Supabase Realtime selectively for order and table updates.
2. Verify channel authorization and tenant isolation.
3. Do not assume realtime delivery is a substitute for persistent database state.
4. Handle reconnects, duplicate events, stale clients, and initial data loading.
5. Use appropriate indexes, pagination, and query optimization.
6. Prefer database constraints and transactions for correctness over frontend-only checks.
7. Never assume a change made directly through FastAPI will automatically produce the desired realtime behavior without verifying the configured integration.

## 8. DevOps and Configuration

1. Maintain separate development, testing, and production configurations.
2. Store secrets in environment variables or an approved secret manager.
3. Provide a safe .env.example containing placeholders only.
4. Never commit real credentials or production secrets.
5. Use reproducible dependency files and documented setup commands.
6. Run automated tests, linting, and production builds before declaring work complete.
7. Document Supabase setup, migrations, RLS policies, backups, recovery, deployment, and rollback.
8. Never deploy, alter paid infrastructure, or run destructive production commands without explicit approval.

## 9. Testing and Quality Assurance

For each feature:

1. Inspect existing behavior and identify acceptance criteria.
2. Plan the smallest suitable implementation.
3. Add unit, integration, and regression tests where appropriate.
4. Test authentication, authorization, RLS, and tenant isolation.
5. Test duplicate requests and concurrency for critical operations.
6. Test database migrations and relevant constraints.
7. Run actual available test commands and report their results.
8. Review changed files for regressions and security risks.
9. Report failures honestly. Never fabricate successful tests, builds, deployments, or security reviews.

## 10. Mandatory Development Workflow

For every substantial task:

- First inspect the repository and relevant project rules.
- Explain the proposed approach and identify risks.
- Identify required database migrations and API changes.
- Implement in small, coherent steps.
- Run relevant tests and builds.
- Review security, permissions, tenant isolation, and error handling.
- Summarize changed files, commands executed, verified results, and remaining limitations.

Do not overwrite existing work, remove data, disable security controls, or make destructive changes without explicit approval.

## Definition of Done

A feature is complete only when its requirements are implemented, relevant tests have actually run, security boundaries have been reviewed, applicable builds pass, and known limitations are documented.

Optimize for correctness, security, maintainability, usability, and reuse across restaurants—not merely for generating code quickly.
