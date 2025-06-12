import {useAuth} from "../Authentication/AuthContext.jsx";
import {useState} from "react";
import {searchByName, sendFriendRequest} from "../FirebaseLogic/UserFunctions.js";
import close from "../assets/close.svg";


function UserSearch({setSearchUsers}){
    const {userData} = useAuth()
    const [searchedName, setSearchedName] = useState("")
    const [result,setResult] = useState([])


    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            setResult(await searchByName(searchedName,userData.uid))
        }
    }




    let renderResults =result.map(info => {
        return (
            <div className="user-search-result" key={info.uid}>
                <h1>{info.username}</h1>
                <button id={info.uid} onClick={(e) => sendRequest(info.uid)}>Send Friend Request</button>
            </div>
        )
    })


    const sendRequest = async (id) => {
        await sendFriendRequest(userData.uid,id)
        setResult([])
        setSearchedName("")
    }




    return (
            <div style={{position:"absolute",left:"0",top:"0",zIndex:"14",display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%"}}>
                <div className="user-search-holder">
                    <img className="user-search-close-img" onClick={() => setSearchUsers(false)}  src={close} alt="close window"/>
                    <h1>Search Friend</h1>
                    <input onKeyPress={(e) => handleKeyDown(e)} onChange={(e) => setSearchedName(e.target.value)} className="search-input"  placeholder="Search"/>
                    <div style={{display:"grid",gridColumn:"3"}}>
                        {renderResults}
                    </div>
                </div>
            </div>
    )
}

export default UserSearch