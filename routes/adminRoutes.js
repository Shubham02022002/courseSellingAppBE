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

router.post("/signin", async (req, res) => {
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

router.use(authenticateAdmin);

router.post("/course", validate(CourseSchema), async (req, res) => {
  const { title, description, price, imageLink, isPublished } = req.body;
  try {
    const newCourse = await Course.create({
      title,
      description,
      price,
      imageLink,
      isPublished,
    });
    res.status(201).json({
      message: "Course created successfully",
      courseId: newCourse._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
