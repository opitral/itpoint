import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

import TeacherModel from "../../models/TeacherModel.js";
import StudentModel from "../../models/StudentModel.js";
import ScheduleModel from "../../models/ScheduleModel.js";
import LessonModel from "../../models/LessonModel.js";
import CourseModel from "../../models/CourseModel.js";

class UserController {
  async me(req, res) {
    try {
      const teacher = await TeacherModel.findOne({ _id: req.user });

      const schedule = await ScheduleModel.find({ teacher: req.user });
      const scheduleFiltered = await Promise.all(
        schedule.map(async (item) => {
          let lessonFormatted = null;

          if (item.lesson) {
            const lesson = await LessonModel.findOne({ schedule: item._id });
            const course = await CourseModel.findOne({
              _id: lesson.course.toString(),
            });
            const student = await StudentModel.findOne({
              _id: lesson.student.toString(),
            });

            lessonFormatted = {
              id: item._id,
              datetime: item.datetime,
              lesson: {
                course: {
                  id: course._id,
                  title: course.title,
                  price: course.price,
                },
                student: {
                  id: student._id,
                  name: student.name,
                },
                status: lesson.status,
              },
            };
          } else {
            lessonFormatted = {
              id: item._id,
              datetime: item.datetime,
            };
          }

          return lessonFormatted;
        })
      );

      return res.json({
        email: teacher.email,
        name: teacher.name,
        balance: teacher.balance,
        schedule: scheduleFiltered,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час отримання даних користувача",
      });
    }
  }

  async changeName(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }

      const teacher = await TeacherModel.findOne({ _id: req.user });
      teacher.name = req.body.name;
      await teacher.save();

      return res.json({
        message: "Ім'я успішно змінено",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час зміни імені",
      });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }

      const teacher = await TeacherModel.findOne({ _id: req.user });

      const oldPassword = await bcrypt.compare(
        req.body.oldPassword,
        teacher.password
      );

      if (!oldPassword) {
        return res.status(401).json({
          error: "Невірні авторизаційні дані",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(req.body.newPassword, salt);

      teacher.password = newPassword;
      await teacher.save();

      return res.json({
        message: "Пароль успішно змінено",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час зміни пароля",
      });
    }
  }

  async addSchedule(req, res) {
    try {
      // const salt = await bcrypt.genSalt(10);
      // const password = await bcrypt.hash("Microlife_2006", salt);

      // await TeacherModel.create({
      //   email: "opitral@proton.me",
      //   password: password,
      //   name: "Вова",
      // });

      // return res.json({
      //   message: "ok",
      // });

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }

      const schedule = await ScheduleModel.findOne({
        teacher: req.user,
        datetime: req.body.datetime,
      });

      if (schedule) {
        return res.status(409).json({
          error: "Цей час уже був доданий раніше",
        });
      }

      if (req.body.datetime < Date.now() + 2 * 60 * 60 * 1000) {
        return res.status(400).json({
          error:
            "Дата повинна бути встановлена не пізніше, ніж за дві години до початку заняття",
        });
      }

      await ScheduleModel.create({
        teacher: req.user,
        datetime: req.body.datetime,
      });

      return res.json({
        message: "Новий час успішно доданий",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час додавання часу",
      });
    }
  }

  async deleteSchedule(req, res) {
    try {
      const schedule = await ScheduleModel.findOne({
        _id: req.body.id,
        teacher: req.user,
      });

      if (!schedule) {
        return res.status(404).json({
          error: "Некоректний індентифікатор дати",
        });
      }

      const lesson = await LessonModel.findOne({
        schedule: schedule._id.toString(),
      });

      if (lesson) {
        const student = await StudentModel.findOne({
          _id: lesson.student.toString(),
        });

        const course = await CourseModel.findOne({
          _id: lesson.course.toString(),
        });

        student.balance += course.price * 1.25;
        await student.save();

        const teacher = await TeacherModel.findOne({ _id: req.user });
        teacher.balance -= course.price * 0.25;
        await teacher.save();

        await LessonModel.findOneAndDelete({
          _id: lesson._id,
        });
      }

      await ScheduleModel.findOneAndDelete({
        _id: req.body.id,
        teacher: req.user,
      });

      return res.json({
        message: "Дату успішно видалено",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час видалення часу",
      });
    }
  }
}

export default new UserController();
