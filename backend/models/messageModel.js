const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedForEveryone: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    messageType: {
      type: String,
      enum: ["text", "call"],
      default: "text",
    },
    callInfo: {
      callType: { type: String, enum: ["video", "audio"], default: "video" },
      status: {
        type: String,
        enum: ["completed", "missed", "declined"],
        default: "completed",
      },
      duration: { type: Number, default: 0 }, // duration in seconds
      startedAt: { type: Date },
      endedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;