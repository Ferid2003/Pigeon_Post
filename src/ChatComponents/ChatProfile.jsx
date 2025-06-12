import close from "../assets/close.svg";

function ChatProfile ({data,handleClick,className}) {

    return (
    <div id="profile" className={`profile ${className}`} >
        <img onClick={handleClick} style={{height:"25px",width:"25px",cursor:"pointer",position:"absolute",right:"8%",top:"8%"}} src={close} alt="close window"/>
        <span style={{backgroundColor:"#FDE24F",padding:"15px",borderRadius:"15px",border:"1px solid #00214D",boxShadow:"4px 4px #00214D",overflowWrap:"break-word",whiteSpace:"pre-wrap",maxWidth:"100%"}}>{data.Username}</span>
        <div className="seperator"/>
        <span style={{backgroundColor:"#FDE24F",padding:"15px",borderRadius:"15px",border:"1px solid #00214D",boxShadow:"4px 4px #00214D",overflowWrap:"break-word",whiteSpace:"pre-wrap",maxWidth:"100%"}}>{data.Description}</span>
    </div>
    )

}
export default ChatProfile;