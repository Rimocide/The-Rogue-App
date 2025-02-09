// server.js
const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Firebase Client (modular v9) imports
const { initializeApp: initializeFirebaseApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

dotenv.config();

// -------------------------------------------
// 1. Initialize Firebase Admin SDK
//    using credentials stored in environment variables
// -------------------------------------------
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace literal \n with newlines
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// -------------------------------------------
// 2. Initialize Firebase Client SDK
//    (for login/authentication using email & password)
// -------------------------------------------
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseClientApp = initializeFirebaseApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseClientApp);

// -------------------------------------------
// 3. Set up Express
// -------------------------------------------
const app = express();
app.use(express.json());

// -------------------------------------------
// Middleware to verify Firebase token using Admin SDK
// -------------------------------------------
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// -------------------------------------------
// 4. API Endpoints
// -------------------------------------------

/**
 * Signup:
 * - Uses Firebase Admin to create a new user.
 * - Stores additional details in Firestore.
 */
app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    // Create a new user using Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Store extra user details in Firestore (e.g., name)
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name: name || '',
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Login:
 * - Uses Firebase Client SDK to sign in with email and password.
 * - Returns a Firebase ID token upon successful login.
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    // Sign in the user using the Firebase Client SDK
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const user = userCredential.user;
    // Get an ID token for the user
    const token = await user.getIdToken();
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Create a Todo:
 * - Requires authentication.
 * - Stores todo data (title, description, dueDate, etc.) in Firestore.
 */
app.post('/todos', authenticate, async (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const todo = {
    userId: req.userId,
    title,
    description: description || '',
    dueDate: dueDate || null,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    completed: false,
  };

  try {
    const docRef = await db.collection('todos').add(todo);
    res.status(201).json({ id: docRef.id, ...todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Todos:
 * - Retrieves all todos belonging to the authenticated user.
 */
app.get('/todos', authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection('todos')
      .where('userId', '==', req.userId)
      .get();

    const todos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a Todo:
 * - Deletes a todo by ID after verifying ownership.
 */
app.delete('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('todos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.userId) {
      return res
        .status(404)
        .json({ error: 'Todo not found or unauthorized' });
    }
    await docRef.delete();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mark Todo as Completed:
 * - Updates the 'completed' field of a todo.
 */
app.patch('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const docRef = db.collection('todos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.userId) {
      return res
        .status(404)
        .json({ error: 'Todo not found or unauthorized' });
    }
    await docRef.update({
      completed,
      updatedAt: admin.firestore.Timestamp.now(),
    });
    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------
// 5. Start the Server
// -------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
