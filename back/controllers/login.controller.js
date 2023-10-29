import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";
export const loginController = async (req, res, next) => {
  console.log("loginController");
  const { user, pass } = req.body;
  if (!(user || pass) || user == "" || pass == "") {
    return res.status(422).json({ mensaje: "Error al iniciar sesion, valide los datos" });
  }
  const [id] = await pool.execute(
    "SELECT id, nivel FROM users WHERE username = ? AND password = ?",
    [user, pass]
  );
  if (id.length > 0) {
    var token = await jwt.sign({ id: id[0].id, user, nivel: id[0].nivel }, "secret", {
      expiresIn: "1 days",
    });

    return res.status(200).json({ token, user });
  } else {
    return res
      .status("404")
      .json({ mensaje: "No se han encontrado informacion con ese usuario o contraseña" });
  }
};

export const verifyToken = async (req, res, next) => {
const {token}=req.headers;
  try {
    var decoded = await jwt.verify(token, "secret");
    if (decoded) {
      console.log("🚀 ~ file: login.controller.js:31 ~ verifyToken ~ decoded:", decoded)
      req.user = decoded
      next();
    }
  } catch (err) {
    // err
    console.log(err);
    return res.status(420).json({ mensaje: "Error de autentificacion, verificar token" });
  }
};
