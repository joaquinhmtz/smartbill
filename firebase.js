// smartbill/firebase.js

// 1) Use the compat build so we can require() in Node.
const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');

// 2) Your Firebase project config
const firebaseConfig = {
  apiKey:    "AIzaSyCqPKCAHXSyAlhx5WTWhAQzBGqJdb1vc2c",
  authDomain:"smartbill-77f15.firebaseapp.com",
  projectId: "smartbill-77f15",
  storageBucket: "smartbill-77f15.appspot.com",
  messagingSenderId: "979630035766",
  appId:     "1:979630035766:web:83873f2688a98ac7959997",
  measurementId: "G-2VXSFHT18B"
};

// 3) Initialize Firebase/App & Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 4) uploadLog: called from tracker.js
async function uploadLog(entry) {
  console.log("🚀 uploadLog called with:", entry);
  try {
    // merge in a server timestamp
    const docRef = await db.collection('activityLogs').add({
      ...entry,
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Firebase upload ok, doc ID:", docRef.id);
  } catch (error) {
    console.error("❌ Firebase upload failed:", error);
  }
}

module.exports = { uploadLog };
// -- ADD THESE LINES AT THE BOTTOM OF firebase.js --
if (require.main === module) {
  console.log('🏁 Manual Firebase test start');
  uploadLog({
    timestamp: new Date().toISOString(),
    app: 'TEST_APP',
    windowTitle: 'TEST_WINDOW',
    durationSeconds: 1
  });
}
