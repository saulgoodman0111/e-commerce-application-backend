import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import Stripe from "stripe";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

// ROUTES FILES IMPORT //
import testRoutes from "./routes/testRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// DOT ENV CONFIG //
dotenv.config();

// DB CONNECTION //
connectDB();

// STRIPE CONFIG //
export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

// CLOUDINARY CONFIG //
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// REST OBJECT //
const app = express();

// MIDDLEWARES //
app.use(helmet());
app.use(mongoSanitize());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// ROUTES //
app.use("/api/v1", testRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/order", orderRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "This is just for testing purposes!!",
    status: "success",
  });
});

// PORT //
const PORT = process.env.PORT || 8000;

// LISTEN //
app.listen(PORT, () => {
  console.log(
    `Server running on port:${process.env.PORT} in ${process.env.MODE_ENV} mode`
      .bgMagenta.white
  );
});
