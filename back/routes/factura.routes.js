import express from "express";
import { verifyToken } from "../controllers/login.controller.js";
import { productosController } from "../controllers/factura.controller.js";
var router = express.Router();

/* POST users listing. */
//router.post("/crear",verifyToken,crearController );

/* GET users listing. */
router.get('/productos',verifyToken,productosController)
export default router;
