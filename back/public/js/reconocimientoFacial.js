// Cargar modelos de face-api.js
async function cargarModelos() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
}

cargarModelos();

// Acceder a la cámara web
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

iniciarCamara();

// Capturar una imagen de la cámara
const capturarBtn = document.getElementById("capturar");
const autenticarBtn = document.getElementById("autenticar");

let imagenCapturada = null;

capturarBtn.addEventListener("click", async () => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Procesar la imagen capturada
  imagenCapturada = canvas.toDataURL();
  console.log(
    "🚀 ~ file: index.html:48 ~ capturarBtn.addEventListener ~ imagenCapturada:",
    imagenCapturada
  );
});

// Enviar la imagen al servidor para autenticación
autenticarBtn.addEventListener("click", async () => {
  try {
    if (imagenCapturada) {
      const { data: match } = await axios.post("/autenticar", { imagenCapturada });
      console.log("🚀 ~ file: index.html:62 ~ autenticarBtn.addEventListener ~ data:", match);
      console.log(
        "🚀 ~ file: index.html:60 ~ autenticarBtn.addEventListener ~ match.mensaje, match.match:",
        match.mensaje,
        match.match
      );
      document.getElementById("loadingSpinner").hidden = true;
      document.getElementById("loginForm").hidden = false;
      document.getElementById("labelMatch").innerText = match.match.split(".")[0];
      document.getElementById("imgMatch").src = imagenCapturada;
      document.getElementById('loginBtn').removeAttribute('disabled')
    } else {
      alert("Capture una imagen primero.");
    }
  } catch (error) {
    console.log(error);
    if (error.data) {
      console.log(error.data);
    }
  alert('ERROR AL IDENTIFICAR IMAGEN')

  }
});

const fotoLogin = async ()=>{
const pass=  document.getElementById('password').value;
if (pass == 123) {
  alert('simulacion de contraseña CORRECTA, puede ingresar...')
}else{

  alert('simulacion de contraseña INCORRECTA, NO puede ingresar...')
}
}
