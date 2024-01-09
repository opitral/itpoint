import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    status: {
      type: String,
      default: "wait",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lesson", LessonSchema);
