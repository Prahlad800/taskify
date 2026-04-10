import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  task: [{
    text: {
      type: String,
      default: ""
    },
    impotent:{
      type: Boolean,
      default: false
    },

    completed_todo: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date,
      default: null
    }
  }],

  completed_task: {
    type: Boolean,
    default: false
  },

  completedAt: {
    type: Date,
    default: null
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
    ref: "User",
    required: true
  }

}, { timestamps: true });
 export const Todo = mongoose.model("Todo", todoSchema);