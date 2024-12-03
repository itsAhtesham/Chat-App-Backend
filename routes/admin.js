import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  getAdminData,
  getAllChats,
  getAllMessages,
  getAllUsers,
  getDashboardStats,
} from "../controllers/admin.js";
import { adminLoginValidator, validateHandler } from "../lib/validator.js";
import { adminOnly } from "../middlewares/auth.js";

const AdminRouter = Router();

AdminRouter.post("/verify", adminLoginValidator(), validateHandler, adminLogin);
AdminRouter.get("/logout", adminLogout);

AdminRouter.use(adminOnly);

AdminRouter.get("/", getAdminData);
AdminRouter.get("/users", getAllUsers);
AdminRouter.get("/chats", getAllChats);
AdminRouter.get("/messages", getAllMessages);
AdminRouter.get("/dashboard/stats", getDashboardStats);

export default AdminRouter;
