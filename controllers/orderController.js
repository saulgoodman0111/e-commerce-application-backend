import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { stripe } from "../server.js";

// CREATE ORDERS //
export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;

    // valdiation //
    if (
      !shippingInfo ||
      !orderItems ||
      // !paymentMethod ||
      // !paymentInfo ||
      !itemPrice ||
      !tax ||
      !shippingCharges ||
      !totalAmount
    ) {
      return res.status(404).send({
        success: false,
        message: `Please provide all fields!`,
      });
    }

    // create order //
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      // find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }
    res.status(201).send({
      success: true,
      message: `ORDER PLACED SUCCESSFULLY!!`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Create Order API",
      error,
    });
  }
};

// GET ALL ORDERS--> MY ORDERS //
export const getMyOrdersController = async (req, res) => {
  try {
    // find orders //
    const orders = await orderModel.find({ user: req.user._id });

    //valdiation //

    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "NO ORDERS FOUND!!",
      });
    }
    res.status(200).send({
      success: true,
      message: "YOUR ORDERS DATA -->",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "ERROR IN MY ORDERS API!!",
      error,
    });
  }
};

// GET SINGLE ORDER BY ID //
export const singleOrderDetailsController = async (req, res) => {
  try {
    // find orders
    const order = await orderModel.findById(req.params.id);
    //valdiation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "NO ORDERS FOUND!",
      });
    }
    res.status(200).send({
      success: true,
      message: "YOUR ORDER FETCHED SUCCESSFULLY!",
      order,
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "INVALID ID!!",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In GET ORDERS BY ID API!!",
      error,
    });
  }
};

// ACCEPT PAYMENT CONTROLLER //
export const paymentController = async (req, res) => {
  try {
    // get amount //
    const { totalAmount } = req.body;

    // validation //
    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "Total Amount is required",
      });
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount * 100),
      currency: "usd",
    });
    res.status(200).send({
      success: true,
      client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In ACCEPT  PAYMENTS API!!",
      error,
    });
  }
};

//// ADMIN SECTION ////

// GET ALL ORDERS //
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "ALL ORDERS DATA!!",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "ERROR IN GET ALL ORDERS API FROM ADMIN SECTION!!",
      error,
    });
  }
};

// CHANGE ORDER STATUS //
export const changeOrderStatusController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);

    // validatiom
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "ORDER NOT FOUND!!",
      });
    }
    if (order.orderStatus === "processing") order.orderStatus = "shipped";
    else if (order.orderStatus === "shipped") {
      order.orderStatus = "deliverd";
      order.deliverdAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "ORDER ALREADY DELIVERED!!",
      });
    }
    await order.save();
    res.status(200).send({
      success: true,
      message: "ORDER STATUS UPDATED!!",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "INVALID ID!!",
      });
    }
    res.status(500).send({
      success: false,
      message: "ERROR IN CHANGE ORDER STATUS API!!",
      error,
    });
  }
};
