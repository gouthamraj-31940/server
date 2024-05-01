const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb+srv://admin1:admin1@cluster0.cnpnpwd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a user schema
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: { type: String, unique: true }, // Ensure email uniqueness
  password: String,
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle user registration
app.post('/register', async (req, res) => {
  const { firstName, lastName, phoneNumber, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create a new user document
    const newUser = new User({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
    });

    // Save the new user to the database
    await newUser.save();

    // Send a success response to the frontend
    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Endpoint to handle user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists with the provided email
    const user = await User.findOne({ email });

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the provided password matches the stored password
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // If email and password are correct, return success response
    res.status(200).json({ success: true, message: 'Login successful' });
  } catch (error) {
    // Handle any errors that occur during login
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
