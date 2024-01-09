import Router from "express";
import AuthStudentMiddleware from "../../middlewares/AuthStudentMiddleware.js";
import {
  ChangeNameValidation,
  ChangePasswordValidation,
  AddBalanceValidation,
} from "../../validations/UserValidations.js";
import UserController from "../../controllers/student/UserController.js";

const router = new Router();

router.get("/", AuthStudentMiddleware, UserController.me); // отримання особистої інформації
router.post(
  "/name",
  AuthStudentMiddleware,
  ChangeNameValidation,
  UserController.changeName
); // зміна імені
router.post(
  "/password",
  AuthStudentMiddleware,
  ChangePasswordValidation,
  UserController.changePassword
); // зміна пароля
router.post(
  "/balance",
  AuthStudentMiddleware,
  AddBalanceValidation,
  UserController.addBalance
); // поповнення балансу
router.post("/balance/confirm", UserController.confirmBalance); // підтвердження поповнення балансу

export default router;
