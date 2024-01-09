import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";

import StudentModel from "../../models/StudentModel.js";
import LessonModel from "../../models/LessonModel.js";
import ScheduleModel from "../../models/ScheduleModel.js";
import CourseModel from "../../models/CourseModel.js";

dotenv.config({ path: new URL("../../.env", import.meta.url) });
const PORTMONE_USER = process.env.PORTMONE_USER;
const PORTMONE_PASSWORD = process.env.PORTMONE_PASSWORD;
const PORTMONE_CARD = process.env.PORTMONE_CARD;

class UserController {
  async me(req, res) {
    try {
      const student = await StudentModel.findOne({ _id: req.user });

      const lessons = await LessonModel.find({ student: student._id });

      const lessonsFiltered = lessons.filter(async (item) => {
        const schedule = await ScheduleModel.findOne({
          _id: item.schedule.toString(),
        });

        return schedule.datetime > Date.now();
      });

      const lessonsFormatted = await Promise.all(
        lessonsFiltered.map(async (item) => {
          const course = await CourseModel.findOne({
            _id: item.course.toString(),
          });

          const schedule = await ScheduleModel.findOne({
            _id: item.schedule.toString(),
          });

          return {
            id: item.id,
            course: {
              id: course._id,
              title: course.title,
            },
            schedule: {
              id: schedule._id,
              datetime: schedule.datetime,
            },
            purchased: item.purchased,
          };
        })
      );

      const coursesActivated = await LessonModel.find({
        student: student._id,
      });

      const coursesActivatedFormatted = coursesActivated.map((item) => {
        return item.course;
      });

      const coursesActivatedFiltered = [...new Set(coursesActivatedFormatted)];

      const lessonsDone = await LessonModel.find({
        student: student._id,
        status: "finished",
      });

      return res.json({
        email: student.email,
        name: student.name,
        balance: student.balance,
        lessons: lessonsFormatted,
        statistics: {
          coursesActivated: coursesActivatedFiltered.length,
          lessonsDone: lessonsDone.length,
          homeworksDone: 0,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Помилка під час отримання даних користувача",
      });
    }
  }

  async changeName(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array(),
        });
      }

      const student = await StudentModel.findOne({ _id: req.user });
      student.name = req.body.name;
      await student.save();

      return res.json({
        message: "Ім'я успішно змінено",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Помилка під час зміни імені",
      });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array(),
        });
      }

      const student = await StudentModel.findOne({ _id: req.user });

      const oldPassword = await bcrypt.compare(
        req.body.oldPassword,
        student.password
      );

      if (!oldPassword) {
        return res.status(401).json({
          message: "Невірні авторизаційні дані",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(req.body.newPassword, salt);

      student.password = newPassword;
      await student.save();

      return res.json({
        message: "Пароль успішно змінено",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Помилка під час зміни пароля",
      });
    }
  }

  async addBalance(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array(),
        });
      }

      const amount = +req.body.amount;
      const token = crypto.randomBytes(16).toString("hex");
      const student = await StudentModel.findOne({ _id: req.user });

      await student.balanceHistory.push({
        datetime: Date.now(),
        amount: amount,
        confirm: {
          status: false,
          token: token,
        },
      });

      await student.save();

      const promise = await fetch(
        "https://www.portmone.com.ua/r3/api/gateway/",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            method: "getLinkMoneyTransfer",
            params: {
              data: {
                login: PORTMONE_USER,
                password: PORTMONE_PASSWORD,
                shopBillId: PORTMONE_CARD,
                billAmount: amount,
                shopOrderNumber: token,
                purpose: "Поповнення балансу | ItPoint",
                successUrl: `https://m03hqkmn-4000.euw.devtunnels.ms/api/v1/student/balance/confirm`,
              },
            },
            id: "1",
          }),
        }
      );

      const payLink = await promise.json();

      return res.json({
        message: payLink.result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Помилка під час поповнення балансу",
      });
    }
  }

  async confirmBalance(req, res) {
    try {
      const student = await StudentModel.findOneAndUpdate(
        {
          "balanceHistory.confirm.token": req.body.SHOPORDERNUMBER,
        },
        {
          $set: {
            "balanceHistory.$[element].confirm.status": true,
            "balanceHistory.$[element].confirm.token": null,
          },
        },
        {
          arrayFilters: [{ "element.confirm.token": req.body.SHOPORDERNUMBER }],
        }
      );

      if (student) {
        student.balance += +req.body.BILL_AMOUNT;
        await student.save();

        return res.json({
          message: "Баланс успішно поповнено",
        });
      } else {
        return res.status(404).json({
          error: "Некоректний токен",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Помилка під час поповнення балансу",
      });
    }
  }
}

export default new UserController();
