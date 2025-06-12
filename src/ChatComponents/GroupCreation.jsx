import upload from "../assets/upload.svg";
import {useState} from "react";
import close from "../assets/close.svg";
import Loading from "../Animation/Loading.jsx";
import {createGroup} from "../FirebaseLogic/GroupFunctions.js";
import {useAuth} from "../Authentication/AuthContext.jsx";
import UserSelectComponent from "./UserSelectComponent.jsx";

function GroupCreation({friends,setGroup}){


    const {userData} = useAuth()
    const [picture,setPicture] = useState(null)
    const [groupName,setGroupName] = useState("")
    const [groupDescription,setGroupDescription] = useState("")
    const [userSelectScreen,setUserSelectScreen] = useState(false)
    const [selectedUsers,setSelectedUsers] = useState([])



    let renderFriends = friends ? <UserSelectComponent users={friends} setSelectedUsers={setSelectedUsers} userData={userData}/>  : null

    return (
        <div style={{position:"absolute",left:"0",top:"0",zIndex:"14",display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%"}}>
            <form autoComplete="off" className="user-settings-holder">
                <img onClick={() => setGroup(false)} style={{scale:"2.3",cursor:"pointer",position:"absolute",right:"10%",top:"8%"}} src={close} alt="close window"/>
                <div className="user-settings-picture-input-holder">
                    <h3>Click box to upload</h3>
                    <img src={upload} alt="upload"/>
                    <input onChange={(e) => {(e.target.files && e.target.files.length >0) ? setPicture(e.target.files[0]) : null}} accept="image/*" type="file"  className="user-settings-picture-input"/>
                </div>
                <label className="group-settings-picture">Group Picture</label><br/>
                <label className="group-settings-name" htmlFor="fname">Group Name:</label>
                <input placeholder="Enter Group Name" type="text" value={groupName} onChange={(e) => {setGroupName(e.target.value)}} id="fname" name="fname"/><br/>
                <label className="group-settings-description" htmlFor="lname">Description:</label>
                <input placeholder="Enter Group Description"  type="text" onChange={(e) => {setGroupDescription(e.target.value)}} value={groupDescription} id="lname" name="lname"/>
                <button type="button" onClick={(e) => {
                    e.preventDefault()
                    setUserSelectScreen(true)
                }}>Next</button>
            </form>
            {userSelectScreen ?
                <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",zIndex:"14",overflowY:"auto",scrollbarWidth:"none"}} className="user-search-holder">
                    <div>
                        <img onClick={() => setUserSelectScreen(false)} style={{scale:"2.3",cursor:"pointer",position:"absolute",right:"32%",top:"18%"}} src={close} alt="close window"/>
                        <h1>Add Friend to Group</h1>
                        <div style={{padding:"20px", overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:"#FDE24F #00214D"}}>
                            {friends ? renderFriends : <Loading/>}
                        </div>
                    </div>
                    <button type="submit"  className="group-settings-submit" onClick={async () => {
                        await createGroup(groupName,groupDescription,picture,userData,selectedUsers)
                        setUserSelectScreen(false)
                        setGroup(false)
                    }}>Create Group</button>
                </div>
                : null }
        </div>
    )
}

export default GroupCreation