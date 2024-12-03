import { body, check, param, query, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";
import { getChatDetails } from "../controllers/chat.js";

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);

  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(", ");

  if (errors.isEmpty()) return next();
  return next(new ErrorHandler(errorMessages, 400));
};

const registerValidator = () => [
  body("name", "Name is required").notEmpty(),
  body("username", "Username is required").notEmpty(),
  body("bio", "Bio is required").notEmpty(),
  body("password", "Password is required").notEmpty(),
];

const loginValidator = () => [
  body("username", "Username is required").notEmpty(),
  body("password", "Password is required").notEmpty(),
];

const sendFriendReqValidator = () => [
  body("userId", "UserId is required").notEmpty(),
];

const acceptFriendReqValidator = () => [
  body("requestId", "RequestId is required").notEmpty(),
  body("accept")
    .notEmpty()
    .withMessage("Accept is required")
    .isBoolean()
    .withMessage("Accept should be boolean"),
];

const newGroupValidator = () => [
  body("name", "Name is required").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Members is required")
    .isArray({
      min: 2,
      max: 100,
    })
    .withMessage("Members must be between 2 and 100"),
];

const addMemberValidator = () => [
  body("chatId", "ChatId is required").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Members is required")
    .isArray({
      min: 1,
      max: 97,
    })
    .withMessage("Members must be between 1 and 97"),
];

const removeMemberValidator = () => [
  body("chatId", "ChatId is required").notEmpty(),
  body("userId", "UserId is required").notEmpty(),
];

const leaveGroupValidator = () => [
  param("id", "ChatId is required").notEmpty(),
];

const sendAttachmentsValidator = () => [
  body("chatId", "ChatId is required").notEmpty(),
];

const getMessagesValidator = () => [
  param("id", "ChatId is required").notEmpty(),
];

const getChatDetailsValidator = () => [
  param("id", "ChatId is required").notEmpty(),
];

const renameChatValidator = () => [
  param("id", "ChatId is required").notEmpty(),
  body("name", "Name is required").notEmpty(),
];

const adminLoginValidator = () => [
  body("secretKey", "Secret Key is required").notEmpty(),
];

export {
  registerValidator,
  validateHandler,
  loginValidator,
  newGroupValidator,
  addMemberValidator,
  removeMemberValidator,
  leaveGroupValidator,
  sendAttachmentsValidator,
  getMessagesValidator,
  getChatDetailsValidator,
  renameChatValidator,
  sendFriendReqValidator,
  acceptFriendReqValidator,
  adminLoginValidator,
};
