const video = document.getElementById('video');
const loginButton = document.getElementById('loginButton');

navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
        video.srcObject = stream;
    });

loginButton.addEventListener('click', () => {
    // Aquí deberías capturar la imagen del video y enviarla al servidor
    console.log('Iniciar sesión con imagen capturada');
});

// Añade este código al inicio de script.js
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        });
}
// Añade esta función para capturar la imagen del video
function captureImageFromVideo(videoEl) {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext('2d').drawImage(videoEl, 0, 0);
    return canvas.toDataURL('image/jpeg');
}
loginButton.addEventListener('click', async () => {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (detections) {
        // Convierte los descriptores faciales en una cadena o formato que pueda ser enviado al servidor
        // Envía la información al servidor para el inicio de sesión
            const imageSrc = captureImageFromVideo(video);
        const response = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ image: imageSrc })
        });
    
        const result = await response.json();
        console.log(result.message);
    } else {
        console.log('No se detectó ningún rostro.');
    }
});
