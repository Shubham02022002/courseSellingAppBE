const { Schema, model, connect, default: mongoose } = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

connect(MONGO_URI).then((res) => {
  console.log("DB is connected " + res.connection.host);
});

const AdminSchema = new Schema({
  username: String,
  password: String,
});

const CourseSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  isPublished: Boolean, 
});

const userSchema = new Schema({
  username: String,
  password: String,
  purchasedCourses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const Admin = model("Admin", AdminSchema);
const Course = model("Course", CourseSchema);
const User = model("User", userSchema);

module.exports = {
  Admin,
  Course,
  User,
};
