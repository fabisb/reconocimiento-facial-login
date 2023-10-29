import express from "express";
import { loginController } from "../controllers/login.controller.js";
var router = express.Router();

/* POST users listing. */
router.post("/login", loginController);

export default router;
