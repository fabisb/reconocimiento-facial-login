const express = require("express");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();
const port = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Función para inicializar modelos y cargar imagen de referencia
async function initialize() {
    try {
        
   
  // Carga los modelos
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models");

  // Carga y procesa la imagen previa
  const referenceImage = await canvas.loadImage("path_to_your_reference_image.jpg");
  return await faceapi.detectSingleFace(referenceImage).withFaceLandmarks().withFaceDescriptor();
} catch (error) {
    console.log(error)
}
}

// Inicializa y guarda el descriptor de referencia
let referenceDescriptor;
initialize().then((descriptor) => {
  referenceDescriptor = descriptor;
});

app.post("/login", async (req, res) => {
  const { image } = req.body;
  const imageBuffer = Buffer.from(image.split(",")[1], "base64");

  const queryImage = await canvas.loadImage(imageBuffer);
  const queryDescriptor = await faceapi
    .detectSingleFace(queryImage)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!queryDescriptor) {
    return res.status(400).json({ message: "No se pudo detectar un rostro en la imagen enviada." });
  }

  const distance = faceapi.euclideanDistance(
    referenceDescriptor.descriptor,
    queryDescriptor.descriptor
  );

  if (distance < 0.6) {
    res.json({ message: "Inicio de sesión exitoso." });
  } else {
    res.json({ message: "Falló la autenticación facial." });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
