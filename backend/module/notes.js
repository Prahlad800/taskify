import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({

  title: {
    type: String,
    
  },

  content: {
    type: String,
    default: ""
  },

  archivedAt: {type:Date,default:null},
  trashedAt: {type:Date,default:null},
  reminderAt: {type:Date,default:null},
  tags: [{
    type: String
  }],

  pinned: {
    type: Boolean,
    default: false
  },

  reminderNotifiedAt: {type:Date,default:null},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

// MongoDB removes trashed notes after 30 days; restoring clears the TTL date.
noteSchema.index({trashedAt:1},{expireAfterSeconds:30*24*60*60,name:'trash_retention_30_days'});

export const Note = mongoose.model("Note", noteSchema);