import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// TODO: Replace with your Firebase Web App configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJvOCoFixp246QGCd-KXVqqbqL6jbmFy0",
    authDomain: "carecompass-76a6a.firebaseapp.com",
    projectId: "carecompass-76a6a",
    storageBucket: "carecompass-76a6a.firebasestorage.app",
    messagingSenderId: "757177013584",
    appId: "1:757177013584:web:392a892806db998b3f8855",
    measurementId: "G-SR4MYME5CQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Error signing in with Google", error);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
    }
};
