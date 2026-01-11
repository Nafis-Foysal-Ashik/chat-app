import React, { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  query,
  setDoc,
  updateDoc,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    setChatUser,
    setMessagesId
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    const value = e.target.value.toLowerCase();
    if (!value) {
      setShowSearch(false);
      return;
    }

    setShowSearch(true);
    const q = query(
      collection(db, "users"),
      where("username", "==", value)
    );
    const snap = await getDocs(q);

    if (!snap.empty && snap.docs[0].data().id !== userData.id) {
      setUser(snap.docs[0].data());
    } else {
      setUser(null);
    }
  };

  const addChat = async () => {
    try {
      const msgRef = doc(collection(db, "messages"));

      await setDoc(msgRef, {
        createdAt: serverTimestamp(),
        messages: []
      });

      // other user
      await updateDoc(doc(db, "chats", user.id), {
        chatData: arrayUnion({
          messageId: msgRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      });

      // current user
      await updateDoc(doc(db, "chats", userData.id), {
        chatData: arrayUnion({
          messageId: msgRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      });

      setUser(null);
      setShowSearch(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setChat = (item) => {
    setMessagesId(item.messageId); // ✅ FIXED
    setChatUser(item);
  };

  return (
    <div className="ls">
      <div className="ls-search">
        <input onChange={inputHandler} placeholder="Search user" />
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends">
            <img src={user.avatar || assets.profile_img} />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData &&
          chatData.map((item, i) => (
            <div
              key={i}
              onClick={() => setChat(item)}
              className="friends"
            >
              <img
                src={item.userData.avatar || assets.profile_img}
              />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
