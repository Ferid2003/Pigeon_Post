import close from "../assets/close.svg";
import Loading from "../Animation/Loading.jsx";
import React, {useState} from "react";
import {addUserToGroup, makeUsersAdmin, removeUserFromGroup, updateGroupFields} from "../FirebaseLogic/GroupFunctions.js";
import {useAuth} from "../Authentication/AuthContext.jsx";
import upload from "../assets/upload.svg";
import UserSelectComponent from "./UserSelectComponent.jsx";

function GroupAdminMenu({friends,selectedChatId,users,setAdminMenu,performFunction,setPerformFunction}) {

    const [picture, setPicture] = useState(null)
    const [groupName, setGroupName] = useState("")
    const [groupDescription, setGroupDescription] = useState("")

    const {userData} = useAuth()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [loading,setLoading] = useState(false)
    const [groupSettings, setGroupSettings] = useState(performFunction === "Group Settings")

    let renderUsers = performFunction !== "Add User" ? users ? <UserSelectComponent users={users}  setSelectedUsers={setSelectedUsers} userData={userData} /> : null :
        friends ? <UserSelectComponent users={friends} groupUsers={users} setSelectedUsers={setSelectedUsers} userData={userData} /> : null

    return (
        <div>
            {loading ? <div style={{
                position: "absolute",
                left: "0",
                top: "0",
                zIndex: "13",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%"
                }}> <Loading /> </div> :
                <div>
                    {groupSettings ?
                        <div style={{
                            position: "absolute",
                            left: "0",
                            top: "0",
                            zIndex: "13",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            width: "100%"
                        }}>
                            <form autoComplete="off" className="user-settings-holder">
                                <img onClick={() => setAdminMenu(false)}
                                     style={{cursor: "pointer",scale:"2.3",position:"absolute",right:"8%",top:"4%"}}
                                     src={close} alt="close window"/>
                                <div className="user-settings-picture-input-holder">
                                    <h3>Click box to upload</h3>
                                    <img src={upload} alt="upload"/>
                                    <input onChange={(e) => {
                                        (e.target.files && e.target.files.length > 0) ? setPicture(e.target.files[0]) : null
                                    }} accept="image/*" type="file" className="user-settings-picture-input"/>
                                </div>
                                <label className="group-settings-picture">Group Picture</label><br/>
                                <label className="group-settings-name" htmlFor="fname">Group Name:</label>
                                <input placeholder="Enter Group Name" type="text" value={groupName} onChange={(e) => {
                                    setGroupName(e.target.value)
                                }} id="fname" name="fname"/><br/>
                                <label className="group-settings-description" htmlFor="lname">Description:</label>
                                <input placeholder="Enter Group Description" type="text" onChange={(e) => {
                                    setGroupDescription(e.target.value)
                                }} value={groupDescription} id="lname" name="lname"/>
                                <button type="button" onClick={async (e) => {
                                    e.preventDefault()
                                    setLoading(true)
                                    const groupData = {
                                        Group_name: groupName !== "" ? groupName : selectedChatId.groupName,
                                        Group_description: groupDescription !== "" ? groupDescription : selectedChatId.groupDescription,
                                        Group_picture: picture ? picture : "group_default"
                                    }
                                    await updateGroupFields(selectedChatId.id, groupData)
                                    setLoading(false)
                                    setSelectedUsers([])
                                    setPerformFunction(null)
                                    setAdminMenu(false)
                                    window.location.reload()
                                }}>Update Group
                                </button>
                            </form>
                        </div> :
                        <div>
                            <div style={{
                                position: "absolute",
                                left: "0",
                                top: "0",
                                zIndex: "13",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                width: "100%"
                            }}>
                                <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}
                                     className="user-search-holder">
                                    <div style={{position:"relative"}}>
                                        <img onClick={() => {
                                            setSelectedUsers([])
                                            setPerformFunction(null)
                                            setAdminMenu(false)
                                        }} style={{cursor: "pointer",scale:"2.3",position:"absolute",right:"5%",top:"4%"}} src={close} alt="close window"/>
                                        <h1>{performFunction}</h1>
                                        <div style={{
                                            padding: "20px",
                                            overflowY: "auto",
                                            scrollbarWidth: "thin",
                                            scrollbarColor: "#FDE24F #00214D"
                                        }}>
                                            {users ? renderUsers : <Loading/>}
                                        </div>
                                    </div>
                                    {selectedUsers.length > 0 ? <button className="forward-button" onClick={async () => {
                                        if (performFunction === "Add User") {
                                            await addUserToGroup(selectedChatId.id, selectedUsers)
                                        } else if (performFunction === "Remove User") {
                                            await removeUserFromGroup(selectedChatId.id, selectedUsers)
                                        } else if (performFunction === "Group Settings") {
                                            //await updateGroupFields(chatId)
                                        } else {
                                            await makeUsersAdmin(selectedChatId.id, selectedUsers)
                                        }
                                        setSelectedUsers([])
                                        setPerformFunction(null)
                                        setAdminMenu(false)
                                    }}>{performFunction}</button> : null}
                                </div>
                            </div>
                        </div>
                    }
                </div>}
        </div>

    )
}

export default GroupAdminMenu