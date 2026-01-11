import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase' // Ensure this import is correct
import { toast } from 'react-toastify'

const ChatBox = () => {

  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext)
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        console.log("Attempting to send to messagesId:", messagesId);

        // Update messages collection
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        })

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            
            // FIXED: Using 'chatData' singular to match your schema
            const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messagesId);
            
            if (chatIndex !== -1) {
              userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);
              // FIXED: Using 'updatedAt' to match your schema
              userChatData.chatData[chatIndex].updatedAt = Date.now();

              if (userChatData.chatData[chatIndex].rId === userData.id) {
                userChatData.chatData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatRef, {
                chatData: userChatData.chatData 
              })
              console.log("Sidebar updated in database for ID:", id);
            }
          }
        })
      }
    } catch (error) {
      console.error("SendMessage Error:", error);
      toast.error(error.message);
    }
    setInput(""); 
  }

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if(hour>12)
    {
      return hour-12 + ":" + minute + "PM";
    }
    else
    {
      return hour + ":" + minute + "AM";

    }
  }

  useEffect(() => {
    if (messagesId) {
      console.log("Listener initialized for messagesId:", messagesId);
      
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        if (res.exists()) {
          const data = res.data().messages;
          console.log("New data received from Firestore:", data); // THIS SHOULD NOW SHOW
          setMessages([...data].reverse());
        } else {
          console.log("Document does not exist in 'messages' collection");
        }
      })
      return () => unSub();
    }
  }, [messagesId])

  // UI mapping logic ...
  return chatUser ? (
      <div className='chatbox'>
          <div className="chat-user">
            <img src={chatUser.userData.avatar || assets.profile_img} alt="" />
            <p>{chatUser.userData.name}<img className='dot' src={assets.green_dot} alt="" /></p>
            <img src={assets.help_icon} className='help' alt="" />
          </div>
          <div className="chat-msg">
              {messages.map((msg, index) => (
                  <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                      <p className="msg">{msg.text}</p>
                      <div>
                          <img src={assets.avatar_icon} alt="" />
                          <p>{convertTimestamp(msg.createdAt)}</p> 
                      </div>
                  </div>
              ))}
          </div>
          <div className="chat-input">
              <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='send a message' />
              <img onClick={sendMessage} src={assets.send_button} alt="" />
          </div>
      </div>
  ) : <div className="chat-welcome">Welcome</div>
}

export default ChatBox