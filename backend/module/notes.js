import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({

  title: {
    type: String,
    
  },

  content: {
    type: String,
    default: ""
  },

  tags: [{
    type: String
  }],

  pinned: {
    type: Boolean,
    default: false
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

export const Note = mongoose.model("Note", noteSchema);