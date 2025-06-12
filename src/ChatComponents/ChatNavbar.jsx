import threedots from "../assets/threedots.svg";
import {removeFriend} from "../FirebaseLogic/UserFunctions.js";
import React, {useState} from "react";
import {deleteGroup, leaveGroup} from "../FirebaseLogic/GroupFunctions.js";
import {useAuth} from "../Authentication/AuthContext.jsx";
import GroupAdminMenu from "./GroupAdminMenu.jsx";
import camera from "../assets/camera.svg";
import {handlePressAnimation} from "../Animation/Animations.js";

function ChatNavbar({selectedChatId,groupUsers,friends,setCall}){

    const [adminMenu,setAdminMenu] = useState(false)
    const [performFunction,setPerformFunction] = useState(null)




    const {userData} = useAuth()

    const isAdmin = selectedChatId.isGroup ? selectedChatId.groupAdmins.split(";").includes(userData.uid) : false


    return (
        <div className="chat-navbar-right-side">
            <img onClick={() => {
                setCall(true)
            }} style={{scale:"1.3",cursor:"pointer"}} src={camera} alt="camera"/>
            <div  onClick={() => selectedChatId.id!==userData.uid+userData.uid ? handlePressAnimation("dropdown-content") : null} className="dropdown">
                <img style={{display:"block",marginLeft:"auto",height: "31px", width: "31px",cursor:"pointer"}} src={threedots} alt="profile-option"/>
                {selectedChatId.isGroup ?
                    <div className="dropdown-content">
                        <a onClick={async () => {
                            await leaveGroup(userData.uid,selectedChatId.id)
                        }}>Leave Group</a>
                        {isAdmin ?
                            <div>
                                <a onClick={() => {
                                    setAdminMenu(true)
                                    setPerformFunction("Make Admin")
                                }}>Make User Admin</a>
                                <a onClick={() => {
                                    setAdminMenu(true)
                                    setPerformFunction("Add User")
                                }}>Add User</a>
                                <a onClick={() => {
                                    setAdminMenu(true)
                                    setPerformFunction("Group Settings")
                                }}>Group Settings</a>
                                <a onClick={() => {
                                    setAdminMenu(true)
                                    setPerformFunction("Remove User")
                                }}>Kick User</a>
                                <a onClick={() => deleteGroup(userData.uid,selectedChatId.id)}>Delete Group</a>
                            </div>: null }
                    </div> :
                    selectedChatId.id!==userData.uid+userData.uid ?
                    <div className="dropdown-content">
                        <a onClick={async () => {
                            await removeFriend(selectedChatId.friendName, userData.uid, selectedChatId.id)
                        }}>Remove Friend</a>
                    </div> : null}
            </div>
            {(adminMenu && performFunction) ? <GroupAdminMenu friends={friends} selectedChatId={selectedChatId} users={groupUsers} setAdminMenu={setAdminMenu} performFunction={performFunction} setPerformFunction={setPerformFunction} /> : null}
        </div>
    )

}

export default ChatNavbar