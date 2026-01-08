// Firebase Configuration
// STUDIO AKIRA Firebase Project

const firebaseConfig = {
    apiKey: "AIzaSyAh_rl50xERwFohcrrHcY3tOvViKOBgaIw",
    authDomain: "studio-akira-99dde.firebaseapp.com",
    projectId: "studio-akira-99dde",
    storageBucket: "studio-akira-99dde.firebasestorage.app",
    messagingSenderId: "578402488002",
    appId: "1:578402488002:web:f2379a33e000b0894df55b",
    measurementId: "G-V1GKNCXV9M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;

console.log("Firebase initialized successfully");
