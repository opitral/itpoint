import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster.mxmhkdu.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`)

const db = mongoose.connection

db.on("connected", () => {
  console.log("База даних підключена")
})

db.on("error", (error) => {
  console.error(`Помилка під час підключення до бази даних: ${error}`)
})

export default db