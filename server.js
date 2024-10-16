const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "studentdb",
});

// Get all students
app.get("/students", (req, res) => {
  const sql = "SELECT * FROM students";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Get a single student by ID
app.get("/students/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM Students WHERE StudentID = ?";
  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Create a new student and profile data
app.post("/studentsProfileData", (req, res) => {
  const checkEmailSql = "SELECT * FROM studentsprofiledata WHERE Email = ?";
  
  // Check if the email is already registered
  db.query(checkEmailSql, [req.body.Email], (err, data) => {
    if (err) return res.json(err);
    if (data.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    } else {
      // Insert into students table
      const insertStudentSql = "INSERT INTO studentsprofiledata (FirstName, LastName, Gender, DateOfBirth, Email, Course, EnrollmentDate, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const studentValues = [
        req.body.FirstName,
        req.body.LastName,
        req.body.Gender,
        req.body.DateOfBirth,
        req.body.Email,
        req.body.Course,
        req.body.EnrollmentDate,
        req.body.Password,
      ];

      db.query(insertStudentSql, studentValues, (err, result) => {
        if (err) return res.json(err);
        return res.json("Student and profile data have been created successfully.");
      });
    }
  });
});

// Get a single student's profile data by email
app.get("/studentsProfileData/:email", (req, res) => {
  const { email } = req.params; // Extract 'email' from req.params
  const sql = "SELECT * FROM studentsprofiledata WHERE Email = ?"; // Correct column name
  db.query(sql, [email], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});


// Email uniqueness route
app.get("/check-email", (req, res) => {
  const { email } = req.query;
  const sql = "SELECT * FROM students WHERE Email = ?";
  db.query(sql, [email], (err, data) => {
    if (err) return res.json(err);
    return res.json({ isUnique: data.length === 0 });
  });
});

// Update student profile data
app.put("/students/:id", (req, res) => {
  const { id } = req.params;

  // Update students table
  const updateStudentSql = "UPDATE students SET FirstName = ?, LastName = ?, Email = ? WHERE StudentID = ?";
  const studentValues = [
    req.body.FirstName,
    req.body.LastName,
    req.body.Email,
    id,
  ];

  db.query(updateStudentSql, studentValues, (err, data) => {
    if (err) return res.json(err);

    // Update studentsProfileData table
    const updateProfileSql = "UPDATE studentsProfileData SET Gender = ?, DateOfBirth = ?, Course = ?, EnrollmentDate = ? WHERE StudentID = ?";
    const profileValues = [
      req.body.Gender,
      req.body.DateOfBirth,
      req.body.Course,
      req.body.EnrollmentDate,
      id,
    ];

    db.query(updateProfileSql, profileValues, (err, data) => {
      if (err) return res.json(err);
      return res.json("Student and profile data have been updated successfully.");
    });
  });
});

// Get all courses
app.get("/courses", (req, res) => {
  const sql = "SELECT * FROM courses";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM studentsprofiledata WHERE Email = ? AND Password = ?";

  db.query(sql, [email, password], (err, data) => {
    if (err) return res.json({ error: err });
    if (data.length > 0) {
      return res.json({ message: "Login successful", user: data[0] });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

app.listen(8081, () => {
  console.log("Server is running on port 8081...");
});
