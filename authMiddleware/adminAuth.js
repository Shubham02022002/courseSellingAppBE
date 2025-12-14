const router = require("express").Router();
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const z = require("zod");
const validate = require("./validation.js");

const adminSchema = z.object({
  username: z.email(),
  password: z.string().min(5),
});

const CourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  imageLink: z.url(),
  isPublished: z.boolean(),
});

validate(adminSchema);

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (!(authHeader || token)) {
    return res.status(401).json({ message: "Authentication required." });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    req.admin = payload;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Authentication failed." });
  }
};

module.exports = { authenticateAdmin, adminSchema, CourseSchema };
