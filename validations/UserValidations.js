import { body } from "express-validator";

export const ChangeNameValidation = [
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

export const ChangePasswordValidation = [
  body("oldPassword"),

  body(
    "newPassword",
    "Пароль повинен містити від 8 до 16 символів і складатись тільки з латинських букв, цифер і спеціальних символів"
  )
    .isLength({
      min: 8,
      max: 16,
    })
    .matches(/^[\w!@#$%^&*]+$/),
];

export const AddBalanceValidation = [
  body(
    "amount",
    "Некоректна сума для поповнення. Мінімальна сума для поповнення має становити 50 гривень, максимальна - 5000 гривень"
  ).matches(/^([5-9]\d{1,3}|[1-4]\d{3}|5000)$/), // ^([1-9]\d{0,3}|[1-4]\d{3}|5000)$
];

export const AddScheduleValidation = [
  body("datetime", "Некоректна дата").matches(/^\d{13}$/),
];

export const DeleteScheduleValidation = [
  body("id", "Некоректний індентифікатор дати").matches(/^[0-9a-fA-F]{24}$/),
];
