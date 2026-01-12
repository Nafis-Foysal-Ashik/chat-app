import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'

const ChatBox = () => {

  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext)
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
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
            
            // Singular 'chatData' to match your schema
            const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messagesId);
            
            if (chatIndex !== -1) {
              userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);
              // 'updatedAt' to match your schema
              userChatData.chatData[chatIndex].updatedAt = Date.now();

              if (userChatData.chatData[chatIndex].rId === userData.id) {
                userChatData.chatData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatRef, {
                chatData: userChatData.chatData 
              })
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
    if (!timestamp) return "";
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedMinute = minute < 10 ? '0' + minute : minute;
    if (hour > 12) {
      return (hour - 12) + ":" + formattedMinute + " PM";
    } else {
      return hour + ":" + formattedMinute + " AM";
    }
  }

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        if (res.exists()) {
          const data = res.data().messages;
          setMessages([...data].reverse());
        }
      })
      return () => unSub();
    }
  }, [messagesId, setMessages])

  return chatUser ? (
      <div className='chatbox'>
          <div className="chat-user">
            {/* Display recipient avatar from DB or default */}
            <img src={chatUser.userData.avater || assets.profile_img} alt="" />
            <p>{chatUser.userData.name}<img className='dot' src={assets.green_dot} alt="" /></p>
            {/* Added help icon back as per UI reference */}
            
          </div>

          <div className="chat-msg">
              {messages.map((msg, index) => (
                  <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                      <p className="msg">{msg.text}</p>
                      <div>
                          {/* Use dynamic avatar for each message */}
                          <img src={msg.sId === userData.id ? (userData.avater || assets.profile_img) : (chatUser.userData.avater || assets.profile_img)} alt="" />
                          <p>{convertTimestamp(msg.createdAt)}</p> 
                      </div>
                  </div>
              ))}
          </div>

          <div className="chat-input">
              <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='send a message' />
              <input type="file" id='image' accept='image/png , image/jpeg' hidden />
              
              <img onClick={sendMessage} src={assets.send_button} alt="" />
          </div>
      </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime & anywhere</p>
    </div>
  )
}

export default ChatBox