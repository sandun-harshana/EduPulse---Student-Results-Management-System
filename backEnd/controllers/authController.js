require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db_config");
const bcrypt = require("bcryptjs");


//register a student

router.post("/register", async (req, res) => {
  const { regNo, indexNo, email, batch, password } = req.body;
  console.log("Received data:", req.body);

  const hashedPassword = await bcrypt.hash(password, 10);
  const query =
    "INSERT INTO students (reg_no, index_no, batch, email, password) VALUES (?, ?, ?, ?, ?)";

  try {
    const [results] = await pool.query(query, [
      regNo,
      indexNo,
      batch,
      email,
      hashedPassword,
    ]);
    return res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

//register a teacher
router.post("/teacher-register", async (req, res) => {
  const { teacherId, subjectCode, email, password } = req.body;
  console.log("Received data:", req.body);

  const hashedPassword = await bcrypt.hash(password, 10);
  const query =
    "INSERT INTO teachers (teacherId, subjectCode, email, password) VALUES (?, ?, ?, ?)";

  try {
    const [results] = await pool.query(query, [
      teacherId,
      subjectCode,
      email,
      hashedPassword,
    ]);
    return res.status(201).json({ message: "Teacher registered successfully" });
  } catch (err) {
    console.error("Database error:", err.message); // Log only the error message for clarity
    return res
      .status(500)
      .json({ error: "Database error occurred", details: err.message });
  }
});
pool
  .query("SELECT 1")
  .then(() => console.log("Database connection successful"))
  .catch((err) => console.error("Database connection error:", err));

// Unified login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received data:", req.body);

  try {
    let query, userType, user;

    // Check if user is a student
    query = "SELECT * FROM students WHERE email = ?";
    userType = "student";
    let [results] = await pool.query(query, [email]);

    if (results.length > 0) {
      user = results[0];
    } else {
      // If not a student, check if user is a teacher
      query = "SELECT * FROM teachers WHERE email = ?";
      userType = "teacher";
      [results] = await pool.query(query, [email]);

      if (results.length > 0) {
        user = results[0];
      } else {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token with additional fields
    const tokenPayload = {
      email: user.email,
      userType,
      ...(userType === "student" ? { index_no: user.index_no } : { teacherId: user.teacherId }),
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send response with user type and token
    return res.status(200).json({
      message: "Login successful",
      userType,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
