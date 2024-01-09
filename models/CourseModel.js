import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", CourseSchema);
