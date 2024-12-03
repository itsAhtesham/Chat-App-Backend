import { Router } from "express";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
} from "../controllers/user.js";
import { singleUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  loginValidator,
  registerValidator,
  validateHandler,
  sendFriendReqValidator,
  acceptFriendReqValidator,
} from "../lib/validator.js";

const UserRouter = Router();

UserRouter.post(
  "/new",
  singleUpload,
  registerValidator(),
  validateHandler,
  newUser,
);
UserRouter.post("/login", loginValidator(), validateHandler, login);

UserRouter.use(isAuthenticated);

UserRouter.get("/me", getMyProfile);
UserRouter.get("/logout", logout);
UserRouter.get("/search", searchUser);
UserRouter.put(
  "/send-request",
  sendFriendReqValidator(),
  validateHandler,
  sendFriendRequest,
);

UserRouter.put(
  "/accept-request",
  acceptFriendReqValidator(),
  validateHandler,
  acceptFriendRequest,
);

UserRouter.get("/notifications", getMyNotifications);
UserRouter.get("/friends", getMyFriends);

export default UserRouter;
