import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { getBase64, getSockets } from "../lib/helper.js";

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  secure: true,
  httpOnly: true,
  sameSite: "none",
};

const connectDB = (uri) => {
  console.log("DB Con");

  mongoose
    .connect(uri, {
      dbName: "Chattu",
    })
    .then((data) => {
      console.log(`Connected to DB: ${data.connection.host}`);
    })
    .catch((e) => {
      throw e;
    });
};

const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res
    .status(code)
    .cookie("chattu-token", token, { options: cookieOptions })
    .json({
      success: true,
      token,
      user,
      message,
    });
};

const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const members = getSockets(users);
  io.to(members).emit(event, data);
  console.log(`Emitted event: ${event}`);
};

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (e) {
    throw new Error("Error uploading files to cloudinary");
  }
};

const deleteFilesFromCloudinary = async (publicIds) => {
  // delete files
};

export {
  connectDB,
  sendToken,
  cookieOptions,
  emitEvent,
  deleteFilesFromCloudinary,
  uploadFilesToCloudinary,
};
