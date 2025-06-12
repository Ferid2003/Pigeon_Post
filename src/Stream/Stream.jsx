import { useAuth } from "../Authentication/AuthContext.jsx";
import { NoiseCancellation } from "@stream-io/audio-filters-web";
import {
    CallControls,
    CallingState,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient,
    NoiseCancellationProvider,
    useCallStateHooks, useNoiseCancellation,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "../Css/sui.css";
import React, { useEffect, useMemo } from "react";
import {handleMessageSend} from "../FirebaseLogic/GroupFunctions.js";

const MyUILayout = ({ setCall,userData,userProfile,selectedChatId }) => {
    const { useCallCallingState } = useCallStateHooks();

    // ✅ Always call hooks at the top level
    const callingState = useCallCallingState();


    if (callingState !== CallingState.JOINED) {
        return <div>Loading...</div>;
    }

    return (
        <StreamTheme>
            <SpeakerLayout participantsBarPosition="bottom" />
            <CallControls onLeave={() => {
                handleMessageSend(userData, { message: `${userProfile.Username} left the call`, type: "call" }, selectedChatId);
                setCall(false)
            }}/>
            <MyToggleNoiseCancellationButton />
        </StreamTheme>
    );
};
const MyToggleNoiseCancellationButton = () => {
    // isSupported can be true, false or undefined (undefined is used while compatibility check is in progress)
    const { isSupported, isEnabled, setEnabled } = useNoiseCancellation();
    return (
        <button
            disabled={!isSupported}
            type="button"
            onClick={() => setEnabled(!isEnabled)}
        >
            {`Click to turn noise cancellation ${!isSupported ? "on" : "off"}`}
        </button>
    );
};

function Stream({ setCall ,selectedChatId,userProfile}) {
    const { userData, userStreamToken } = useAuth();

    // ✅ Memoize `client` to prevent re-creating it on every render
    const client = useMemo(() => {
        return new StreamVideoClient({
            apiKey: import.meta.env.VITE_STREAM_VIDEO_CLIENT_API_KEY,
            token: userStreamToken,
            user: { id: userData.uid },
        });
    }, [userStreamToken]);

    // ✅ Memoize `call`
    const call = useMemo(() => {
        return client.call("default", selectedChatId.id);
    }, [client]);

    const noiseCancellation = useMemo(() => new NoiseCancellation(), []);

    useEffect(() => {
        call.join({ create: true });
        handleMessageSend(userData, { message: `${userProfile.Username} joined the call`, type: "call" }, selectedChatId);
    }, [call]);

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <NoiseCancellationProvider noiseCancellation={noiseCancellation}>
                    <MyUILayout setCall={setCall} userData={userData} selectedChatId={selectedChatId} userProfile={userProfile}/>
                </NoiseCancellationProvider>
            </StreamCall>
        </StreamVideo>
    );
}

export default Stream;
