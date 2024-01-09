import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import TeacherModel from "../../models/TeacherModel.js";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: true,
  },
});

class AuthController {
  async signin(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }

      const teacher = await TeacherModel.findOne({ email: req.body.email });

      if (!teacher) {
        return res.status(401).json({
          error: "Невірні авторизаційні дані",
        });
      }

      const password = await bcrypt.compare(
        req.body.password,
        teacher.password
      );

      if (!password) {
        return res.status(401).json({
          error: "Невірні авторизаційні дані",
        });
      }

      const expiresIn = 7 * 24 * 60 * 60;
      const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, {
        expiresIn,
      });

      return res.json({
        token: token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час входу в акаунт",
      });
    }
  }

  async requestRecovery(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }

      const teacher = await TeacherModel.findOne({ email: req.body.email });

      if (!teacher) {
        return res.status(404).json({
          error: "Користувача не знайдено",
        });
      }

      const token = crypto.randomBytes(16).toString("hex");
      teacher.recovery.token = token;
      teacher.recovery.expiration = Date.now() + 60 * 60 * 1000;
      await teacher.save();

      await transporter.sendMail({
        from: {
          name: "ItPoint",
          address: process.env.SMTP_USER,
        },
        to: teacher.email,
        subject: "Відновлення пороля",
        text: token,
        html: token,
      });

      return res.json({
        message:
          "На адресу електронної пошти надіслано лист з інструкцією для відновлення",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час відновлення доступу",
      });
    }
  }

  async confirmRecovery(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req.body.password, salt);

      const teacher = await TeacherModel.findOne({
        "recovery.token": req.params.token,
      });

      if (!teacher) {
        return res.status(404).json({
          error: "Некоректний токен",
        });
      }

      if (student.recovery.expiration < Date.now()) {
        return res.status(400).json({
          error: "Час дії токена скінчився",
        });
      }

      teacher.password = password;
      teacher.recovery.token = null;
      teacher.recovery.expiration = null;
      await teacher.save();

      return res.json({
        message: "Пароль успішно змінено",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час відновлення доступу",
      });
    }
  }
}

export default new AuthController();
