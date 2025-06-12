import React, {useState} from "react";

function UserSelectComponent({users,groupUsers = [],setSelectedUsers,userData}) {


    return (
        users
            .filter(user => !groupUsers.length || !groupUsers.some(u => u.UID === user.UID))
            .map(user => {
            if (user.UID === userData.uid) return null
            const [checked,setChecked] = useState(false)
            return (
                <div  key={user.UID} style={{display:"flex", flexDirection:"column",textAlign:"left",marginBottom:"31px", gap:"16px"}}>
                    <div style={{border:"4px solid #00214D",backgroundColor:checked ? "#00ebc7" : null,boxShadow:checked ? "5px 5px #00214D" :null}} onClick={() => {
                        !checked ? setSelectedUsers(prevState => [...prevState,user.UID]) : setSelectedUsers(prevState => prevState.filter(val => val !== (user.UID)));
                        setChecked(prevState => !prevState)
                    }} className="chat_without_space" >
                        <input type="checkbox" checked={checked} />
                        <img style={{clipPath:user.Picture!=="default" ? "circle()" : null}} className="chat-image" alt="Group Picture" src={user.Picture==="default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7" : user.Picture}/>
                        <div style={{display:"flex",flexDirection:"column",textAlign:"left",gap:"5x"}}>
                            <span style={{fontWeight:"700"}}>{user.Username}</span>
                            <span style={{whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{user.Description}</span>
                        </div>
                    </div>
                </div>
            )
        })
    )
}

export default UserSelectComponent