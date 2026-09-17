import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// import Zod validators
import {
  zUserId,
  zItemId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody
} from "../libs/zodValidators.js";
// import types
import type { Item, UserPayload } from "../libs/types.ts";
// import database
import { items } from "../db/db.ts";
//import uuid
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/vXXX/items/:userId 
router.get("/:userId",(req: Request, res: Response) => {
    
  //check header
 const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized header is missing",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token is required",
    });
  }

  const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";

  jwt.verify(token, jwt_secret, (err, payload) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "error verify token",
      });
    }

    const user_payload = payload as UserPayload;

    try {
      const userId = req.params.userId;

      // 3.3 ตรวจสอบความเป็นเจ้าของ
      if (user_payload.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }

      // 3.1 ดึงรายการสินค้า
      const data = items.filter((item) => item.userId === userId);

      // 3.2 ตรวจสอบกรณีไม่มีสินค้า
      if (data.length === 0) {
        return res.status(404).json({
          success: false,
          message: `items for user ID ${userId} not found`,
        });
      }

      // 3.1
      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err,
      });
    }
  });
});

// POST /api/vXXX/items/:userId, body = {new item data}
// add a new Item for userId
router.post("/:userId",async (req: Request, res: Response) => {
  
  //check header
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized header is missing",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token is required",
    });
  }

  const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";

  jwt.verify(token, jwt_secret, (err, payload) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "error verify token",
      });
    }

    const user_payload = payload as UserPayload;

    try {
      const userId = req.params.userId;

      // 3.5 ตรวจสอบความเป็นเจ้าของ
      if (user_payload.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }
    
      // 3.5 เพิ่มสินค้าลงตะกร้า
      const newItem: Item = {
        userId: userId,
        itemId: uuidv4(),
        product_name: req.body.product_name,
        unit_price: req.body.unit_price,
        quantity: req.body.quantity,
        category: req.body.category,
      }; 

      items.push(newItem);

      return res.status(201).json({
        success: true,
        message: "New Item has been added successfully",
        data: newItem,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err,
      });
    }
  });
});

// Delete /api/vXXX/items/:userId


export default router;