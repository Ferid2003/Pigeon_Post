import forward from "../assets/forward.svg";
import arrowdown from "../assets/arrowdown.svg";
import React, {useRef, useState} from "react";
import {useAuth} from "../Authentication/AuthContext.jsx";
import camera from "../assets/camera.svg";
import {deleteMessage} from "../FirebaseLogic/MessageFunctions.js";
import {sendFriendRequest} from "../FirebaseLogic/UserFunctions.js";
function Messages({messages,selectedChatId,setFileMenu,groupUsers,setForwardMessage,setForwardMenu,picturesCache}) {

    const {userData} = useAuth()
    const [activeMessageId, setActiveMessageId] = useState(null);
    const prevMessageRef = useRef(null);


    const handleDownload = async (imageUrl) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.setAttribute("download", "downloaded-image.jpg"); // Ensures download attribute is set
        link.setAttribute("target", "_blank"); // Opens in a new tab
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    };

   return (
       messages.map((message,i) => {
           const samePreviousMessageSender = prevMessageRef.current ? prevMessageRef.current.sender_UID === message.sender_UID : false
           const lastMessage = (messages[i+1]!==-1 && messages[i+1]!==undefined && messages[i+1]!==null && i!==0)  ? prevMessageRef.current.sender_UID !== messages[i+1].sender_UID : false
           let messagePosition = null;
           if (samePreviousMessageSender && !lastMessage) {
               messagePosition = "middle"
           }else if (samePreviousMessageSender && lastMessage) {
               messagePosition = "last"
           }else {
               messagePosition = "first"
           }
           prevMessageRef.current = message
           const isActionMenuOpen = activeMessageId === message.id;
           const isMe = message.sender_UID===userData.uid
           const user = selectedChatId.isGroup ? groupUsers.find(el => el.UID === message.sender_UID) : null
           const messageTime = new Date(message.time)
           const type = message.message_type
           return (
               <div key={message.id}>
                   <div  onMouseOver={() =>  {
                       document.getElementById(`message${message.id}`).style.visibility = "visible"
                   }} onMouseLeave={() => {
                       document.getElementById(`message${message.id}`).style.visibility = "hidden"
                   }} className={isMe ? "my-message" : "other-message"} >
                       {isMe && (
                           <img onClick={async () => {
                               setFileMenu(false)
                               setForwardMessage({message:message.message,type:message.message_type,...(message.fileName && { fileName: message.fileName }),...(message.nonce && { nonce: message.nonce }),...(message.ContactUID && { ContactUID: message.ContactUID })})
                               setForwardMenu(true)
                           }} id={`message${message.id}`} style={{height:"16px",cursor:"pointer",visibility:"hidden",transform:"rotateY(180deg)"}} src={forward} alt="arrow"/>
                       )}

                       {(isMe || !selectedChatId.isGroup) ? null : messagePosition!=="first" ? <span style={{height: "50px", width: "50px"}}/> : <img src={user?.Picture==="default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7" : user?.Picture}  alt="Group Picture" style={{height: "50px", width: "50px",clipPath:"circle()"}}/>}
                       <div onMouseOver={() =>  {
                           document.getElementById(`arrow${message.id}`).style.visibility = "visible"
                       }} onMouseLeave={() => {
                           document.getElementById(`arrow${message.id}`).style.visibility = "hidden"
                       }} id={message.id}  className="message" style={!isMe ? messagePosition==="last" ? {backgroundColor:"#00ebc7",justifyContent:"flexStart",borderRadius:"0 14px 14px 14px"} : messagePosition==="middle" ? {backgroundColor:"#00ebc7",justifyContent:"flexStart",borderRadius:"14px"} : {backgroundColor:"#00ebc7",justifyContent:"flexStart",borderRadius:"14px 14px 14px 0"} : messagePosition==="last" ? {borderRadius:"14px 0 14px 14px"} : messagePosition==="middle" ? {borderRadius:"14px"} : {borderRadius:"14px 14px 0 14px"}  }>
                           <div style={{display:"flex",justifyContent:"space-between", alignItems:'center'}}>
                               {(selectedChatId.isGroup && !isMe && !samePreviousMessageSender) ? <span style={{fontSize:"18px",fontWeight:"800",color:"#ff5470"}}>{user?.Username}</span> : <span></span>}
                               <img onClick={() => {
                                   setActiveMessageId(isActionMenuOpen ? null : message.id)
                                   setFileMenu(false)
                               }} id={`arrow${message.id}`}  style={{height:"12px",cursor:"pointer",visibility:"hidden"}} src={arrowdown} alt="arrow"/>
                           </div>
                           <div style={{display:"flex",justifyContent:"space-between", alignItems:'center'}}>
                               {(type!=="message" && type!=="Contact" && type!=="call" && type!=="audio") ? (type==="image" ?  <img onClick={() => handleDownload(message.message)} style={{width:"90%",height:"25vh"}} src={message.message} alt={message.fileName}/> : <a href={message.message} style={{maxWidth:"89%",minWidth:"10vw",overflowWrap: "break-word",whiteSpace: "pre-wrap"}} target="_blank" rel="noopener noreferrer">{message.fileName}</a>) : type==="Contact" ? <div style={{padding:"20px",backgroundColor:"#FDE24F",border:"1px solid #00214D",borderRadius:"5px",textAlign:"center"}} key={message.ContactUID}>
                                   <h1>{message.message}</h1>
                                   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                       <button style={{color:"#00214D",backgroundColor:"#00ebc7",border:"1px solid #00214D",boxShadow:"4px 4px #00214D"}} id={message.ContactUID} onClick={async () => await sendFriendRequest(userData.uid,message.ContactUID)}>Send Friend Request</button>
                                   </div>
                               </div> : (type==="message" && !selectedChatId.isGroup) ? <span style={{maxWidth:"89%",overflowWrap:"break-word",wordWrap:"break-word",whiteSpace:"pre-wrap",minWidth:"10vw"}}>{message.message}</span> : (type==="message" && selectedChatId.isGroup) ? <span style={{maxWidth:"89%",overflowWrap:"break-word",wordWrap:"break-word",whiteSpace:"pre-wrap",minWidth:"10vw"}}>{message.message}</span> : type==="audio" ? <audio controls>
                                   <source src={message.message} type="audio/webm" />
                                   Your browser does not support the audio element.
                               </audio> : <div style={{display:"flex",gap:"2vh",alignItems:"center",backgroundColor:isMe ? "#e73f5b" : "#02ccad",padding:"15px",borderRadius:"5px"}}>
                                   <img style={{scale:"1.3",backgroundColor:"#FDE24F",padding:"5px",borderRadius:"5px"}} src={camera} alt="camera"/>
                                   <span style={{maxWidth:"89%",overflowWrap:"break-word",wordWrap:"break-word",whiteSpace:"pre-wrap",minWidth:"10vw"}}>{message.message}</span>
                               </div>}
                           </div>
                           <div style={{position:"relative"}}>
                               <span className="message-time">{messageTime.toLocaleTimeString("en-US", {
                                   hour: "2-digit",
                                   minute: "2-digit",
                                   hour12: false, // Change to `true` for AM/PM format
                                   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Ensure it uses the local timezone
                               })}</span>
                           </div>

                       </div>
                       {!isMe && (
                           <img onClick={async () => {
                               setFileMenu(false)
                               setForwardMessage({message:message.message,type:message.message_type,...(message.fileName && { fileName: message.fileName }),...(message.nonce && { nonce: message.nonce }),...(message.ContactUID && { ContactUID: message.ContactUID })})
                               setForwardMenu(true)
                           }} id={`message${message.id}`} style={{height:"16px",cursor:"pointer",visibility:"hidden"}} src={forward} alt="arrow"/>
                       )}
                   </div>
                   {isActionMenuOpen  && (
                       <div style={{display:"flex",justifyContent:isMe ? "flex-end" : "flex-start"}}>
                           <div style={{backgroundColor:"#FDE24F",padding:"10px 0",top:"-2vh",left: !isMe ? "calc(60px + 1vw)" : 0,display:"flex",alignItems:"center",flexDirection:"column",position:"relative",borderRadius:"8px",zIndex:"13"}}>
                               <a className="message-action" onClick={(e) => {
                                   navigator.clipboard.writeText(document.getElementById(message.id).innerText.substring(0, document.getElementById(message.id).innerText.length - 5))
                                   setActiveMessageId(null)
                               }}>Copy Message</a>
                               {isMe && (
                                   <a className="message-action" onClick={async () => {
                                       await deleteMessage(selectedChatId.isGroup,selectedChatId.id,message.id,message.sender_UID,userData.uid)
                                       setActiveMessageId(null)
                                   }}>Delete Message</a>
                               )}
                               <a className="message-action" onClick={() => {
                                   setForwardMessage({message:message.message,type:message.message_type,...(message.fileName && { fileName: message.fileName }),...(message.nonce && { nonce: message.nonce }),...(message.ContactUID && { ContactUID: message.ContactUID })})
                                   setActiveMessageId(null)
                                   setForwardMenu(true)
                               }}>Forward Message</a>
                           </div>
                       </div>
                   )}</div>

           )
       })
   )
}

export default Messages