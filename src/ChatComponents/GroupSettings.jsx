import {useState} from "react";
import {getGroupByID, updateGroupFields} from "../FirebaseLogic/GroupFunctions.js";

function GroupSettings({props}) {

    const [groupDescription,setGroupDescription] = useState("")
    const [groupName,setGroupName] = useState("")
    const [groupPicture,setGroupPicture] = useState("")

    const handleGroupUpdate = async () => {
        const group = await getGroupByID(props)
        const groupData = {
            Group_name: groupName !== "" ? groupName : group.Group_name,
            Group_description: groupDescription !== "" ? groupDescription : group.Group_description,
            Group_picture: groupPicture !== "" ? groupPicture : "group_default"
        }
        await updateGroupFields(props,groupData)
        setGroupPicture("")
        setGroupName("")
        setGroupDescription("")
    }

    function handleChange(e) {
        e.target.files[0].type.startsWith("image/") ? setGroupPicture(e.target.files[0]) : null
    }

    return(
        <div>
            <form action={handleGroupUpdate}>
                <label htmlFor="fname">Group Name</label><br/>
                <input type="text" value={groupName} onChange={(e) => {setGroupName(e.target.value)}} id="fname" name="fname"/><br/>
                <label htmlFor="lname">Group Description</label><br/>
                <input type="text" onChange={(e) => {setGroupDescription(e.target.value)}} value={groupDescription} id="lname" name="lname"/><br/>
                <h2>Add Image:</h2><br/>
                <input type="file" onChange={handleChange} /><br/>
                <button type="submit">Update Group</button>
            </form>
        </div>
    )

}

export default GroupSettings