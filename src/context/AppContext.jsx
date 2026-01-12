import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  const loadUserData = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    const data = snap.data();

    setUserData(data);
    navigate(data.name ? "/chat" : "/profile");

    await updateDoc(ref, { lastSeen: Date.now() });

    setInterval(async () => {
      if (auth.currentUser) {
        await updateDoc(ref, { lastSeen: Date.now() });
      }
    }, 60000);
  };

  useEffect(() => {
    if (!userData) return;

    const ref = doc(db, "chats", userData.id);
    const unsub = onSnapshot(ref, async (snap) => {
      const items = snap.data().chatData || [];
      const temp = [];

      for (const item of items) {
        const userSnap = await getDoc(
          doc(db, "users", item.rId)
        );
        temp.push({ ...item, userData: userSnap.data() });
      }

      setChatData(temp.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unsub();
  }, [userData]);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        chatData,
        loadUserData,
        messages,
        setMessages,
        messagesId,
        setMessagesId,
        chatUser,
        setChatUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
