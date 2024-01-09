import { body } from "express-validator";

export const SignupValidation = [
  body("email", "Некоректна адреса електронної пошти").isEmail(),

  body(
    "password",
    "Пароль повинен містити від 8 до 16 символів і складатись тільки з латинських букв, цифер і спеціальних символів"
  )
    .isLength({
      min: 8,
      max: 16,
    })
    .matches(/^[\w!@#$%^&*]+$/),

  body(
    "name",
    "Ім'я повинне містити від 2 до 16 символів і складатись тільки з букв"
  )
    .isLength({
      min: 2,
      max: 16,
    })
    .matches(/^[a-zA-Zа-яА-ЯґҐєЄіІїЇёЁ'-]+$/),
];

export const SigninValidation = [
  body("email", "Некоректна адреса електронної пошти").isEmail(),

  body("password"),
];

export const RequestRecoveryValidation = [
  body("email", "Некоректна адреса електронної пошти").isEmail(),
];

export const ConfirmRecoveryValidation = [
  body(
    "password",
    "Пароль повинен містити від 8 до 16 символів і складатись тільки з латинських букв, цифер і спеціальних символів"
  )
    .isLength({
      min: 8,
      max: 16,
    })
    .matches(/^[\w!@#$%^&*]+$/),
];
