import arrowdown from "../assets/arrowdown.svg";
import React, {useState} from "react";
import Gradient from "../Gradient/gradient.jsx";
import {useAuth} from "../Authentication/AuthContext.jsx";
import {sendFriendRequest} from "../FirebaseLogic/UserFunctions.js";
import close from "../assets/close.svg";


function ConversationInfo({conversationUser,isGroup,sortedChatData,handleChatClick,narrowScreen,setChatInfo}) {

    const {userData} = useAuth()
    const [friendRequestButton,setFriendRequestButton] = useState(false);

    const handleConversationInfoUserClick = async (user) => {
        if (user.UID === userData.uid) return null
        const present = sortedChatData.find(chat => (chat.User2_UID === user.UID && chat.User1_UID === userData.uid) || (chat.User1_UID === user.UID && chat.User2_UID === userData.uid))
        if (present) {
            await handleChatClick(false,present)
        } else {
            setFriendRequestButton(prevState => prevState === user.UID ? "" : user.UID)
        }
    }


    const renderGroupUsers = isGroup.isGroup ?  conversationUser.map(user => {
        return (
            <div key={user.UID}>
                <div onClick={() => {
                    setChatInfo(false)
                    handleConversationInfoUserClick(user)
                }} key={user.UID} className="chat_without_space" style={{backgroundColor:"#00ebc7",border:"4px solid #00214D",boxShadow:"5px 5px #00214D",width:"100%"}}>
                    <img style={{clipPath:(user && user.Picture!=="default") ? "circle()" : null}} className="chat-image" alt="Group Picture" src={user && user.Picture!=="default" ? user.Picture : "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7"}/>
                    <div style={{display:"flex",flexDirection:"column",textAlign:"left",gap:"5x"}}>
                        <span style={{fontWeight:"700"}}>{user ? user.Username : "Group name"}</span>
                        <span style={{whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{user.Description}</span>
                    </div>
                </div>
                {friendRequestButton===user.UID && <button onClick={() => sendFriendRequest(userData.uid,user.UID)} style={{height:"5vh",fontSize:"12px",width:"100%",marginTop:"1vh"}}>Send Friend Request</button>}
            </div>
        )
    }) : null


    return (
        <div className={narrowScreen ? "chat-info-holder-narrow" : "chat-info-holder"}>
            {!narrowScreen && <Gradient style={
                {
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '15%',
                    height: '100vh',
                    zIndex:-1
                }
            } />}
            <div className={!narrowScreen ? "chat-info" : "chat-info-narrow"}>
                {narrowScreen && <img style={{position:"absolute",right:"4%",top:"4%",scale:"2.3",cursor:"pointer"}} onClick={() => setChatInfo(false)}  src={close} alt="close window"/>}
                {isGroup.isGroup ?
                        <div key={isGroup.Group_ID} style={{display: "flex", flexDirection: "column", textAlign: "left", gap: "8px"}}>
                            <span style={{fontWeight: "700"}}>Group Name</span>
                            <span>{isGroup.groupName}</span>
                            <div style={{marginBottom:"10px"}} className="seperator"/>
                            {renderGroupUsers}
                        </div>
                     :
                    <div key={isGroup.Conversation_ID} style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <img className="big-chat-image" src={conversationUser && conversationUser.Picture!=="default" ? conversationUser.Picture : "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7"} alt="chat picture"/>
                        <span style={{fontWeight: "700", fontSize: "20px"}}>{conversationUser ? conversationUser.Username : "Username"}</span>
                    </div>}
                <div style={{display: "flex", flexDirection: "column", textAlign: "left", gap: "8px"}}>
                    <span style={{fontWeight: "700"}}>Description</span>
                    <span>{!isGroup.isGroup ? conversationUser.Description : isGroup.groupDescription}</span>
                    <div className="seperator"/>
                </div>
                {/*{!narrowScreen && <div style={{display: "flex", flexDirection: "column", textAlign: "left", gap: "8px"}}>*/}
                {/*    <div style={{display: "flex", justifyContent: "space-between", cursor: "pointer"}}>*/}
                {/*        <span style={{fontWeight: "700"}}>Chat Settings</span>*/}
                {/*        <img src={arrowdown} alt="arrow"/>*/}
                {/*    </div>*/}
                {/*    <div style={{display: "flex", justifyContent: "space-between", cursor: "pointer"}}>*/}
                {/*        <span style={{fontWeight: "700"}}>File, Attachments</span>*/}
                {/*        <img src={arrowdown} alt="arrow"/>*/}
                {/*    </div>*/}
                {/*    <div style={{display: "flex", justifyContent: "space-between", cursor: "pointer"}}>*/}
                {/*        <span style={{fontWeight: "700"}}>Image, Video</span>*/}
                {/*        <img src={arrowdown} alt="arrow"/>*/}
                {/*    </div>*/}
                {/*</div>}*/}
            </div>
        </div>
    )
}

export default ConversationInfo