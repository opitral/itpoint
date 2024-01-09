import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
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
      default: 100,
    },
    balanceHistory: [
      {
        datetime: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        confirm: {
          status: {
            type: Boolean,
            required: true,
            default: false,
          },
          token: {
            type: String,
          },
        },
      },
    ],
    verification: {
      status: {
        type: Boolean,
        required: true,
        default: false,
      },
      token: {
        type: String,
      },
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

export default mongoose.model("Student", StudentSchema);
