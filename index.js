import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import StudentRouter from "./routers/student/UserRouter.js";
import StudentAuthRouter from "./routers/student/AuthRouter.js";
import StudentCourseRouter from "./routers/student/CourseRouter.js";

import TeacherRouter from "./routers/teacher/UserRouter.js";
import TeacherAuthRouter from "./routers/teacher/AuthRouter.js";

import db from "./db.js";

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/student", StudentRouter); // особистий кабінет
app.use("/api/v1/student/auth", StudentAuthRouter); // авторизація
app.use("/api/v1/student/courses", StudentCourseRouter); // курси

app.use("/api/v1/teacher", TeacherRouter); // особистий кабінет
app.use("/api/v1/teacher/auth", TeacherAuthRouter); // авторизація

// app.use("/api/v1/admin/auth", AuthRouter)
// app.use("/api/v1/admin/me", UserRouter)
// app.use("/api/v1/admin/courses", CourseRouter)
// app.use("/api/v1/teachers", CourseRouter)
// app.use("/api/v1/students", CourseRouter)

app.listen(SERVER_PORT, (error) => {
  if (error) {
    console.error(`Помилка під час запуску сервера: ${error}`);
  } else {
    console.log(`Сервер працює на порту: ${SERVER_PORT}`);
  }
});
