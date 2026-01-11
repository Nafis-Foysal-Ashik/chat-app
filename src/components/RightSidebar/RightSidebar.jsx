import React, { useContext } from "react";
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const RightSidebar = () => {
  const { chatUser } = useContext(AppContext);

  if (!chatUser) {
    return (
      <div className="rs">
        <p style={{ padding: "20px" }}>Select a chat</p>
      </div>
    );
  }

  return (
    <div className="rs">
      <div className="rs-profile">
        <img
          src={chatUser.userData?.avatar || assets.profile_img}
          alt=""
        />

        <h3>
          {chatUser.userData?.name}
          <img src={assets.green_dot} className="dot" alt="" />
        </h3>

        <p>
          {chatUser.userData?.bio || "Hey, I'm using this chat app"}
        </p>
      </div>

      <hr />
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default RightSidebar;
