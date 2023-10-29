import express from "express";
import { verifyToken } from "../controllers/login.controller.js";
import { agregarController, editarController, idProductoController, idTipoProductoController } from "../controllers/producto.controller.js";
var router = express.Router();

/* POST users listing. */
router.post("/agregar",verifyToken,agregarController );
router.patch("/editar",verifyToken,editarController );

/* GET users listing. */
router.get('/idProducto',verifyToken,idProductoController)
router.get('/idTipoProducto',verifyToken,idTipoProductoController)
export default router;
