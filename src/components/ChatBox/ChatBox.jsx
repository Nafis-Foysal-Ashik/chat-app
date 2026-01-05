import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore'

const ChatBox = () => {

  const {userData , messagesId , chatUser , messages , setMessages } = useContext(AppContext)

  const [input,setInput] = useState("");
  
  const sendMessage = async () =>{
    try {
      if(input && messagesId){
        await updateDoc(doc(db,'messages',messagesId),{
          messages:arrayUnion({
            sId:userData.id,
            text:input,
            createdAt:new Date()
          })
        })
      }
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    if(messagesId)
    {
      const unSub = onSnapshot(doc(db,'messages',messagesId),(res)=>{
        setMessages(res.data().messages.reverse());
        console.log(res.data().messages.reverse())
      })
    }
  },[messagesId])

  return chatUser ? (
    <div className='chatbox'>
        <div className="chat-user">
          <img src={assets.profile_img}  alt="" />
          <p>{chatUser.userData.name}<img className='dot' src={assets.green_dot} alt="" /></p>
          <img src={assets.help_icon} className='help' alt="" />
        </div>

        <div className="chat-msg">
          <div className="s-msg">
            <p className="msg">Lorem ipsum dolor sit amet consectetur.</p>
            <div>
              <img src={assets.profile_img} alt="" />
              <p>2:30 PM</p>
            </div>
          </div>


          <div className="r-msg">
            <img className='msg-img' src={assets.pic1} alt="" />
            <div>
              <img src={assets.profile_img} alt="" />
              <p>2:30 PM</p>
            </div>
          </div>


          <div className="r-msg">
            <p className="msg">Lorem ipsum dolor sit amet consectetur.</p>
            <div>
              <img src={assets.profile_img} alt="" />
              <p>2:30 PM</p>
            </div>
          </div>

        </div>

        <div className="chat-input">
          <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='send a message' />
          <input type="file" id='image' accept='image/png , image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" />
          </label>
          <img src={assets.send_button} alt="" />
        </div>
    </div>
  ):
  <div className="chat-welcome">
    <img src={assets.logo_icon} alt="" />
    <p>Chat anytime & anywhere</p>
  </div>
}

export default ChatBox