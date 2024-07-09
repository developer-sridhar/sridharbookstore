import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCVeQmwoD68lfxGKslqFCDlYQvEv8BVRzA",
  authDomain: "sridharbookstore.firebaseapp.com",
  projectId: "sridharbookstore",
  storageBucket: "sridharbookstore.appspot.com",
  messagingSenderId: "815535609342",
  appId: "1:815535609342:web:9d987546d497c6f1319caf",
  measurementId: "G-Y8ZGLFL2LK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
