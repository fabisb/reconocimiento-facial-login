import { pool } from "../database/db.js";

export const agregarController = async (req, res) => {
  console.log("AgregarController");
  const { nombre, tipo, cantidad } = req.body;

  if (nombre == "" || cantidad == "" || cantidad == 0 || tipo == "") {
    console.log("Error falta algun dato");
    return await res.status(400).json({ mensaje: "Error falta algun dato" });
  } else if (isNaN(cantidad)) {
    console.log("Error tipo de dato");
    return await res.status(400).json({ mensaje: "Error tipo de dato" });
  }
  const [existencia] = await pool.execute(
    "SELECT nombre, tipo FROM productos WHERE nombre = ? AND tipo = ?",
    [nombre, tipo]
  );
  console.log("🚀 ~ file: producto.controller.js:18 ~ agregarController ~ existencia:", existencia);
  if (existencia.length > 0) {
    return await res
      .status(405)
      .json({ mensaje: "Error ya se encontro un producto de igual nombre y tipo" });
  } else {
    const [insertado] = await pool.execute("INSERT INTO productos (nombre, tipo) VALUES (?,?)", [
      nombre,
      tipo,
    ]);
    console.log(
      "🚀 ~ file: producto.controller.js:28 ~ agregarController ~ insertado:",
      insertado.insertId
    );
    await pool.execute("INSERT INTO cantidad_producto (id_producto, cantidad) VALUES (?,?)", [
      insertado.insertId,
      cantidad,
    ]);
    return await res.status(200).json({ mensaje: "Insertado exitoso" });
  }
};

export const editarController = async (req, res) => {
  console.log("editarController");
  const { nombre, tipo, cantidad, idExistente } = req.body;
  console.log("🚀 ~ file: producto.controller.js:43 ~ editarController ~ req.body:", req.body);

  if (nombre == "" || cantidad == "" || cantidad == 0 || tipo == "") {
    console.log("Error falta algun dato");
    return await res.status(400).json({ mensaje: "Error falta algun dato" });
  } else if (isNaN(cantidad)) {
    console.log("Error tipo de dato");
    return await res.status(400).json({ mensaje: "Error tipo de dato" });
  }
  try {
    const [existencia] = await pool.execute(
      "SELECT id, nombre, tipo FROM productos WHERE nombre = ? AND tipo = ?",
      [nombre, tipo]
    );
    console.log(
      "🚀 ~ file: producto.controller.js:18 ~ agregarController ~ existencia:",
      existencia
    );
    if (existencia.length !== 0) {
      const [cantidadExistente] = await pool.execute(
        "SELECT cantidad FROM cantidad_producto WHERE id_producto = ?",
        [existencia[0].id]
      );
      if (cantidadExistente[0].cantidad == cantidad && existencia.length > 0) {
        return await res
          .status(405)
          .json({ mensaje: "Error ya se encontro un producto de igual nombre, tipo y cantidad" });
      }
    }

    const [actualizado] = await pool.execute(
      "UPDATE productos SET nombre = ?, tipo = ? WHERE id = ?",
      [nombre, tipo, idExistente]
    );
    
    const cantidadProducto = await pool.execute("UPDATE cantidad_producto SET cantidad = ? WHERE id_producto = ?", [
      parseFloat(cantidad),
      idExistente,
    ]);
    return await res.status(200).json({ mensaje: "Actualizado exitoso" });
  } catch (error) {
    console.log(error);
    return await res.status(500).json({ mensaje: "Error de servidor" });
  }
};

export const idProductoController = async (req, res) => {
  console.log("idProductoController");
  const { id } = req.query;
  const [idProducto] = await pool.execute("SELECT * FROM productos WHERE id = ?", [id]);
  if (idProducto.length > 0) {
    const [cantidadProducto] = await pool.execute(
      "SELECT * FROM cantidad_producto WHERE id_producto = ?",
      [id]
    );
    return await res
      .status(200)
      .json({ producto: idProducto[0], cantidad: cantidadProducto[0].cantidad });
  } else {
    return await res.status(404).json({ mensaje: "No se ha podido encontrar el producto" });
  }
};

export const idTipoProductoController = async (req, res) => {
  console.log("idProductoController");
  const { tipo } = req.query;
  if (tipo == "") {
    return await res.status(404).json({ mensaje: "No se ha podido encontrar el tipo producto" });
  }
  console.log(
    "🚀 ~ file: producto.controller.js:90 ~ idTipoProductoController ~ req.query:",
    req.query
  );
  const [productos] = await pool.execute("SELECT * FROM productos WHERE tipo = ?", [tipo]);
  if (productos.length < 0) {
    return await res.status(404).json({ mensaje: "No se ha podido encontrar el tipo producto" });
  }
  console.log(
    "🚀 ~ file: producto.controller.js:92 ~ idTipoProductoController ~ productos:",
    productos
  );
  return await res.status(200).json(productos);
};
