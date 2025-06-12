import React, {Suspense, useState} from "react";
import Loading from "../Animation/Loading.jsx";
import {useAuth} from "../Authentication/AuthContext.jsx";
import {useNavigate} from "react-router";
import Gradient from "../Gradient/gradient.jsx";
import {registerNewUser} from "../FirebaseLogic/UserFunctions.js";

function SingUpFinish(){

    const {logOut,verifyVerificationLink,signUpWithVerificationLink,renewPassword} = useAuth()
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const nav = useNavigate();

    function handleInputChange(e){
        e.target.name==="name" ? setName(e.target.value) : setPassword(e.target.value)
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (verifyVerificationLink(window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = prompt('Please provide your email for confirmation:');
            }
            if (email) {
                signUpWithVerificationLink(email, window.location.href)
                    .then(async (result) => {

                        if (result.user) {
                            try {
                                await registerNewUser(email, result.user, name);
                                await renewPassword(password);
                            } catch (regError) {
                                console.error("Error registering new user details:", regError);
                                await logOut()
                                nav("login")
                            }
                        }



                        // Clear the email from local storage.
                        window.localStorage.removeItem('emailForSignIn');

                        // Redirect the user to your main application dashboard or profile page.
                        // You can check if this was a new user signup vs. an existing user signing in
                        // using result.additionalUserInfo.isNewUser
                        if (result.additionalUserInfo?.isNewUser) {
                            alert("Welcome! Your account is now confirmed.");
                            nav("/chat")
                        } else {
                            nav("/chat")
                        }
                    })
                    .catch((error) => {
                        console.error("Error signing in with email link:", error);
                        alert(`Error completing signup: ${error.message}`);
                    });
            } else {
                alert("Email is required to complete signup.");
                nav("/login")
            }
        } else {
            console.log("This page was not loaded with an email sign-in link.");
        }

    }

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            await handleRegister(e)
        }
    }

    return(
        <>
            <Suspense fallback={<Loading />}>
                <Gradient style={
                    {
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100vh',
                        zIndex:-1
                    }
                } />
            </Suspense>
            <div className="wrapper">
                <nav className="nav">
                    <div className="nav-header">
                        <p>PIGEON POST</p>
                    </div>
                </nav>

                <div>
                    <div className="register-container" style={{position:"unset"}} id="register">
                        <div className="log-register-text">
                            <header>Register</header>
                        </div>
                        <div className="input-box">
                            <input onChange={(e) => handleInputChange(e)} name="name" value={name} id="fullName" className="input-field" placeholder="Full Name" />
                            <i className="bx bx-user"></i>
                        </div>
                        <div className="input-box">
                            <input onKeyPress={(e) => handleKeyDown(e)} onChange={(e) => handleInputChange(e)} value={password} type="password" id="registerPassword" className="input-field" placeholder="Password" />
                        </div>
                        <div className="input-box" id="registerB">
                            <button  type="submit" className="submit" onClick={(e) => handleRegister(e)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )

}

export default SingUpFinish;