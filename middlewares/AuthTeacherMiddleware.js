import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import TeacherModel from "../models/TeacherModel.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

export default async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({
        message: "Токен не передано",
      });
    }

    jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET,
      async (error, data) => {
        if (error) {
          return res.status(403).json({
            message: "Некоректний токен",
          });
        }

        const teacher = await TeacherModel.findOne({ _id: data.id });

        if (!teacher) {
          return res.status(404).json({
            message: "Користувача не знайдено",
          });
        }

        req.user = data.id;
        return next();
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Помилка на сервері",
    });
  }
};
