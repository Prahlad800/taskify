import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  task: [{
    type: String,
    default: ""
  }],

  completed: {
    type: Boolean,
    default: false
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  dueDate: {
    type: Date
  },

  user: {
   type: mongoose.Schema.Types.ObjectId,
   ref:"User",
    required: true
  }

}, { timestamps: true });

export const Todo = mongoose.model("Todo", todoSchema);