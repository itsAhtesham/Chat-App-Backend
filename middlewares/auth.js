import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";
import { adminSecretKey } from "../app.js";
import { CHATTU_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";

const isAuthenticated = (req, res, next) => {
  const token = req.cookies[CHATTU_TOKEN];
  if (!token)
    return next(new ErrorHandler("Please login to access this route", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decodedData.userId;
  next();
};

const adminOnly = (req, res, next) => {
  const token = req.cookies["chattu-admin-token"];
  if (!token) return next(new ErrorHandler("No admin token provided", 401));

  const adminID = jwt.verify(token, process.env.JWT_SECRET);

  const isMatched = adminID === adminSecretKey;
  if (!isMatched) return next(new ErrorHandler("Invalid Admin Key", 401));
  next();
};

const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[CHATTU_TOKEN];
    if (!authToken) return next(new ErrorHandler("Invalid Auth Token", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData.userId);
    if (!user) return next(new ErrorHandler("Login to access this route", 401));

    socket.user = user;
    return next();
  } catch (e) {
    console.log("Socket Auth error", e);
    return next(new ErrorHandler("Login to access this route", 401));
  }
};

export { isAuthenticated, adminOnly, socketAuthenticator };
