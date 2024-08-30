# User Authentication App

This project is a full-stack application with a Node.js backend and Next.js frontend, implementing user registration, login, and profile viewing functionality. Unfortunately with times rectrictions I was copught falf wey reactor.

Right now there is a Next.js app live (`src/`). I wanted to use it for serving frontend and living next to apis. For now logic is still in `express/` directory (APIs, middleware, JWT utils, Redux Store, and React pages). There are some attempts to prepare new Redux Store with dependency injection. It is already working and Jest test green. 

Please read [architecture.md]()  to see what I was striving to do.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- pnpm (but can be run with npm too)

## Backend Setup

1. Install dependencies:
   ```
   pnpm i
   ```

2. Create a `.env` file with the following content:
   ```
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=your_db_name
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ```

3. Set up the database:
   - Create a new PostgreSQL database
   - Run the following SQL to create the users table:
     ```sql
     CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(50) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL
     );
     ```
     TODO: refactor to match the two scenarios: Drizzle ORM or direct PostgreSQL (code in `express/`)

4. Start the backend server:

## Features

- User registration
- User login
- View user profile
- Protected routes

## Technologies Used

- Backend: Node.js, Express.js, TypeScript, PostgreSQL
- Frontend: Next.js, React, Redux, TypeScript, Tailwind CSS
- Authentication: JWT