import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
} from "../controllers/chat.js";
import { attachmentsMulter } from "../middlewares/multer.js";
import {
  addMemberValidator,
  getChatDetailsValidator,
  getMessagesValidator,
  leaveGroupValidator,
  newGroupValidator,
  removeMemberValidator,
  renameChatValidator,
  sendAttachmentsValidator,
  validateHandler,
} from "../lib/validator.js";

const ChatRouter = Router();

ChatRouter.use(isAuthenticated);
ChatRouter.post("/new", newGroupValidator(), validateHandler, newGroupChat);
ChatRouter.get("/my", getMyChats);
ChatRouter.get("/my/groups", getMyGroups);
ChatRouter.put(
  "/add-members",
  addMemberValidator(),
  validateHandler,
  addMembers,
);
ChatRouter.put(
  "/remove-member",
  removeMemberValidator(),
  validateHandler,
  removeMember,
);
ChatRouter.delete(
  "/leave/:id",
  leaveGroupValidator(),
  validateHandler,
  leaveGroup,
);
ChatRouter.post(
  "/message",
  attachmentsMulter,
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments,
);
ChatRouter.get(
  "/:id/messages",
  getMessagesValidator(),
  validateHandler,
  getMessages,
);

ChatRouter.route("/:id")
  .get(getChatDetailsValidator(), validateHandler, getChatDetails)
  .put(renameChatValidator(), validateHandler, renameGroup)
  .delete(getChatDetailsValidator(), validateHandler, deleteChat);

export default ChatRouter;
