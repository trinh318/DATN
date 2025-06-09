import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// Cấu hình Firebase của bạn
const firebaseConfig = {
    apiKey: "AIzaSyDCLOEXGpDxi9-PCct2dcbPn8pqV9SJcOI",
    authDomain: "hirepoint-c9165.firebaseapp.com",
    projectId: "hirepoint-c9165",
    storageBucket: "hirepoint-c9165.firebasestorage.app",
    messagingSenderId: "667757848323",
    appId: "1:667757848323:web:3dae8e7acd725d58d66b36",
    measurementId: "G-27SHGT0HKX"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Authentication
const auth = getAuth(app);

// Khởi tạo các Provider
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };