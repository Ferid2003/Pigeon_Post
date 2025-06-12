import React, {useState} from "react";
import {useAuth} from "../Authentication/AuthContext.jsx";
import close from "../assets/close.svg";
import Loading from "../Animation/Loading.jsx";
import {sendContact} from "../FirebaseLogic/MessageFunctions.js";

function ContactSendMenu({friends,setContactSendMenu,selectedChatId}){

    const {userData} = useAuth()
    const [selectedUsers,setSelectedUsers] = useState([])


    const renderFriends = friends.map((friend) => {
        const [checked,setChecked] = useState(false)
        return (
            <div  key={friend.UID} style={{display:"flex", flexDirection:"column",textAlign:"left",marginBottom:"31px", gap:"16px"}}>
                <div style={{border:"4px solid #00214D",backgroundColor:checked ? "#00ebc7" : null,boxShadow:checked ? "5px 5px #00214D" :null}} onClick={() => {
                    !checked ? setSelectedUsers(prevState => [...prevState,{Username:friend.Username,UID:friend.UID}]) : setSelectedUsers(prevState => prevState.filter(val => val.UID !== (friend.UID)));
                    setChecked(prevState => !prevState)
                }} className="chat" >
                    <div style={{display:"flex",flexDirection:"row",gap:"5px",alignItems:"center"}}>
                        <input type="checkbox" checked={checked} />
                        <img className="chat-image" alt="Group Picture" src={(friend.Picture==="default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7" : friend.Picture)}/>
                        <div style={{display:"flex",flexDirection:"column",textAlign:"left",gap:"5x"}}>
                            <span style={{fontWeight:"700"}}>{friend.Username}</span>
                            <span style={{whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{friend.Description}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    })

    return (
        <div>
            <div style={{position:"absolute",left:"0",top:"0",zIndex:"13",display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%"}}>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between"}} className="user-search-holder">
                    <div>
                        <img onClick={() => {
                            setSelectedUsers([])
                            setContactSendMenu(false)
                        }} className="x-button" src={close} alt="close window"/>
                        <h1>Send Contacts</h1>
                        <div style={{padding:"20px", overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:"#FDE24F #00214D"}}>
                            {friends ? renderFriends : <Loading/>}
                        </div>
                    </div>
                    {selectedUsers.length>0 ? <button className="forward-button" onClick={async () => {
                        await sendContact(selectedUsers,selectedChatId,userData)
                        setSelectedUsers([])
                        setContactSendMenu(false)
                    }}>Send</button> : null}
                </div>
            </div>
        </div>
    )
}

export default ContactSendMenu