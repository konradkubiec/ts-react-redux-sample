# Assesment
Create a Node.js application that allows a user to register, login and view their details. The frontend pages should be written in React and Redux which will interact with a restful API the perform the various actions.

    To be considered for this position you will need to complete the required pages and API’s then return a link to a GitHub repository to retrieve this application. The GitHub repository should also contain an readme.txt file of how to install and configure your application.

## Pages required:
1. Registration page
    -  The registration page should accept the users name, email address and password (and confirm password).
    - On submission this page will send a request to a registration API e.g. POST /user/register
2. Login page
    - The login page that takes an email address and password then on submission send a POST request to a login API e.g. POST /user/login
3. Landing page
    - The landing page will be a shown once the user has registered or logged in.
    - This page can request the users details to display on the screen e.g. GET /user
4. Homepage
    - A homepage with some dummy content and welcome message, including navigation.

## Restful API’s required:
* POST /user/register - user registration
* POST /user/login – user login
    * When the login and registration API endpoints receive valid credentials, they should return a 200 response with a success and when it is anything else - it should return an error stating that the authentication / submission has failed.
* GET /user – fetch user details (optional)

### Points to note:
* Use React and Redux on the Front End.
* Use Postgres to store the user data.
* On the front end create a project in React and Redux that consumes these API endpoints and create a decent looking Front End for a login box and register page.
* Extra points for good validation of registration and login page, including valid email address, adequate passwords and ensuring that the user credentials are unique when registering.
* Extra points for making the login page responsive.
* Extra points given for making the pages look professional and easy to use (any Tailwind based Component Library).
* Extra points for adding a home page and usable navigation
* Extra points for using and supplying unit testing.
* Extra points for using JWT tokens for authentication
* Create the project in GitHub and provide the link
* Create a simple readme file that explains how to run the code

# Solution
## Architecture overview
Use tools like _https://mermaid.live/_ for preview.
```sequence
graph TD
    U(*Client: Browser*)
    
    subgraph Frontend [**React SPA** Frontend]
        subgraph A1[**/new**]
            A1.1[*Registration Page*
                Creating new users:
                - request new ID by provading valid password
                - store in-memory retrived ID
                - redirect to login]
        end
        subgraph A2[**/login**]
            A2.1[*Login Page*
                Removes JWT from memory. Shows login form:
                - ID input
                - password inputs
                - submit button]
        end
        subgraph A3[**/user**]
            A3.1[*Landing Page*
                Content restricted to loged-in users]
            A3.JWT{JWT?}
            A3.1t[TRUE:
                - Shows user ID and registration date
                - log-out link to /login]
            A3.1f[FALSE:
                - 'Please, chose one' message
                - link to /new
                - link to /login]
        end
        subgraph A4[**/home**]
            A4.1[*Homepage*
                Simple navigation to other routes:
                - /new
                - /login]
        end
    end
    subgraph Backend [**Backend**]
        subgraph static [**SPA** /...]
            JS[**React** SPA
                *Next.js and Redux Toolkit*]
        end
        subgraph APIs [**Express** /api/...]
            subgraph B1[**POST /api/user/register**]
            _[  form-data: password
                200: Non coliding unique ID]
            end
            subgraph B2[**POST /api/user/login**]
            B2.1[  200: JWT
                401: error as JSON]
            end
            subgraph B3[GET /api/user]
                B3.3[Auth Middleware]
                B3.4[200: *SELECT User wher ID JWT:user-id* as JSON
                    401: error as JSON]
            end
        end
        ORM[Drizzle **ORM**]
        Database[(
            ***PostgreSQL***
            via PGlite)]
        TYPES[[**Zod** schemas
        *orm.drizzle.team/docs/zod*]]
    end

    U -->|HTTP/HTTPS| A1 & A2 & A3 & A4
    Frontend -.-> JS

    A1 --> B1
    A2 --> B2
    A3.1 --> A3.JWT --> A3.1t --> B3
    A3.JWT --> A3.1f

    B1 & B2 & B3 --> ORM
    B3.3 --> B3.4

    ORM --> TYPES & Database
    JS --> TYPES
    
```
PGlite is WASM implementation of Postgres with TS types definitions. I run it in-memory for convinience.
Serverless driver can be easly swapped (for Neon, Xata, or Postgres.JS) enabling communications with external DB server (that can be run as container via Docker).

Docs: https://orm.drizzle.team/docs/get-started-postgresql

## Step by step plan

1. Turn assestment requirments into BDD scenarios
2. Development Setup
    * Create a new TypeScript project using Next.js and Redux Toolkit for react-redux
    * Add PGlite developemnt dependency for local database
    * Add Zod developemnt dependency
    * Add cypres developemnt dependency for end to end testing
    * Refactor BDD scenarios to cypres
3. Backend
    * Generate Zod schemas from Drizzle ORM schema ([drizzle-zod](https://orm.drizzle.team/docs/zod)) 
    * In TDD flow create REST API endpoints for registration, login, and user details
    * Implement JWT for authentication
4. Frontend
    * Set up Redux for state management and prepare userReducer
    * Double check if all Redux files starts with `'use client';`
    * Create components for Registration, Login, Landing, and Homepage
    * Implement Redux actions and reducers for user authentication
    * Implement input sanitisation with Zod infered types and feedback messages for unsported values
5. API Integration
    * Connect frontend with backend API endpoints
    * Implement form validation and error handling using Zod infered types
6. Styling and Responsiveness
    * Use Tailwind CSS for styling
    * Ensure responsive design, especially for the login page
5. Testing
    * Improve test coverage with unit tests for both frontend and backend
    * Documentation
    * Create a README file with setup and run instructions

## Guidelines
### Project Structure
```
/app
  layout.tsx
  page.tsx
  StoreProvider.tsx
/lib
  store.ts
  /features
    /user
      userSlice.ts
/pages
  home.tsx
  new.tsx
  login.tsx
  user.tsx
```

### User Model
```TypeScript
import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').nptNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


// Schema for selecting a user
export const selectUserSchema = createSelectSchema(users);

// Refining the fields in schema for inserting a user
export const insertUserSchema = createInsertSchema(users, {
  id: (schema) => schema.id.positive(),
  name: (schema) => schema.name.string().min(2).max(20),
  email: (schema) => schema.email.email().max(20),
  password: (schema) => schema.password.string().min(6).max(20),
  role: z.string(),
});

export type UserInput = z.infer<typeof insertUserSchema>;
export type UserOutput = z.infer<typeof selectUserSchema>;
```
# Progress
- ✔ `architecture.md` seed
- ✔ Dev Setup via:
    - `npx create-next-app@latest`
    - `pnpm i`
    - `pnpm dev`
    - up and running
- ✔ Test Setup via:
    - Unit: `pnpm add --save-dev jest`
    - E2E: `pnpm add --save-dev cypress`
    - package.json shortcuts
    - `pnpm test:watch`
    - `pnpm add --save-dev ts-jest`
    - `pnpm add --save-dev @jest/globals`
    - BDD scenarios
    - `pnpm test:e2e`
    - First ❌
- ✔ TDD:
    - `pnpm add @reduxjs/toolkit`
    - `pnpm add react-redux`