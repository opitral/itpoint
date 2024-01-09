import Router from "express";
import AuthStudentMiddleware from "../../middlewares/AuthStudentMiddleware.js";
import { ScheduleIdValidation } from "../../validations/CourseValidations.js";
import CourseController from "../../controllers/student/CourseController.js";

const router = new Router();

router.get("/", AuthStudentMiddleware, CourseController.courses); // отримання всіх курсів
router.get("/:id", AuthStudentMiddleware, CourseController.course); // отримання одного курсу
router.post(
  "/:id",
  AuthStudentMiddleware,
  ScheduleIdValidation,
  CourseController.buyCourse
); // придбання уроку
router.patch(
  "/:id",
  AuthStudentMiddleware,
  ScheduleIdValidation,
  CourseController.changeSchedule
); // зміна дати

export default router;
