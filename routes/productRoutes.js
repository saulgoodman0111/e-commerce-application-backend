import express from "express";
import {
  createProductController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getSingleProductController,
  getTopProductsController,
  productReviewController,
  updateProductController,
  updateProductImageController,
} from "../controllers/productController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "./../middlewares/multer.js";

const router = express.Router();

/* THIS IS THE COMPLETE PRODUCTS ROUTE */

// GET ALL PRODUCTS //
router.get("/get-all", getAllProductsController);

// GET TOP PRODUCTS //
router.get("/top", getTopProductsController);

// GET SINGLE PRODUCT //
router.get("/:id", getSingleProductController);

// CREATE PRODUCT //
router.post("/create", isAuth, isAdmin, singleUpload, createProductController);

// UPDATE PRODUCT //
router.put("/:id", isAuth, isAdmin, updateProductController);

// UPDATE PRODCUT IMG //
router.put(
  "/image/:id",
  isAuth,
  isAdmin,
  singleUpload,
  updateProductImageController
);

// delete product img //
router.delete(
  "/delete-image/:id",
  isAuth,
  isAdmin,
  deleteProductImageController
);

// delete product //
router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

// review and ratings of products//
router.put("/:id/review", isAuth, productReviewController);

export default router;
