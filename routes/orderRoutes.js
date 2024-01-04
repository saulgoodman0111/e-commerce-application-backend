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
  changeOrderStatusController,
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  paymentController,
  singleOrderDetailsController,
} from "../controllers/orderController.js";
// import {
//   createCategory,
//   deleteCategoryController,
//   getAllCategoriesController,
//   updateCategoryController,
// } from "../controllers/categoryController.js";
// import { singleUpload } from "./../middlewares/multer.js";

const router = express.Router();

// routes //
// ORDERS ROUTE //

// CREATE ORDERS //
router.post("/create", isAuth, createOrderController);

// GET ALL ORDERS //
router.get("/my-orders", isAuth, getMyOrdersController);

// GET SINGLE ORDER BY ID //
router.get("/my-orders/:id", isAuth, singleOrderDetailsController);

// ACCEPT PAYMENT //
router.post("/payments", isAuth, paymentController);
export default router;

// ADMIN PART //

// get-all-order-admin //
router.get("/admin/get-all-orders", isAuth, isAdmin, getAllOrdersController);

// change order status //
router.put("/admin/order/:id", isAuth, isAdmin,changeOrderStatusController);
