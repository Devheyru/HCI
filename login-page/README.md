# Basic Student Authentication System

A simple, beginner-friendly full-stack Student Authentication System built to demonstrate secure credential verification using vanilla HTML/CSS/JavaScript on the frontend, Node.js + Express on the backend, and PostgreSQL for persistent data storage.

---

## 1. Project Overview

This project implements a secure student login portal:
- **Frontend**: Clean and responsive login page created with standard HTML5, CSS3, and JavaScript (Fetch API).
- **Backend**: Express.js server providing a single authentication endpoint: `POST /api/login`.
- **Database**: PostgreSQL with a `students` table storing unique student IDs and bcrypt-hashed passwords.
- **Security**: 
  - Passwords hashed with **bcrypt** (salt rounds: 10).
  - Parameterized SQL queries preventing **SQL injection**.
  - Secure credential storage using `.env`.
  - Generic authentication failure messages preventing account enumeration.

---

## 2. Required Software

Before running this project, ensure you have the following installed on your machine:

1. **Node.js** (v18 or higher) & **npm** (comes with Node.js)
   - Verify with: `node -v` and `npm -v`
2. **PostgreSQL** (v14 or higher) & `psql` command-line tool
   - Verify with: `psql --version`
3. A modern web browser (Google Chrome, Firefox, Microsoft Edge, etc.)

---

## 3. Project Structure

```
login-page/
├── frontend/
│   ├── index.html            # Login user interface
│   ├── register.html         # Registration user interface
│   ├── style.css             # Unified modern styles and alert states
│   ├── script.js             # Client-side login logic
│   └── register.js           # Client-side registration logic
├── backend/
│   ├── server.js             # Express server with /api/login and /api/register
│   ├── db.js                 # Local PostgreSQL connection pool
│   ├── supabase.js           # Supabase client initialization
│   ├── .env.example          # Environment variables template
│   └── .env                  # Active environment variables (git-ignored)
├── database/
│   ├── schema.sql            # Local PostgreSQL table & sample records
│   └── supabase_schema.sql   # Supabase SQL table & RLS policies
├── .gitignore                # Git exclusion rules for node_modules and .env
├── package.json              # Node.js project manifest & dependencies
└── README.md                 # Documentation and usage guide
```

---

## 4. How to Create and Initialize the PostgreSQL Database

### Step 4.1: Create the Database
Open your terminal / command prompt and connect to PostgreSQL to create the `student_db` database:

```bash
# Using psql:
psql -U postgres -c "CREATE DATABASE student_db;"
```

### Step 4.2: Run the Schema Initialization Script
Run the provided `database/schema.sql` script to create the `students` table and insert sample records:

```bash
psql -U postgres -d student_db -f database/schema.sql
```

*(If your PostgreSQL runs on a custom port such as 5433, add `-p 5433` to the command).*

---

## 5. How to Configure Environment Variables

Create a file named `.env` in the project root directory (or in `backend/`) based on `backend/.env.example`:

```env
# Server Port
PORT=3000

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=student_db
```

> **Note**: Update `DB_PASSWORD` and `DB_PORT` with your local PostgreSQL setup.

---

## 6. How to Install Dependencies

Navigate to the project root directory (`login-page`) and run:

```bash
npm install
```

This installs:
- `express`: Fast, unopinionated web framework for Node.js
- `pg`: PostgreSQL client library for Node.js
- `bcrypt`: Password hashing and verification library
- `dotenv`: Loads environment variables from `.env`
- `cors`: Cross-Origin Resource Sharing middleware

---

## 7. How to Start the Backend Server

Start the Express server using npm:

```bash
npm start
```
*(or run directly with: `node backend/server.js`)*

You should see output similar to:
```
===========================================
Student Authentication Server is running!
Server URL: http://localhost:3000
Open http://localhost:3000 in your browser.
===========================================
Connected to PostgreSQL database: student_db
```

---

## 8. How to Open and Test the Frontend

1. Once the server is running, open your web browser and navigate to:
   ```
   http://localhost:3000
   ```
2. Alternatively, you can open `frontend/index.html` directly in your browser.
3. Test logging in using the sample credentials below.

---

## 9. Sample Student Login Credentials

The following pre-configured student accounts are loaded into the database:

| Student ID | Full Name | Plain Password | Status in Database |
| :--- | :--- | :--- | :--- |
| **0546/15** | Heyru | `heyru0546` | Bcrypt Hashed |
| **0540/15** | Henok | `henok0546` | Bcrypt Hashed |
| **0479/15** | Gemechu | `gemechu0479` | Bcrypt Hashed |

---

## 10. API Specification

### 1. Endpoint: `GET /api/status`
Checks the server and PostgreSQL database operational status.

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "status": "online",
  "message": "Student Authentication API is running",
  "timestamp": "2026-11-19T00:26:00.000Z"
}
```

---

### 2. Endpoint: `GET /api/students/:student_id`
Retrieves student public profile (excludes password hash).

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "student": {
    "id": 1,
    "student_id": "0546/15",
    "full_name": "Heyru"
  }
}
```

---

### 3. Endpoint: `POST /api/register`
Registers a new student account (hashes password with bcrypt and inserts into Supabase / PostgreSQL).

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "student_id": "0100/15",
  "full_name": "Sara Connor",
  "password": "securePassword123"
}
```

**Response Scenarios:**

1. **Successful Registration (`201 Created`)**:
   ```json
   {
     "success": true,
     "message": "Registration successful! You can now log in.",
     "student": {
       "id": 4,
       "student_id": "0100/15",
       "full_name": "Sara Connor"
     }
   }
   ```

2. **Duplicate Student ID (`409 Conflict`)**:
   ```json
   {
     "success": false,
     "message": "Student ID is already registered"
   }
   ```

3. **Validation Error (`400 Bad Request`)**:
   ```json
   {
     "success": false,
     "message": "All fields are required"
   }
   ```

---

### 4. Endpoint: `POST /api/login`
Authenticates a student by verifying their Student ID and password.

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "student_id": "0546/15",
  "password": "heyru0546"
}
```

**Response Scenarios:**

1. **Successful Authentication (`200 OK`)**:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "student": {
       "student_id": "0546/15",
       "full_name": "Heyru"
     }
   }
   ```

2. **Invalid Credentials (`401 Unauthorized`)**:
   ```json
   {
     "success": false,
     "message": "Invalid Student ID or Password"
   }
   ```

3. **Missing Fields (`400 Bad Request`)**:
   ```json
   {
     "success": false,
     "message": "Student ID and password are required"
   }
   ```

---

## 11. Security Highlights

1. **Password Hashing**: Passwords are never stored in plain text. They are hashed with bcrypt, protecting against credential leakage even if the database is exposed.
2. **Parameterized Queries**: SQL queries use parameter placeholders (`$1`), eliminating the possibility of SQL injection attacks.
3. **No Credential Leakage in Errors**: The system returns the identical error message (`"Invalid Student ID or Password"`) whether the Student ID doesn't exist or the password was incorrect, preventing username enumeration.
4. **Environment Isolation**: Database credentials and port configurations are maintained in `.env` and kept strictly server-side.
