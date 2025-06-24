const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// @description     Create or fetch One to One Chat
// @route           POST /api/chat/
// @access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400); // Return after sending response
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]); // Return after sending response
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res.status(200).json(FullChat); // Return after sending response
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// @description     Fetch all chats for a user
// @route           GET /api/chat/
// @access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    return res.status(200).send(populatedResults); // Return after sending response
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @description     Create New Group Chat
// @route           POST /api/chat/group
// @access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
      groupPic: req.body.groupPic || "",
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat); // Return after sending response
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    return res.json(updatedChat); // Return after sending response
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    return res.json(removed); // Return after sending response
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    return res.json(added); // Return after sending response
  }
});

// @desc    Update Group Profile Picture
// @route   PUT /api/chat/groupPic
// @access  Protected
const updateGroupPic = asyncHandler(async (req, res) => {
  console.log("updateGroupPic called with body:", req.body);
  const { chatId, groupPic } = req.body;

  if (!chatId) {
    console.log("Error: chatId is missing");
    res.status(400);
    throw new Error("Chat ID is required");
  }

  if (!groupPic) {
    console.log("Error: groupPic is missing");
    res.status(400);
    throw new Error("Group picture is required");
  }

  console.log("Updating chat:", chatId, "with groupPic length:", groupPic.length);

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupPic: groupPic },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      console.log("Error: Chat not found with ID:", chatId);
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      console.log("Successfully updated group picture for chat:", chatId);
      return res.json(updatedChat); // Return after sending response
    }
  } catch (error) {
    console.log("Database error:", error.message);
    res.status(500);
    throw new Error("Failed to update group picture: " + error.message);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  updateGroupPic,
};
