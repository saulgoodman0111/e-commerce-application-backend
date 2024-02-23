import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// USER AUTH //
export const isAuth = async (req, res, next) => {
  const { token } = req.cookies; // getting the token from the cookie. cookies will be there in the req. //
  // using this token we can get the current user // 

  // validation //
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "unauthorized user!",
    });
  }
  
  // value of token is encoded so we have to decode it //
  // verify function decodes the token // 
  // .verify(token, JWT secret key) // 
  // after verify we directly get the user in req object //
  
  const decodedData = JWT.verify(token, process.env.JWT_SECRET);
  req.user = await userModel.findById(decodedData._id); // here we are searching the user //
  // decoded data will have a field _id //
  next();
};

// ADMIN AUTH //
export const isAdmin = async (req, res, next) => {
  if (req.user.role != "admin") {
    return res.status(401).send({
      success: false,
      message: "ONLY ADMIN CAN DO SO!!",
    });
  }
  next();
};
