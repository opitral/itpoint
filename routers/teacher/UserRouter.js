import Router from "express";
import AuthTeacherMiddleware from "../../middlewares/AuthTeacherMiddleware.js";
import {
  ChangeNameValidation,
  ChangePasswordValidation,
  AddScheduleValidation,
  DeleteScheduleValidation,
} from "../../validations/UserValidations.js";
import UserController from "../../controllers/teacher/UserController.js";

const router = new Router();

router.get("/", AuthTeacherMiddleware, UserController.me); // отримання особистої інформації
router.post(
  "/name",
  AuthTeacherMiddleware,
  ChangeNameValidation,
  UserController.changeName
); // зміна імені
router.post(
  "/password",
  AuthTeacherMiddleware,
  ChangePasswordValidation,
  UserController.changePassword
); // зміна пароля
router.post(
  "/schedule",
  AuthTeacherMiddleware,
  AddScheduleValidation,
  UserController.addSchedule
); // дадати час
router.delete(
  "/schedule",
  AuthTeacherMiddleware,
  DeleteScheduleValidation,
  UserController.deleteSchedule
); // видалити час

export default router;
