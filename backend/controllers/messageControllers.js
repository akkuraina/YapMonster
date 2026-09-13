const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      users: req.user._id,
    });

    if (!chat) {
      res.status(403);
      throw new Error("You are not authorized to view messages in this chat");
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name pic email" },
      })
      .populate({
        path: "chat",
        populate: { path: "users", select: "name pic email" },
      });
    res.json(messages);
  } catch (error) {
    if (res.statusCode !== 403) {
      res.status(400);
    }
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, replyTo, messageType, audioUrl, audioDuration } = req.body;

  if ((!content || !content.trim()) && !audioUrl) {
    return res.status(400).json({ message: "Content or audioUrl is required" });
  }

  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  const chat = await Chat.findOne({
    _id: chatId,
    users: req.user._id,
  });

  if (!chat) {
    res.status(403);
    throw new Error("You are not authorized to send messages in this chat");
  }

  var newMessage = {
    sender: req.user._id,
    content: content || "🎤 Voice message",
    chat: chatId,
    messageType: messageType || (audioUrl ? "audio" : "text"),
    audioUrl: audioUrl || null,
    audioDuration: audioDuration || 0,
  };

  if (replyTo) {
    newMessage.replyTo = replyTo;
  }

  try {
    const createdMessage = await Message.create(newMessage);

    const message = await Message.findById(createdMessage._id)
      .populate("sender", "name pic")
      .populate({
        path: "chat",
        populate: { path: "users", select: "name pic email" },
      })
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name pic email" },
      });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    if (res.statusCode !== 403) {
      res.status(400);
    }
    throw new Error(error.message);
  }
});

//@description     Delete Message for Everyone
//@route           DELETE /api/message/:messageId
//@access          Protected (sender or admin)
const deleteMessageForEveryone = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId).populate("sender");
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  // Only sender or admin can delete for everyone
  if (message.sender._id.toString() !== userId.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized to delete this message for everyone" });
  }

  message.deletedForEveryone = true;
  await message.save();
  res.json({ message: "Message deleted for everyone" });
});

//@description     Delete Message for Me
//@route           PUT /api/message/delete-for-me
//@access          Protected
const deleteMessageForMe = asyncHandler(async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  if (!message.deletedFor.includes(userId)) {
    message.deletedFor.push(userId);
    await message.save();
  }
  res.json({ message: "Message deleted for you" });
});

//@description     Record a Call Log in Chat
//@route           POST /api/message/call
//@access          Protected
const recordCallMessage = asyncHandler(async (req, res) => {
  const {
    chatId,
    callType = "video",
    status = "completed",
    duration = 0,
    startedAt,
    endedAt,
  } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  const chat = await Chat.findOne({
    _id: chatId,
    users: req.user._id,
  });

  if (!chat) {
    res.status(403);
    throw new Error("You are not authorized to log calls in this chat");
  }

  let contentText = "Video Call";
  if (status === "missed") {
    contentText = "Missed Video Call";
  } else if (status === "declined") {
    contentText = "Declined Video Call";
  } else if (duration > 0) {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const durStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    contentText = `Video Call (${durStr})`;
  }

  const newCallMessage = {
    sender: req.user._id,
    content: contentText,
    chat: chatId,
    messageType: "call",
    callInfo: {
      callType: callType || "video",
      status: status || "completed",
      duration: duration || 0,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : new Date(),
    },
  };

  try {
    const createdMessage = await Message.create(newCallMessage);

    const message = await Message.findById(createdMessage._id)
      .populate("sender", "name pic email")
      .populate({
        path: "chat",
        populate: { path: "users", select: "name pic email" },
      });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    if (res.statusCode !== 403) {
      res.status(400);
    }
    throw new Error(error.message);
  }
});

module.exports = {
  allMessages,
  sendMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  recordCallMessage,
};