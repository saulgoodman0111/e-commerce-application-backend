import { productModel } from "./../models/productModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "./../utils/features.js";

// GET ALL PRODUCTS //
export const getAllProductsController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "All products fetched successfully!!",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in get all products api!",
      error,
    });
  }
};

// GET TOP PRODUCTS //
export const getTopProductsController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
    res.status(200).send({
      success: true,
      message: "TOP 3 PRODUCTS ==> ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "ERROR IN GET TOP PRODUCTS API!!",
      error,
    });
  }
};

// GET SINGLE PRODUCT BY ID //
export const getSingleProductController = async (req, res) => {
  try {
    // get product id from url parameter //
    const product = await productModel.findById(req.params.id);

    // valdiation //
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found!!",
      });
    }
    res.status(200).send({
      success: true,
      message: "Product Found",
      product,
    });
  } catch (error) {
    console.log(error);

    // cast error ||  OBJECT ID not found //
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In get single Products API",
      error,
    });
  }
};

// CREATE PRODUCT //
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // validation //
    // if (!name || !description || !price || !stock) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Please Provide all fields",
    //   });
    // }
    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "Please provide product image!",
      });
    }

    // for img upload of product //
    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // creating product in product model //
    await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      // since we have a array of images //
      images: [image],
    });
    res.status(201).send({
      success: true,
      message: "Product created successfully!",
      // product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In create product API!!",
      error,
    });
  }
};

// UPDATE PRODUCTS //
export const updateProductController = async (req, res) => {
  try {
    // find product //
    const product = await productModel.findById(req.params.id);

    // validatiuon //
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const { name, description, price, stock, category } = req.body;

    // validate and update //
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    res.status(200).send({
      success: true,
      message: "Product details updated",
    });
  } catch (error) {
    console.log(error);

    // cast error ||  OBJECT ID //
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In UPDATE Products API!!",
      error,
    });
  }
};

// UPDATE PRODUCT IMG //
export const updateProductImageController = async (req, res) => {
  try {
    // find product //
    const product = await productModel.findById(req.params.id);

    // validation //
    if (!product) {
      return res.status(401).send({
        success: false,
        message: "PRODUCT not found",
      });
    }

    // check file //
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "PRODUCT IMG not found!!",
      });
    }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // save product img //
    // we use push method to store in array //
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "PRODUCT IMAGE updated",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get UPDATE Products IMAGE API",
      error,
    });
  }
};

// DELETE PRODUCT IMG //
export const deleteProductImageController = async (req, res) => {
  try {
    // find product //
    const product = await productModel.findById(req.params.id);

    // validation //
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "PRODUCT not found!",
      });
    }

    // image id finding //
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "PRODUCT IMAGE not found",
      });
    }

    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "IMAGE Not Found",
      });
    }

    // DELETE PRODUCT IMG //
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();
    return res.status(200).send({
      success: true,
      message: "PRODUCT IMG DELETED successfully!",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get DELETE PRODUCT IMAGE API",
      error,
    });
  }
};

// DELETE PRODUCT //
export const deleteProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "PRODUCT not found",
      });
    }
    // find and delete image cloudinary
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "PRODUCT DELETED Successfully",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "INVALID ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "ERROR IN DELETE PRODUCT API!",
      error,
    });
  }
};

// CREATE PRODUCT REVIEW AND COMMENT //
export const productReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    // find product
    const product = await productModel.findById(req.params.id);
    // check previous review
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).send({
        success: false,
        message: "Product Alredy Reviewed",
      });
    }
    // review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    // passing review object to reviews array
    product.reviews.push(review);
    // number or reviews
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    // save
    await product.save();
    res.status(200).send({
      success: true,
      message: "Review Added!",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Review Comment API",
      error,
    });
  }
};
