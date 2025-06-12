import close from "../assets/close.svg";
import {useEffect, useState} from "react";
import {acceptFriendRequest, denyFriendRequest, showFriendRequests} from "../FirebaseLogic/UserFunctions.js";
import {useAuth} from "../Authentication/AuthContext.jsx"
import Loading from "../Animation/Loading.jsx";

function Inbox({setInbox}) {


    const {userData} = useAuth()
    const [friendRequests,setFriendRequests] = useState(null)

    useEffect(() => {
        const fetchRequests = async () => {
            const data = await showFriendRequests(userData.uid)
            setFriendRequests(data)
        };


        fetchRequests();
    }, [userData]);



    const handleAcceptRequest = async (e,info) => {
        e.preventDefault()
        await acceptFriendRequest(info.UID, userData.uid)
        const arr = [...friendRequests]
        const index = arr.indexOf(info);
        if (index > -1) {
            arr.splice(index, 1);
            setFriendRequests(arr)
        }
    }

    const handleDenyRequest = async (info) => {
        await denyFriendRequest(info.UID,userData.uid)
        const arr = [...friendRequests]
        const index = arr.indexOf(info);
        if (index > -1) {
            arr.splice(index, 1);
            setFriendRequests(arr)
        }
    }


    let renderRequests = friendRequests ?  friendRequests.map(info => {
        return (
            <div style={{padding:"20px",backgroundColor:"#FDE24F",border:"1px solid #00214D",boxShadow:"8px 8px #00214D",borderRadius:"5px"}}  key={info.UID}>
                <h1>{info.Username}</h1>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <button style={{color:"#00214D",backgroundColor:"#00ebc7",border:"1px solid #00214D",boxShadow:"4px 4px #00214D"}} id={info.UID} onClick={(e) => handleAcceptRequest(e,info)}>Accept</button>
                    <button style={{color:"#00214D",backgroundColor:"#00ebc7",border:"1px solid #00214D",boxShadow:"4px 4px #00214D"}} id={info.UID} onClick={() => handleDenyRequest(info)}>Deny</button>
                </div>
            </div>
        )
    }) : null




    return (
        <div style={{position:"absolute",left:"0",top:"0",zIndex:"14",display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%",overflowY:"auto",scrollbarWidth:"none"}}>
            <div className="user-search-holder">
                <img className="x-button" onClick={() => setInbox(false)} src={close} alt="close window"/>
                <h1>Inbox</h1>
                <div style={{display:"grid",gridColumn:"3",gridTemplateRows:"repeat(3, 100%)",gridTemplateColumns:"repeat(3, 1fr)"}}>
                    {friendRequests ? renderRequests : <Loading/>}
                </div>
            </div>
        </div>
    )
}


export default Inbox