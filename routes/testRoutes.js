import express from "express";
import { testController } from "../controllers/testControllers.js";

// ROUTER OBJECT//
const router=express.Router();

// ROUTES //
router.get('/test', testController);


// EXPORT //
export default router;