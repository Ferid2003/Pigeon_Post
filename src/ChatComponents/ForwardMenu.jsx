import close from "../assets/close.svg";
import Loading from "../Animation/Loading.jsx";
import React, {useState} from "react";
import {useAuth} from "../Authentication/AuthContext.jsx";
import {forwardMessage} from "../FirebaseLogic/MessageFunctions.js";


function ForwardMenu({message,setForwardMenu,sortedChatData,friends,picturesCache,friendProfiles}){

    const {userData} = useAuth()
    const [selectedUsers,setSelectedUsers] = useState([])


    const renderChats =  sortedChatData.map(data => {
            const [checked,setChecked] = useState(false)
            const isGroup = Object.hasOwn(data, 'Group_ID')
            const us = !isGroup ? data.User1_UID === userData.uid ? friendProfiles.find(user => user.UID === data.User2_UID) : friendProfiles.find(user => user.UID === data.User1_UID) : null
            const friendUID = !isGroup ? userData.uid === data.User1_UID ? data.User2_UID : data.User1_UID : null;
            const friend = !isGroup ? friends.find(user => user.UID === friendUID) : null; // Find friend info
            return (
                <div  key={isGroup ? data.Group_ID : data.Conversation_ID} style={{display:"flex", flexDirection:"column",textAlign:"left",marginBottom:"31px", gap:"16px"}}>
                    <div style={{border:"4px solid #00214D",backgroundColor:checked ? "#00ebc7" : null,boxShadow:checked ? "5px 5px #00214D" :null}} onClick={() => {
                        !checked ? setSelectedUsers(prevState => [...prevState,isGroup ? data.Group_ID : data.Conversation_ID]) : setSelectedUsers(prevState => prevState.filter(val => val !== (isGroup ? data.Group_ID : data.Conversation_ID)));
                        setChecked(prevState => !prevState)
                    }} className="chat" >
                        <div style={{display:"flex",flexDirection:"row",gap:"5px",alignItems:"center"}}>
                            <input type="checkbox" checked={checked} />
                            <img style={{clipPath:(isGroup ? picturesCache[data.Group_ID]!=="group_default" : us.Picture!=="default") ? "circle()" : null}} className="chat-image" alt="Group Picture" src={isGroup ? picturesCache[data.Group_ID] : (us.Picture==="default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7" : us.Picture)}/>
                            <div style={{display:"flex",flexDirection:"column",textAlign:"left",gap:"5x"}}>
                                <span style={{fontWeight:"700"}}>{isGroup ? data.Group_name : (friend ? friend.Username : "Error")}</span>
                                <span style={{whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{isGroup ? data.Group_description : us.Description}</span>
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
                            setForwardMenu(false)
                        }} className="x-button" src={close} alt="close window"/>
                        <h1>Forward Message</h1>
                        <div style={{padding:"20px", overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:"#FDE24F #00214D"}}>
                            {sortedChatData ? renderChats : <Loading/>}
                        </div>
                    </div>
                    {selectedUsers.length>0 ? <button className="forward-button" onClick={async () => {
                        await forwardMessage({message:message.message,...(message.ContactUID && { ContactUID: message.ContactUID }),type:message.type,...(message.fileName && { fileName: message.fileName })},selectedUsers,sortedChatData,userData)
                        setSelectedUsers([])
                        setForwardMenu(false)
                    }}>Send</button> : null}
                </div>
            </div>
        </div>
    )
}

export default ForwardMenu