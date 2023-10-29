import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";
import canvas, { createCanvas, loadImage } from "canvas";
import axios from "axios";
import faceapi from "face-api.js";
import bodyParser from "body-parser";
import Jimp from "jimp";
import blob from "blob";
var app = express();

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
const rutaModels = __dirname + "/models";
console.log("🚀 ~ file: app.js:23 ~ rutaModels :", rutaModels);
// Inicializar los modelos al iniciar la aplicación
const { faceLandmark68Net, faceRecognitionNet, SsdMobilenetv1 } = faceapi.nets;
async function cargarModelos() {
  console.log("Modelos cargados.");
}

cargarModelos();
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceapiOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 });
let faceMatcher; // Para almacenar las imágenes de referencia

// Middleware para analizar el cuerpo de la solicitud
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Cargar las imágenes de referencia al iniciar la aplicación
const imageDir = "./modelos/";
async function cargarImagenesDeReferencia() {
  // Carga las imágenes de referencia desde la carpeta "modelos"
  try {
    // Carga las imágenes de referencia desde la carpeta "modelos"
    const imageFiles = fs.readdirSync(imageDir);
    const labeledDescriptors = [];

    for (const imageFile of imageFiles) {
      const label = imageFile.split(".").slice(0, -1).join(".");
      const imagePath = path.join(imageDir, imageFile);
      const imagenBinaria = fs.readFileSync(imagePath);
      const imagenBase64 = imagenBinaria.toString("base64");

      // Convertir el búfer a una matriz Float32Array
      const faceInImg = await detectFaces(imagenBase64);
      console.log("🚀 ~ file: app.js:61 ~ cargarImagenesDeReferencia ~ faceInImg:", faceInImg);
      const results = await faceapi
        .detectAllFaces(faceInImg)
        .withFaceLandmarks()
        .withFaceDescriptors();
      console.log("🚀 ~ file: app.js:65 ~ cargarImagenesDeReferencia ~ results:", results);

      if (!results.length) {
        return;
      }
      // Crear una LabeledFaceDescriptors con la matriz Float32Array
      //const labeledDescriptor = new faceapi.LabeledFaceDescriptors(label, [float32Array]);
      labeledDescriptors.push(results);
    }
    console.log("Descriptores etiquetados:", labeledDescriptors);

    faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    console.log("Imágenes de referencia cargadas.");
  } catch (error) {
    console.error("Error al cargar imágenes de referencia:", error);
  }
}

async function cargarImgRef() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(rutaModels);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(rutaModels);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(rutaModels);
  console.log("cargarImgRef");
  const imageFiles = fs.readdirSync(imageDir);
  const modelosFaces = [];
  for (const imageFile of imageFiles) {
    const imagePath = path.join(imageDir, imageFile);
    console.log("🚀 ~ file: app.js:93 ~ cargarImgRef ~ imagePath:", imagePath);

    const referenceImage = await canvas.loadImage(imagePath);

    const resultsRef = await faceapi
      .detectAllFaces(referenceImage)
      .withFaceLandmarks()
      .withFaceDescriptors();
    // Convierte los descriptores faciales en un array de Float32Array
    const descriptorsArray = resultsRef.map((result) => result.descriptor);

    // Almacena los descriptores faciales en modelosFaces
    modelosFaces.push(
      new faceapi.LabeledFaceDescriptors(imageFile.split(".")[0], descriptorsArray)
    );
  }
  console.log("🚀 ~ file: app.js:99 ~ cargarImgRef ~ modelosFaces:", modelosFaces);
  faceMatcher = new faceapi.FaceMatcher(modelosFaces);
  console.log("🚀 ~ file: app.js:106 ~ cargarImgRef ~ faceMatcher:", faceMatcher);
  const labels = faceMatcher.labeledDescriptors.map((ld) => ld.label);
  console.log("🚀 ~ file: app.js:107 ~ cargarImgRef ~ labels:", labels);
}
cargarImgRef(); // Llamada a la función al iniciar la aplicación

// Ruta para autenticar al usuario
app.post("/autenticar", async (req, res) => {
  if (!faceMatcher) {
    return res.status(500).send("Cargue imágenes de referencia primero.");
  }

  const { imagenCapturada } = req.body;

  // Convierte la imagen capturada en una imagen de face-api.js

  // Detecta caras en la imagen capturada
  try {
    const resultsQuery = await canvas.loadImage(imagenCapturada);
    const detections = await faceapi
      .detectSingleFace(resultsQuery)
      .withFaceLandmarks()
      .withFaceDescriptor();
    console.log("🚀 ~ file: app.js:128 ~ app.post ~ detections:", detections);

    if (!detections) {
      return res.status(401).send("No se detectaron caras en la imagen capturada.");
    }

    // Compara las caras detectadas con las imágenes de referencia
    const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
    console.log("🚀 ~ file: app.js:103 ~ app.post ~ bestMatch:", bestMatch);

    // Si hay una coincidencia, el usuario está autenticado
    if (bestMatch.label !== "unknown") {
      res.status(200).send(`Usuario autenticado como ${bestMatch.label}.`);
    } else {
      res.status(401).send("No se pudo autenticar al usuario.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor.");
  }
});
async function detectFaces(base64Image) {
  console.log("detectFaces");
  // Decodifica la cadena de datos base64 en un búfer
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // Crea un objeto Canvas y carga la imagen en él
  const canvas = createCanvas(640, 480); // Tamaño deseado
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = base64Image;

  // Espera a que la imagen se cargue
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Dibuja la imagen en el contexto del Canvas
  ctx.drawImage(img, 0, 0);

  // Realiza la detección facial en el Canvas
  const detections = await faceapi
    .detectSingleFace(base64Image)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detections;
}

export default app;
