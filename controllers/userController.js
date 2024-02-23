import userModel from "../models/userModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone, answer } =
      req.body;

    // validation //
    if (
      !name ||
      !email ||
      !password ||
      !city ||
      !address ||
      !country ||
      !phone ||
      !answer
    ) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    // CHECK EXISTING USER WHOSE EMAIL IS REGISTERED//

    const existingUser = await userModel.findOne({ email });
    // EMAIL ALREADY REGISTERED SHOW ERROR MESSAGE //

    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "email already taken!!",
      });
    }

    const user = await userModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });
    res.status(201).send({
      success: true,
      message: "registration successfull, please login!!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in register API",
      success: false,
      error,
    });
  }
};

// LOGIN //
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation //
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "please add email or password",
      });
    }

    // check user //
    const user = await userModel.findOne({ email });

    // user validation //
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }

    // check password //
    const isMatch = await user.comparePassword(password);

    // validation of password //
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "invalid credentials!!",
      });
    }

    // TOKEN //
    const token = user.generateToken();

    // if everything okay user must be able to login //
    return res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        secure: process.env.MODE_ENV === "development" ? true : false,
        httpOnly: process.env.MODE_ENV === "development" ? true : false,
        sameSite: process.env.MODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "login success",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in login api",
      error,
    });
  }
};

// GET USER PROFILE //
export const getUserProfileController = async (req, res) => {
  try {

    // we are getting req.user from cookie and we are extracting id from it //
    // and then we are searching this user in user model //
    
    const user = await userModel.findById(req.user._id);
    user.password = undefined; // hides password while showing data in profile tab in postman //
    res.status(200).send({
      success: true,
      message: "user profile fetched successfully!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in profile api",
      error,
    });
  }
};

// LOGOUT FUNCTION //
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),

        secure: process.env.MODE_ENV === "development" ? true : false,
        httpOnly: process.env.MODE_ENV === "development" ? true : false,
        sameSite: process.env.MODE_ENV === "development" ? true : false,
      })
      .send({
        sucess: true,
        message: "logout success!",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in logout api",
      error,
    });
  }
};

// UPDATE USER PROFILE //
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email, address, city, country, phone, answer } = req.body;

    // validation & updation //
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (address) {
      user.address = address;
    }
    if (city) {
      user.city = city;
    }
    if (country) {
      user.country = country;
    }
    if (phone) {
      user.phone = phone;
    }
    if (answer) {
      user.answer = answer;
    }
    // save user after updation //
    await user.save();
    res.status(200).send({
      success: true,
      message: "user profile updated successfully!!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in update profile api!",
      error,
    });
  }
};

// UPDATE USER PASSWORD //
export const updatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;

    // validation //
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "please provide a new password!",
      });
    }

    // old password check //
    const isMatch = await user.comparePassword(oldPassword);

    // validation //
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "invalid old password!!",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in password change api!",
      error,
    });
  }
};

// UPDATE USER PROFILE PIC //
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    // get file of client pic from user's request //
    const file = getDataUri(req.file);

    // delete prev img, we need to remove earlier profilePic of user by removing public id id of img //
    // 1st we need to upload the pic so that it gets updated later so comment out in the 1st run // 
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    // update profile pic of user //
    const cdb = await cloudinary.v2.uploader.upload(file.content); // we have profile pic in file.content //

    // updating profile pic data with new profile pic data which is stored in cdb //
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // save function //
    await user.save();
    res.status(200).send({
      success: true,
      message: "profile pic updated successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in update profile pic API!",
      error,
    });
  }
};

// FORGOT PASSWORD //
export const forgotPasswordController = async (req, res) => {
  try {
    // user get email || newPassword || answer
    const { email, newPassword, answer } = req.body;
    // valdiation
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    // find user
    const user = await userModel.findOne({ email, answer });
    //valdiation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "invalid user or answer",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Your Password Has Been Reset Please Login !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In password reset API",
      error,
    });
  }
};
