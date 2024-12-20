import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../utils/features.js";
import { adminSecretKey } from "../app.js";

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatched = secretKey === adminSecretKey;
  if (!isMatched) return next(new ErrorHandler("Invalid Secret Key", 401));

  const token = jwt.sign(secretKey, process.env.JWT_SECRET);

  res
    .status(200)
    .cookie("chattu-admin-token", token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    })
    .json({
      success: true,
      message: "Admin Login Successful",
    });
});

const adminLogout = TryCatch(async (req, res, next) => {
  res
    .status(200)
    .cookie("chattu-admin-token", "", {
      ...cookieOptions,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "Admin Logout Successful",
    });
});

const getAdminData = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    admin: true,
  });
});

const getAllUsers = TryCatch(async function (req, res, next) {
  const allUsers = await User.find();

  const transformedUsers = await Promise.all(
    allUsers.map(async ({ name, username, avatar, _id }) => {
      console.log(_id);
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({
          groupChat: false,
          members: _id,
        }),
      ]);
      return { name, username, avatar: avatar.url, _id, groups, friends };
    }),
  );
  res.status(200).json({
    success: true,
    users: transformedUsers,
  });
});

const getAllChats = TryCatch(async function (req, res, next) {
  const allChats = await Chat.find()
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = await Promise.all(
    allChats.map(async ({ members, name, groupChat, creator, _id }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });
      return {
        _id,
        name,
        groupChat,
        creator: {
          name: creator?.name ? creator?.name : "None",
          avatar: creator?.avatar.url || "",
        },
        avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        totalMembers: members.length,
        totalMessages,
      };
    }),
  );
  res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

const getAllMessages = TryCatch(async function (req, res, next) {
  const messages = await Message.find()
    .populate("sender", "name avatar")
    .populate("chat", "groupChat");

  const transformedMessages = messages.map(
    ({ _id, content, attachments, sender, createdAt, chat }) => ({
      _id,
      attachments,
      content,
      createdAt,
      chat: chat._id,
      groupChat: chat.groupChat,
      sender: {
        _id: sender.id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    }),
  );
  return res.status(200).json({
    success: true,
    message: transformedMessages,
  });
});

const getDashboardStats = TryCatch(async function (req, res, next) {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

  const today = new Date();
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await Message.find(
    {
      createdAt: {
        $gte: last7Days,
        $lte: today,
      },
    },
    "createdAt",
  );

  const messages = new Array(7).fill(0);
  const dayInMilliseconds = 1000 * 60 * 60 * 24;
  last7DaysMessages.forEach((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMilliseconds;
    const index = Math.floor(indexApprox);
    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messages,
    // last7DaysMessages,
  };

  return res.status(200).json({
    success: true,
    stats,
  });
});

export {
  getAllUsers,
  getAllChats,
  getAllMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};
