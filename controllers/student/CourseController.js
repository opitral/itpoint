import { validationResult } from "express-validator";
import StudentModel from "../../models/StudentModel.js";
import TeacherModel from "../../models/TeacherModel.js";
import CourseModel from "../../models/CourseModel.js";
import LessonModel from "../../models/LessonModel.js";
import ScheduleModel from "../../models/ScheduleModel.js";

class CourseController {
  async courses(req, res) {
    try {
      // await CourseModel.create({
      //     icon: "express",
      //     color: "#A369FF",
      //     title: "Курс по Express.js",
      //     description: "description",
      //     about: "about",
      //     price: 300,
      //     teacher: "653c09f073ce8562f4266ac5"
      // })

      // return res.json({
      //     message: "ok"
      // })
      const courses = await CourseModel.find();

      const studentCourses = await LessonModel.find({
        student: req.user,
      });

      const studentCoursesFormatted = studentCourses.map((item) => {
        return item.course.toString();
      });

      const coursesFormatted = courses.map((course) => {
        return {
          _id: course._id,
          title: course.title,
          icon: course.icon,
          color: course.color,
          description: course.description,
          about: course.about,
          price: course.price,
          activated: studentCoursesFormatted.includes(course._id.toString()),
        };
      });

      return res.json(coursesFormatted);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Помилка під час отримання курсів",
      });
    }
  }

  async course(req, res) {
    try {
      const course = await CourseModel.findOne({ _id: req.params.id });

      if (!course) {
        return res.status(404).json({
          error: "Курс не знайдено",
        });
      }

      const teacher = await TeacherModel.findOne({
        _id: course.teacher.toString(),
      });

      if (!teacher) {
        return res.status(500).json({
          error: "Помилка під час отримання курсу",
        });
      }

      const schedule = await ScheduleModel.find({
        teacher: teacher._id,
      });

      const scheduleFiltered = schedule.filter((item) => {
        return item.datetime > Date.now() + 1000 * 60 * 60 * 2;
      });

      const scheduleFormatted = await Promise.all(
        scheduleFiltered.map(async (item) => ({
          id: item._id,
          datetime: item.datetime,
          lesson: !!(await LessonModel.findOne({ schedule: item._id })),
        }))
      );

      return res.json(scheduleFormatted);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час отримання курсу",
      });
    }
  }

  async buyCourse(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array(),
        });
      }

      const course = await CourseModel.findOne({ _id: req.params.id });

      if (!course) {
        return res.status(404).json({
          error: "Курс не знайдено",
        });
      }

      const teacher = await TeacherModel.findOne({
        _id: course.teacher.toString(),
      });

      if (!teacher) {
        return res.status(500).json({
          error: "Помилка під час придбання уроку",
        });
      }

      const schedule = await ScheduleModel.findOne({
        _id: req.body.id,
        teacher: teacher._id,
      });

      if (!schedule) {
        return res.status(404).json({
          error: "Некоректний індентифікатор дати",
        });
      }

      const lesson = await LessonModel.findOne({ schedule: schedule._id });

      if (lesson) {
        return res.status(403).json({
          error: "Дата вже зайнята",
        });
      }

      if (Date.now() > schedule.datetime - 1000 * 60 * 60 * 2) {
        return res.status(400).json({
          error: "Бронювання на цю дату припинено",
        });
      }

      const student = await StudentModel.findOne({ _id: req.user });

      if (course.price > student.balance) {
        return res.status(402).json({
          error: "На балансі недостатньо коштів",
        });
      }

      student.balance -= course.price;
      await student.save();

      const newLesson = await LessonModel.create({
        course: course._id,
        student: student._id,
        schedule: schedule._id,
      });

      schedule.lesson = newLesson._id;
      await schedule.save();

      return res.json({
        message: "Урок успішно придбано",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час придбання уроку",
      });
    }
  }

  async changeSchedule(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array(),
        });
      }

      const studentLesson = await LessonModel.findOne({ _id: req.params.id });

      if (!studentLesson) {
        return res.status(404).json({
          error: "Урок не знайдено",
        });
      }

      const studentSchedule = await ScheduleModel.findOne({
        _id: studentLesson.schedule.toString(),
      });

      if (Date.now() > studentSchedule.datetime - 3 * 60 * 60 * 1000) {
        return res.status(400).json({
          error: "Змінити дату можна за три години до початку уроку",
        });
      }

      const schedule = await ScheduleModel.findOne({ _id: req.body.id });

      if (!schedule) {
        return res.status(404).json({
          error: "Дату не знайдено",
        });
      }

      if (Date.now() > schedule.datetime - 1000 * 60 * 60 * 2) {
        return res.status(400).json({
          error: "Бронювання на цю дату припинено",
        });
      }

      const lesson = await LessonModel.findOne({ schedule: schedule._id });

      if (lesson) {
        return res.status(403).json({
          error: "Дата вже зайнята",
        });
      }

      studentLesson.schedule = schedule._id;
      await studentLesson.save();

      return res.json({
        message: "Дату успішно змінено",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Помилка під час зміни дати",
      });
    }
  }
}

export default new CourseController();
