# Firebase Todo Backend

This is a Node.js backend for a Todo app that leverages Firebase for authentication and Firestore for data storage. The application uses:

- **Firebase Admin SDK** for secure server-side operations.
- **Firebase Client SDK** for authentication.
- **Express** for creating RESTful API endpoints.

## Features

- **User Signup:** Create new users with email and password.
- **User Login:** Authenticate users and return a Firebase ID token.
- **Todo Management:** Create, read, update, and delete todos.
- **Token Authentication:** Secure endpoints using Firebase token verification.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- A Firebase project with:
  - Email/Password authentication enabled.
  - Firestore database enabled.
- A Firebase service account (JSON credentials).
- [Postman](https://www.postman.com/) for API testing.

### Steps to Install

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/firebase-todo-backend.git
   cd firebase-todo-backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install express firebase-admin firebase dotenv
   ```

3. **Setup Environment Variables:**

   Create a `.env` file in the root directory and configure it as follows:

     ```env
    FIREBASE_API_KEY=your_api_key_here
    FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    FIREBASE_APP_ID=your_app_id
    
    # Firebase Admin Credentials (Service Account)
    FIREBASE_TYPE=service_account
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n
    FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
    FIREBASE_CLIENT_ID=your_client_id
    FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
    FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
    FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
    FIREBASE_CLIENT_CERT_URL=your_client_cert_url
    
    # Server Configuration
    PORT=5000

   ```

   Replace placeholders with actual values from Firebase.

4. **Run the Server:**

   ```bash
   node server.js
   ```

   Or use `nodemon` for development:

   ```bash
   nodemon server.js
   ```

## API Endpoints

### 1. Signup

- **URL:** `POST /signup`
- **Headers:** `Content-Type: application/json`
- **Body:**
  
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }
  ```

### 2. Login

- **URL:** `POST /login`
- **Headers:** `Content-Type: application/json`
- **Body:**

  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- **Response:**

  ```json
  {
    "token": "YOUR_FIREBASE_ID_TOKEN"
  }
  ```

### 3. Create a Todo

- **URL:** `POST /todos`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_FIREBASE_ID_TOKEN`
- **Body:**

  ```json
  {
    "title": "Buy Groceries",
    "description": "Get milk and bread",
    "dueDate": "2025-02-10"
  }
  ```

### 4. Get Todos

- **URL:** `GET /todos`
- **Headers:**
  - `Authorization: Bearer YOUR_FIREBASE_ID_TOKEN`

### 5. Delete a Todo

- **URL:** `DELETE /todos/:id`
- **Headers:**
  - `Authorization: Bearer YOUR_FIREBASE_ID_TOKEN`

### 6. Mark Todo as Completed

- **URL:** `PATCH /todos/:id`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_FIREBASE_ID_TOKEN`
- **Body:**

  ```json
  {
    "completed": true
  }
  ```

## Testing with Postman

1. **Obtain a Firebase ID Token** by logging in.
2. **Set Authorization Header:**
   - Key: `Authorization`
   - Value: `Bearer YOUR_FIREBASE_ID_TOKEN`
3. **Test Endpoints** using the provided requests.

## Stopping and Restarting the Server

- To stop the server: `Ctrl + C`
- To restart the server: `node server.js` or `nodemon server.js`

## Acknowledgements

This project was constructed with the assistance of generative AI (mainly ChatGPT). Significant efforts were made to understand Firebase integration and backend development fundamentals thoroughly.


