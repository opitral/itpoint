import Router from "express";
import {
  SigninValidation,
  SignupValidation,
  RequestRecoveryValidation,
  ConfirmRecoveryValidation,
} from "../../validations/AuthValidations.js";
import AuthController from "../../controllers/student/AuthController.js";

const router = new Router();

router.post("/signin", SigninValidation, AuthController.signin); // вхід
router.post("/signup", SignupValidation, AuthController.signup); // реєстрація
router.get("/confirm/:token", AuthController.confirmAccount); // підтвердження акаунта
router.post(
  "/recovery",
  RequestRecoveryValidation,
  AuthController.requestRecovery
); // запит на відновлення
router.post(
  "/recovery/:token",
  ConfirmRecoveryValidation,
  AuthController.confirmRecovery
); // підтвердження відновлення

export default router;
