const app = require("express")();
const bodyParser = require("body-parser");
const adminRouter = require("./routes/adminRoutes.js");
const userRouter = require("./routes/userRoutes.js");
require("dotenv").config();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use("/admin", adminRouter);
app.use("/user", userRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Invalid Route!");
});

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
