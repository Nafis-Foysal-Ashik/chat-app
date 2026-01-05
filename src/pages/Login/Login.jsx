import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup,login } from '../../config/firebase' // Added login import

const Login = () => {

  const [currentState, setCurrentState] = useState("Sign Up")
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currentState === "Sign Up") {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="Logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currentState}</h2>

        {/* Fixed: Conditional check must match State exactly (Sign Up) */}
        {currentState === "Sign Up" ? (
          <input 
            onChange={(e) => setUserName(e.target.value)} 
            value={userName} 
            type="text" 
            placeholder='username' 
            className="form-input" 
            required 
          />
        ) : null}

        <input 
          onChange={(e) => setEmail(e.target.value)} 
          value={email} 
          type="email" 
          placeholder='email address' 
          className="form-input" 
          required 
        />
        <input 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
          type="password" 
          placeholder='password' 
          className="form-input" 
          required 
        />

        <button type='submit'>
          {currentState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <div className="login-term">
          <input type="checkbox" required />
          <p>Agree to the terms of use and privacy policy</p>
        </div>

        <div className="login-forgot">
          {currentState === "Sign Up" ? (
            <p className="login-toggle">
              Already have an account? 
              <span onClick={() => setCurrentState("Log In")}> Login Here</span>
            </p>
          ) : (
            <p className="login-toggle">
              Need an account? 
              <span onClick={() => setCurrentState("Sign Up")}> Click here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default Login