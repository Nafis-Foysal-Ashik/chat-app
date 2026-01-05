// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyDGyC5_Aceu_GWZ4Ymj9E3WvgreybKcPpU",
  authDomain: "chat-app-gs-b54b9.firebaseapp.com",
  projectId: "chat-app-gs-b54b9",
  storageBucket: "chat-app-gs-b54b9.firebasestorage.app",
  messagingSenderId: "1042141999056",
  appId: "1:1042141999056:web:eab814a66e02c70ced53d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth= getAuth(app);
const db = getFirestore(app);

const signup = async(username , email , password) =>{
    try {
        const res = await createUserWithEmailAndPassword(auth , email , password);
        const user=res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avater:"",
            bio:"Hey, I am  using chat app",
            lastseen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatData:[]
        })
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

const login = async(email , password) => {
    try {
        await signInWithEmailAndPassword(auth , email , password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}


const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

export{signup,login,logout,auth,db}