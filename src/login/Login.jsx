import React, {Suspense, useState} from 'react'
import {useAuth} from "../Authentication/AuthContext.jsx";
import '../Css/App.css'
import {useNavigate} from "react-router";
import "../Css/style.css"
import Loading from "../Animation/Loading.jsx";
const Gradient = React.lazy(() => import("../Gradient/gradient.jsx"))


function Login() {

    const {login,logOut,resetPassword,sendVerificationEmail} = useAuth()
    const [mail, setMail] = useState("")
    const [password, setPassword] = useState("")
    const nav = useNavigate();

    const  toggleView = (view) => {
        const loginForm = document.getElementById("login");
        const registerForm = document.getElementById("register");
        const resetPasswordForm = document.getElementById("resetPassword");
        const loginButton = document.getElementById("loginButton");
        const registerButton = document.getElementById("registerButton");
        const resetPasswordButton = document.getElementById("resetPasswordButton");

        if (view==="Login") {
            loginForm.style.left = "4px";
            loginForm.style.opacity = 1;
            registerForm.style.right = "-520px";
            registerForm.style.opacity = 0;
            resetPasswordForm.style.right = "528px";
            resetPasswordForm.style.opacity = 0;


            loginButton.classList.add("main-button");
            registerButton.classList.remove("main-button");
            resetPasswordButton.classList.remove("main-button");
        } else if (view==="Register") {

            loginForm.style.left = "-510px";
            loginForm.style.opacity = 0;
            registerForm.style.right = "5px";
            registerForm.style.opacity = 1;
            resetPasswordForm.style.right = "1015px";
            resetPasswordForm.style.opacity = 0;


            registerButton.classList.add("main-button");
            loginButton.classList.remove("main-button");
            resetPasswordButton.classList.remove("main-button");
        } else {
            loginForm.style.left = "-520px";
            loginForm.style.opacity = 0;
            registerForm.style.opacity = 0;
            registerForm.style.right = "-1045px";
            resetPasswordForm.style.right = "4px";
            resetPasswordForm.style.opacity = 1;

            resetPasswordButton.classList.add("main-button");
            registerButton.classList.remove("main-button");
            loginButton.classList.remove("main-button");
        }
    }


    function handleInputChange(e){
        e.target.name==="mail" ? setMail(e.target.value) : setPassword(e.target.value)
    }

    const openTerms = () => {
        document.getElementById("termsId").style.display = "block";
    }

    const closeTerms = () => {
        document.getElementById("termsId").style.display = "none";
    }
    const handleLogin = async (e) => {
        e.preventDefault()
        if (password==="" || mail===""){
            window.alert("Please enter your password or mail!")
        } else {
            await logOut()
            try {
                await login(mail, password)
                nav("/chat")
            }catch {
                window.alert("Password or Username is incorrect!")
            }
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (mail===""){
            window.alert("Please enter your email address!")
        }else{
            try{
                const actionCodeSettings = {
                    url: 'https://pigeonpost.netlify.app/finish_sign_up',
                    handleCodeInApp: true,
                };
                await sendVerificationEmail(mail, actionCodeSettings)
                window.localStorage.setItem('emailForSignIn', mail);
                alert('A verification link has been sent to your email address.');
                toggleView("Login");
            }catch (e){
                console.log("Error while registering user :"+e)
            }
        }
    }

    const handlePasswordReset = async (e) => {
        e.preventDefault()
        if (mail !== "") {
            try {
                await resetPassword(mail)
                    .then(() => {
                        window.alert("Password reset link has been sent to your email address!")
                        toggleView("Login");
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(errorCode + ":" + errorMessage);
                    });
            } catch (e) {

            }
        } else {
            window.alert("Please enter your email address!")
        }
    }


    const handleKeyDown = async (e,action) => {
        if (e.key === "Enter" && action === "Login") {
            await handleLogin(e)
        }else if(e.key === "Enter" && action === "Register") {
            await handleRegister(e)
        }else if(e.key === "Enter" && action === "ResetPassword") {
            await handlePasswordReset(e)
        }
    }

    return (
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
                    <div className="nav-button">
                        <button className="button-n main-button" id="loginButton" onClick={() => toggleView("Login")}>Sign In</button>
                        <button className="button-n" id="registerButton" onClick={() => toggleView("Register")}>Sign Up</button>
                    </div>
                </nav>

                <div className="form-box">
                    <div className="login-container" id="login">
                        <div className="log-register-text">
                            <span>Don't have an account? <a href="#" onClick={() => toggleView("Register")}>Sign Up</a></span>
                            <header>Login</header>
                        </div>
                        <div className="input-box">
                            <input onChange={(e) => handleInputChange(e)} name="mail" value={mail} id="username" className="input-field" placeholder="Email" />
                        </div>
                        <div className="input-box">
                            <input onKeyPress={(e) => handleKeyDown(e,"Login")} onChange={(e) => handleInputChange(e)} value={password} type="password" id="loginPassword" className="input-field" placeholder="Password" />
                        </div>
                        <div className="input-box">
                            <input onClick={(e) => handleLogin(e)} type="submit" className="submit" value="Sign In" />
                        </div>
                        <div className="term-cond">
                            <div className="tc">
                                <label><a href="#" onClick={() => openTerms()}>News & Updates</a></label>
                            </div>
                            <div className="tc">
                                <label><a href="#" id="resetPasswordButton" onClick={() => toggleView("ResetPassword")}>Forgot Password?</a></label>
                            </div>
                        </div>
                    </div>

                    <div className="register-container" id="register">
                        <div className="log-register-text">
                            <span>Have an account? <a href="#" onClick={() => toggleView("Login")}>Sign In</a></span>
                            <header>Register</header>
                        </div>
                        <div className="input-box">
                            <input onKeyPress={(e) => handleKeyDown(e,"Register")} onChange={(e) => handleInputChange(e)} name="mail" value={mail} id="email" className="input-field" placeholder="Email" />
                            <i className="bx bx-envelope"></i>
                        </div>
                        <div className="input-box" id="registerB">
                            <button  type="submit" className="submit" onClick={(e) => handleRegister(e)}>Sign Up</button>
                        </div>
                        <div className="term-cond">
                            <div className="tc">
                                <label><a href="#" onClick={() => openTerms()}>News & Updates</a></label>
                            </div>
                        </div>
                    </div>

                    <div className="register-container" id="resetPassword">
                        <div className="log-register-text">
                            <span>Have an account? <a href="#" onClick={() => toggleView("Login")}>Sign In</a></span>
                            <header>Reset Password</header>
                        </div>
                        <div className="input-box">
                            <input onKeyPress={(e) => handleKeyDown(e,"ResetPassword")} onChange={(e) => handleInputChange(e)} name="mail2" value={mail} id="email2" className="input-field" placeholder="Email" />
                            <i className="bx bx-envelope"></i>
                        </div>
                        <div className="input-box" id="registerB">
                            <button  type="submit" className="submit" onClick={(e) => handlePasswordReset(e)}>Get verification code</button>
                        </div>
                    </div>

                </div>
            </div>

            <div id="termsId" className="terms-condition">
                <div className="terms-content">
                    <span className="close" onClick={() => closeTerms()}>&times;</span>
                    <h2>News & Updates</h2>
                    <p> Please note </p>
                    <br />
                    <p>1. Pigeon Post is currently under development, if you encounter any bugs please report them to: feridagazade157@gmail.com (Gmail) / FeridA (PigeonPost)</p> <br />
                    <p>2. Do not share any personal details since Pigeon Post does not support encryption.</p><br/>
                    <p>3. Future updates will include: ability to change wallpaper, chat customization and different modes.</p><br/>
                    <p>4. Due to limited storage size, older media files might get deleted.</p><br/>
                    <p>5. For suggestions and questions fell free to contact: feridagazade157@gmail.com (Gmail) / FeridA (PigeonPost)</p><br/>
                </div>
            </div>
        </>
    )
}

export default Login
