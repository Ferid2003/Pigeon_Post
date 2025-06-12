import {useAuth} from "../Authentication/AuthContext.jsx";
import {useState} from "react";
import {updateUserProfile} from "../FirebaseLogic/UserFunctions.js";
import upload from "../assets/upload.svg";

function UserSettings()  {

    const {userData} = useAuth()

    const [loader,setLoader] = useState(false)

    const [description,setDescription] = useState("")
    const [picture,setPicture] = useState(null)
    const [username,setUsername] = useState("")

    const handlePictureSelect = (e) => {
        const files = e.target.files

        if (files && files.length > 0) {
            setPicture(files[0])
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoader(prevState => !prevState)
        await updateUserProfile(userData.uid,{
            Picture:picture,
            Username:username,
            Description:description
        })
        setLoader(prevState => !prevState)
        setDescription("")
        setPicture(null)
        setUsername("")
    }



    return(
        <div style={{height:"100vh",width:"100vw"}}>
            {loader ? <div className="loader-holder">
                <span className="loader"></span>
            </div> :
            <form autoComplete="off" style={{gap:"calc(var(--index)*0.3)"}} className="user-settings-holder" onSubmit={handleUpdate}>
                <div className="user-settings-picture-input-holder">
                    <h3>Click box to upload</h3>
                    <img src={upload} alt="upload"/>
                    <input onChange={handlePictureSelect} accept="image/*" type="file"  className="user-settings-picture-input"/>
                </div>
                <label className="user-settings-picture">Profile Picture</label><br/>
                <label className="user-settings-username" htmlFor="fname">Username:</label>
                <input placeholder="Enter Username" type="text" value={username} onChange={(e) => {setUsername(e.target.value)}} id="fname" name="fname"/><br/>
                <label className="user-settings-description" htmlFor="lname">Description:</label>
                <input placeholder="Enter Description"  type="text" onChange={(e) => {setDescription(e.target.value)}} value={description} id="lname" name="lname"/>
                <button type="submit" className="user-settings-submit">Commit Changes</button>
            </form>}
        </div>
    )

}

export default UserSettings