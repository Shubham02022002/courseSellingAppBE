const router = require("express").Router();
const { Admin, Course } = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  authenticateAdmin,
  adminSchema,
  CourseSchema,
} = require("../authMiddleware/adminAuth");
const validate = require("../authMiddleware/validation.js");
const SECRET = process.env.SECRET;

router.post("/signup", validate(adminSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const isAdminExist = await Admin.findOne({ username });
    if (isAdminExist) {
      return res.status(409).json({ message: "Admin already exits" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, password: hashedPassword });
    const token = jwt.sign({ id: admin._id }, SECRET, { expiresIn: "1h" });
    res
      .status(201)
      .json({ message: "Admin created successfully", token, id: admin._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/signin", authenticateAdmin, async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    const isPasswordValid = bcrypt.compare(password, admin.password);
    if (!(admin || isPasswordValid)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ id: admin._id }, SECRET, { expiresIn: "1h" });
    res.status(200).json({
      message: "Logged in successfully",
      token: token,
      id: admin._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// router.post(
//   "/course",
//   authenticateAdmin,
//   validate(CourseSchema),
//   async (req, res) => {
//     const { title, description, price, imageLink, isPublished } = req.body;
//     try {
    
//     } catch (error) {}
//   }
// );

module.exports = router;
