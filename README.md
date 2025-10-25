# TinyLink URL Shortener

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

TinyLink is a full-stack URL shortening service built with a modern, type-safe technology stack. It provides a secure RESTful API and a responsive user interface, allowing authenticated users to create, manage, and track their short links through a personal dashboard.

Click the image to watch the demo on YouTube:

[![Demo Video](https://img.youtube.com/vi/D-5LB7QbCaI/0.jpg)](https://youtu.be/D-5LB7QbCaI)

## Features

-   **Secure User Authentication:** Implements a complete authentication system with user registration and login functionality using JWT (JSON Web Tokens) for secure, stateless API communication. Passwords are fully encrypted using `bcryptjs`.
-   **URL Shortening:** Convert long URLs into unique, easy-to-share short links using `nanoid` for collision-resistant code generation.
-   **Custom Short Codes:** Users have the option to provide their own custom codes for personalised, branded links.
-   **"My Links" Dashboard:** A private dashboard where authenticated users can view a complete list of all the links they have created, sorted by creation date.
-   **Link Statistics:** Users can view individual click counts and creation details for each of their links.
-   **Robust Validation:** The backend performs comprehensive validation to ensure submitted URLs are valid and that custom short codes meet format criteria and are not already in use.

## Tech Stack & Architecture

This project is built with a modern, type-safe stack and follows a clean architectural pattern to ensure maintainability and scalability.

-   **Backend:**
    -   **Runtime:** Node.js
    -   **Framework:** Express.js
    -   **Language:** TypeScript
    -   **Authentication:** JSON Web Tokens (`jsonwebtoken`)
    -   **Password Hashing:** `bcryptjs`
-   **Frontend:**
    -   **Build Tool:** Vite
    -   **Language:** TypeScript
    -   **UI:** Vanilla HTML5 & CSS3 with a modern, responsive design.
-   **Database:**
    -   SQLite3

The backend is structured with a service-oriented architecture, separating concerns into a **Routing Layer** (handling HTTP requests), a **Service Layer** (containing business logic and error propagation), and a **Data Access Layer** (interacting with the database).

## Getting Started

To run this project locally, you will need Node.js and npm installed.

### 1. Clone the Repository

```bash
git clone https://github.com/lanvu0/tinylink.git
cd tinylink
```

### 2. Backend Setup

The backend server is located in the root directory.

```bash
# Install backend dependencies
npm install

# Create an environment file
touch .env
```

Open the `.env` file and add a secret key for signing JWTs.

**.env**
```
JWT_SECRET=your_super_secret_key_here
```

### 3. Frontend Setup

The frontend application is located in the `frontend` directory.

```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create a local environment file
touch .env.local
```

Open the `frontend/.env.local` file and specify the URL of the backend API.

**frontend/.env.local**
```
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Running the Application

You will need to run the backend and frontend servers in two separate terminal windows.

**Terminal 1 (Backend - from the project root):**
```bash
# This command uses tsx to run the TypeScript server
npm start
```
The backend API will be running at `http://localhost:3000`. For a development experience with auto-reloading, a `dev` script using `nodemon` can be added to `package.json`.

**Terminal 2 (Frontend - from the `frontend` directory):**
```bash
npm run dev
```
The frontend application will be available at `http://localhost:5173` (or another port if 5173 is in use). Open this URL in your browser to use the application.

## API Endpoints

The following are the primary endpoints exposed by the backend API.

| Method | Endpoint              | Description                                        | Protection |
| :----- | :-------------------- | :------------------------------------------------- | :--------- |
| `POST` | `/register`           | Creates a new user account.                        | Public     |
| `POST` | `/login`              | Authenticates a user and returns a JWT.            | Public     |
| `POST` | `/shorten`            | Creates a new short link for the authenticated user. | Protected  |
| `GET`  | `/:shortCode`         | Redirects to the original long URL.                | Public     |
| `GET`  | `/stats/:shortCode`   | Retrieves data for a link owned by the user.       | Protected  |
| `GET`  | `/my-links`           | Retrieves all links owned by the user.             | Protected  |