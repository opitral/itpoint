import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    datetime: {
      type: String,
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Schedule", ScheduleSchema);
