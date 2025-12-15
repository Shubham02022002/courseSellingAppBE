const router = require("express").Router();
const { User, Course } = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  authenticateUser,
  userSchema,
} = require("../authMiddleware/userAuth.js");
const validate = require("../authMiddleware/validation.js");
const { default: mongoose } = require("mongoose");
const SECRET = process.env.SECRET;

router.post("/signup", validate(userSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const isUserExist = await User.findOne({ username });
    if (isUserExist) {
      return res.status(409).json({ message: "User already exits" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
    res
      .status(201)
      .json({ message: "User created successfully", token, id: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/signin", validate(userSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!(user || isPasswordValid)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
    res.status(200).json({
      message: "Logged in successfully",
      token: token,
      id: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.use(authenticateUser);

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/courses/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const isCourseValid = await Course.findById(courseId);
    if (!isCourseValid) {
      return res.status(404).json({ message: "Invalid courseId" });
    }
    await User.findOneAndUpdate(
      {
        _id: req.userId,
      },
      {
        $addToSet: {
          purchasedCourses: new mongoose.Types.ObjectId(courseId),
        },
      }
    );
    res.status(201).json({
      message: "Course purchased successfully",
      courseId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/purchasedCourses", async (req, res) => {
  try {
    const user = await User.findOne(
      {
        _id: req.userId,
      },
      { purchasedCourses: 1 }
    ).lean();
    res.status(200).json({
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});
module.exports = router;
