import Router from "express";
import {
  SigninValidation,
  RequestRecoveryValidation,
  ConfirmRecoveryValidation,
} from "../../validations/AuthValidations.js";
import AuthController from "../../controllers/teacher/AuthController.js";

const router = new Router();

router.post("/signin", SigninValidation, AuthController.signin); // вхід
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
