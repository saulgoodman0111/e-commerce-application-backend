import express from "express";
// import {
//   createProductController,
//   deleteProductController,
//   deleteProductImageController,
//   getAllProductsController,
//   getSingleProductController,
//   updateProductController,
//   updateProductImageController,
// } from "../controllers/productController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  createCategory,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from "../controllers/categoryController.js";
// import { singleUpload } from "./../middlewares/multer.js";

const router = express.Router();

// routes //
// CATEGORIES ROUTE //

// CREATE CATEGORY //
router.post("/create", isAuth, isAdmin, createCategory);

// GET ALL CATEGORIES //
router.get("/get-all", getAllCategoriesController);

// DELETE CATEGORY //
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);

// UPDATE CATEGORY //
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

export default router;
