import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    recovery: {
      token: {
        type: String,
      },
      expiration: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Teacher", TeacherSchema);
