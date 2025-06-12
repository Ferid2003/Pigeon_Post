import setting from "../assets/setting.svg";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import {useNavigate} from "react-router";
import ChatProfile from "./ChatProfile.jsx";
import React, {useEffect, useRef, useState} from "react";
import arrowdown from "../assets/arrowdown.svg";
import logout from "../assets/logout.svg";
import {useAuth} from "../Authentication/AuthContext.jsx";
import {handlePressAnimation} from "../Animation/Animations.js";





function Navbar({userProfile}){


    const {logOut} = useAuth()
    const [settingClicked,setSettingClicked] = useState(false)
    const { contextSafe } = useGSAP();
    const menuRef = useRef(null);

    const navigate = useNavigate()

    useEffect(() => {


        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setSettingClicked(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [settingClicked]);


    gsap.registerPlugin(Flip)

    const handleClick = contextSafe((className) => {
        const square = document.querySelector(".good");
        const HTMLelement = document.querySelector(`.${className}`);
        const state = Flip.getState(square);
        if (square.classList.length===1){
            gsap.to(HTMLelement, {
                duration:0.7,
                autoAlpha:1,
                zIndex:13,
                ease:"expo.in"
            })
        }else {
            gsap.to(HTMLelement, {
                duration:0.7,
                autoAlpha:0,
                ease:"expo.out"
            })
        }
        square.classList.toggle("good-full")
        Flip.from(state,{
            duration:0.8,
            ease: "slow(0.1,0.1,false)",
            absolute: true,
        });

    })


    return (
        <div>
            <div  style={{width:"100vw",height:"80px", backgroundColor:"#FDE24F",borderTopLeftRadius:"25px",borderTopRightRadius:"25px",padding:"29px",font:"zilla-slab-bold",display:"flex", alignItems:"center" ,justifyContent:"space-between", border:"4px solid #00214D",position:"relative"}}>
                <span className="zilla-slab-bold">Messages</span>
                <div className="zilla-slab-semibold" style={{display:"flex", alignItems:"center",gap:"16px"}}>
                    <span>{userProfile.Username}</span>
                    <img onClick={() => handleClick("profile")} className="good" id="good"  src={userProfile.Picture==="default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7" : userProfile.Picture} alt="profile-picture"/>
                    <img onClick={() => setSettingClicked(true)} style={{height:"12px",cursor:"pointer"}} src={arrowdown} alt="arrow"/>
                    {settingClicked ? <label ref={menuRef} className="file-menu-button" style={{ cursor: "pointer", alignItems: "center",padding:"1vh",position:"absolute",right:"2%",top:"72%",border:"4px solid #00214D",backgroundColor:"#FDE24F",zIndex:"13",display:"flex",flexDirection:"column",gap:"1vh" }}>
                        <div onClick={() => {
                            setSettingClicked(false)
                            navigate("/settings")
                        }} style={{display:"flex",gap:"1vw",width:"100%",alignItems:"center",justifyContent:"space-between" }}>
                            <img style={{height:"12px",cursor:"pointer",scale:"2"}} src={setting} alt="setting" />
                            <span>Profile</span>
                        </div>
                        <div onClick={() => {
                            setSettingClicked(false)
                            logOut()
                        }} style={{display:"flex",gap:"1vw",width:"100%",alignItems:"center",justifyContent:"space-between"}}>
                            <img style={{height:"12px",cursor:"pointer",scale:"2"}} src={logout} alt="logout" />
                            <span>Log out</span>
                        </div>
                    </label> : null}
                </div>
            </div>
            <ChatProfile handleClick={() => handleClick("profile")} data={userProfile} className="profile"/>
        </div>
    )

}

export default Navbar