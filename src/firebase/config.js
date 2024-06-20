// firebase.js
import { initializeApp} from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Tu configuración de Firebase obtenida desde Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyBsdbNi0BO2ZPZeQqpMyOMj0vn6Qc2jFIg",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://proyectoucmjg-default-rtdb.firebaseio.com",
  projectId: "proyectoucmjg",
  storageBucket: "proyectoucmjg.appspot.com",
  appId: "1:1079422244815:android:cabae2d7b1358efd74a4ba"
};

// Inicializar Firebase

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };