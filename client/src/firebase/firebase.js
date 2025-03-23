// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDauC5xywKpwLy_WBOj6aaIVr0tAa0z4Rs",
//   authDomain: "oa-virtoffice-project.firebaseapp.com",
//   projectId: "oa-virtoffice-project",
//   storageBucket: "oa-virtoffice-project.appspot.com",
//   messagingSenderId: "416890512159",
//   appId: "1:416890512159:web:59d7b08b2333270e6f062a",
//   measurementId: "G-JDJCEPS4YH"
// };
const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  measurementId: process.env.REACT_APP_measurementId,
  databaseURL: "https://virtual-office-oa-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseDatabase = getDatabase(firebaseApp);

// Basic Operations
export function writeUsersData(name, id, position, characterClass, socketId) {
  const db = getDatabase();
  set(ref(db, "users/" + id), {
    characterClass: characterClass,
    id: id,
    name: name,
    position: position,
    socketId: socketId
  });
}

export function getUsersData(callback) {
  const db = getDatabase();
  const usersRef = ref(db, "users/");
  onValue(usersRef, (snapshot) => {
    const usersData = snapshot.val();
    console.log(usersData);
    callback(usersData);
  });
}
