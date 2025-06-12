import React, {useEffect, useState} from "react";
import {uploadAudio} from "../FirebaseLogic/MessageFunctions.js";
import messagesend from "../assets/messagesend.svg";
import trash from "../assets/trash.svg";
import pause from "../assets/pause.svg";
import Loading from "../Animation/Loading.jsx";

function  Audio ({userData,selectedChatId,setVoiceMessageScreen}) {

    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recorded,setRecorded] = useState(false);
    const [loading,setLoading] = useState(false)

    useEffect(() => {
        startRecording()
    },[])

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
            chunks.push(event.data);
        };

        recorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            setAudioBlob(audioBlob);
            setRecorded(true);
        };

        recorder.start();
        setMediaRecorder(recorder);
    };


    const stopRecording = async () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            await uploadAudio(userData, audioBlob, selectedChatId)
            setAudioBlob(null);
        }
    };

    return (
        <div>
            {loading ? <div style={{position:"absolute",left:"0",top:"0",zIndex:"13",display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%"}}>
                    <Loading />
                </div> : <div className="message-input-holder" style={{gap:"10px"}}>
                <img src={trash} alt="delete" style={{height:"30px",width:"30px",cursor:"pointer"}} onClick={() => {
                    if (mediaRecorder) {
                        mediaRecorder.stop();
                        mediaRecorder.stream.getTracks().forEach(track => track.stop());
                    }
                    setVoiceMessageScreen(false)
                    setAudioBlob(null);
                    setRecorded(false);
                }}/>
                {(recorded && audioBlob)  ? <audio controls>
                    <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                    Your browser does not support the audio element.
                </audio> : "Recording..."}
                {!recorded && <img src={pause} alt="pause" style={{height:"30px",width:"30px",cursor:"pointer"}} onClick={() => {
                    if (mediaRecorder) {
                        mediaRecorder.stop();
                        setRecorded(true)
                    }
                }}/>}
                <img src={messagesend} onClick={async () => {
                    if (recorded){
                        setLoading(true)
                        await uploadAudio(userData, audioBlob, selectedChatId)
                        setLoading(false)
                        setVoiceMessageScreen(false)
                        setAudioBlob(null);
                        setRecorded(false);
                    }else {
                        setVoiceMessageScreen(false)
                        setRecorded(false);
                        await stopRecording()
                    }
                }} alt="send" style={{height:"30px",width:"30px",cursor:"pointer"}} />
            </div>}
        </div>

    )

}
export default Audio

