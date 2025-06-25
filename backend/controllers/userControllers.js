const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/user/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//@description     Update user profile
//@route           PUT /api/user/profile
//@access          Protected
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, pic } = req.body;

  if (!name && !pic) {
    res.status(400);
    throw new Error("Please provide at least one field to update");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    if (name) user.name = name;
    if (pic) user.pic = pic;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      pic: updatedUser.pic,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@description     Get chat background for a chat
//@route           GET /api/user/chat-background/:chatId
//@access          Protected
const getChatBackground = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const chatId = req.params.chatId;
  const bg = user.chatBackgrounds.find(bg => bg.chat.toString() === chatId);
  res.json(bg || null);
});

//@description     Set chat background for a chat
//@route           PUT /api/user/chat-background/:chatId
//@access          Protected
const setChatBackground = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const chatId = req.params.chatId;
    const { type, value } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ message: "Type and value are required" });
    }
    
    if (!['color', 'image'].includes(type)) {
      return res.status(400).json({ message: "Type must be either 'color' or 'image'" });
    }
    
    // Validate image data size if it's an image
    if (type === 'image') {
      // Check if it's a base64 data URL
      if (value.startsWith('data:image/')) {
        // Remove the data URL prefix to get just the base64 data
        const base64Data = value.split(',')[1];
        if (!base64Data) {
          return res.status(400).json({ message: "Invalid image data format" });
        }
        
        // Check size (base64 is about 33% larger than binary)
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const maxSizeInMB = 10; // 10MB limit
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        
        if (sizeInBytes > maxSizeInBytes) {
          return res.status(400).json({ 
            message: `Image too large. Maximum size is ${maxSizeInMB}MB. Current size is ${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB` 
          });
        }
      } else if (!value.startsWith('http')) {
        return res.status(400).json({ message: "Invalid image URL or data format" });
      }
    }
    
    // Validate color format if it's a color
    if (type === 'color') {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(value)) {
        return res.status(400).json({ message: "Invalid color format. Use hex format (e.g., #FF0000)" });
      }
    }
    
    let bg = user.chatBackgrounds.find(bg => bg.chat.toString() === chatId);
    if (bg) {
      bg.type = type;
      bg.value = value;
    } else {
      user.chatBackgrounds.push({ chat: chatId, type, value });
    }
    
    await user.save();
    res.json({ message: "Background updated successfully" });
  } catch (error) {
    console.error("Error in setChatBackground:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = { allUsers, registerUser, authUser, updateUserProfile, getChatBackground, setChatBackground };