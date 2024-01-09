import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import StudentModel from "../../models/StudentModel.js";

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

      const student = await StudentModel.findOne({ email: req.body.email });

      if (!student) {
        return res.status(401).json({
          error: "Невірні авторизаційні дані",
        });
      }

      if (!student.verification.status) {
        return res.status(403).json({
          message: "Адресу електронної пошти не підтверджено",
        });
      }

      const password = await bcrypt.compare(
        req.body.password,
        student.password
      );

      if (!password) {
        return res.status(401).json({
          error: "Невірні авторизаційні дані",
        });
      }

      const expiresIn = 7 * 24 * 60 * 60;
      const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
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

  async signup(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }

      const student = await StudentModel.findOne({ email: req.body.email });

      if (student) {
        return res.status(401).json({
          error: "Адреса електронної пошти вже зайнята",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req.body.password, salt);

      const token = crypto.randomBytes(16).toString("hex");

      await StudentModel.create({
        email: req.body.email,
        password: password,
        name: req.body.name,
        balance: 100,
        verification: {
          status: false,
          token: token,
        },
      });

      await transporter.sendMail({
        from: {
          name: "ItPoint",
          address: process.env.SMTP_USER,
        },
        to: req.body.email,
        subject: "Підтвердження електронної пошти",
        text: token,
        html: `
                    ${token}<br/><br/> 
                    <a href="http://localhost:5173/confirm/${token}">
                        http://localhost:5173/confirm/${token}
                    </a> <br/>
                    <a href="http://itpoint.vercel.app/confirm/${token}">
                        http://itpoint.vercel.app/confirm/${token}
                    </a> <br/>
                `,
      });

      return res.json({
        message:
          "На адресу електронної пошти надіслано лист з інструкцією для підтвердження",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час реєстрації акаунту",
      });
    }
  }

  async confirmAccount(req, res) {
    try {
      const student = await StudentModel.findOneAndUpdate(
        { "verification.token": req.params.token },
        { "verification.status": true, "verification.token": null }
      );

      if (student) {
        const expiresIn = 7 * 24 * 60 * 60;
        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
          expiresIn,
        });

        return res.json({
          token: token,
        });
      } else {
        return res.status(404).json({
          error: "Некоректний токен",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час підтвредження адреси електронної пошти",
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

      const student = await StudentModel.findOne({ email: req.body.email });

      if (!student) {
        return res.status(404).json({
          error: "Користувача не знайдено",
        });
      }

      if (!student.verification.status) {
        return res.status(403).json({
          error: "Адресу електронної пошти не підтверджено",
        });
      }

      const token = crypto.randomBytes(16).toString("hex");
      student.recovery.token = token;
      student.recovery.expiration = Date.now() + 60 * 60 * 1000;
      await student.save();

      await transporter.sendMail({
        from: {
          name: "ItPoint",
          address: process.env.SMTP_USER,
        },
        to: student.email,
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

      const student = await StudentModel.findOne({
        "recovery.token": req.params.token,
      });

      if (!student) {
        return res.status(404).json({
          error: "Некоректний токен",
        });
      }

      if (student.recovery.expiration < Date.now()) {
        return res.status(403).json({
          error: "Час дії токена скінчився",
        });
      }

      student.password = password;
      student.recovery.token = null;
      student.recovery.expiration = null;
      await student.save();

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
