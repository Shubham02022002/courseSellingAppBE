const router = require("express").Router();
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const z = require("zod");
const validate = require("./validation.js");

const userSchema = z.object({
  username: z.email(),
  password: z.string().min(5),
});

validate(userSchema);

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (!(authHeader || token)) {
    return res.status(401).json({ message: "Authentication required." });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Authentication failed." });
  }
};

module.exports = authenticateUser;
