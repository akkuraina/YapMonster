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
      .populate("chat");
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
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Content and chatId are required" });
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
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await message.populate({
      path: "chat.users",
      select: "name pic email",
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

module.exports = { allMessages, sendMessage, deleteMessageForEveryone, deleteMessageForMe };