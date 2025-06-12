import close from "../assets/close.svg";
import Loading from "../Animation/Loading.jsx";
import React, {useState} from "react";
import {uploadMedia} from "../FirebaseLogic/MessageFunctions.js";


function SendingScreen({data,userData,setFileMenu,setData,selectedGroupId}){

    const [files,setFiles] = useState(Array.from(data));
    const [loading,setLoading] = useState(false)


    const renderFiles = files.map(file => {
            return (
                <div id={file.name}>
                    <span>{file.name}</span>
                </div>
            )
        })

    const handleFileSend = async () => {
        setLoading(true)
        await uploadMedia(userData,files,selectedGroupId)
    }


    return(
        <div>
            {loading ? <div style={{position:"absolute",left:"0",top:"0",zIndex:"13",display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%"}}>
                    <Loading />
                </div>
                 :<div style={{position:"absolute",left:"0",top:"0",zIndex:"13",display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%"}}>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between"}} className="user-search-holder">
                    <div>
                        <img onClick={() => {
                            setData(null)
                            setFileMenu(false)
                        }} style={{scale:"2.3",cursor:"pointer",position:"absolute",right:"32%",top:"18%"}} src={close} alt="close window"/>
                        <h1>Send Files</h1>
                        <div style={{padding:"20px", overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:"#FDE24F #00214D"}}>
                            {files ? renderFiles : <Loading/>}
                        </div>
                    </div>
                    {files.length>0 ? <button  onClick={async () => {
                        await handleFileSend()
                        setData(null)
                        setFileMenu(false)
                        setFiles(null)
                        setLoading(false)
                    }}>Send</button> : null}
                </div>
            </div>}

        </div>
    )

}

export default SendingScreen