import { body } from "express-validator";

export const ScheduleIdValidation = [
  body("id", "Некоректний ідентифікатор дати"),
];
