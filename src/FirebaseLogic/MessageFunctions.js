import {db, storage} from "./Firebase.js";
import {addDoc, collection, deleteDoc, doc, getDoc, updateDoc} from "firebase/firestore";
import {handleMessageSend} from "./GroupFunctions.js";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";



export const deleteMessage = async (isGroup,chat_id,message_id,message_sender,user_uid) => {
    const docRef = doc(db,isGroup ? "Groups" : "Conversations",chat_id,"Messages",message_id)
    if (isGroup){
        const docRef2 = doc(db,"Groups",chat_id)
        const doc2Snap = await getDoc(docRef2)
        doc2Snap.data().Group_admins.split(";").map(async admin => {
            if (admin === user_uid) {
                await deleteDoc(docRef);
            }
        })
    }else{
        if (message_sender===user_uid) {
            await deleteDoc(docRef);
        }
    }
}

export const forwardMessage = (message,uid_list,sortedChatData,userData) => {
    sortedChatData.map(async data => {
        const decision = Object.hasOwn(data,"Conversation_ID") ? uid_list.includes(data.Conversation_ID) : uid_list.includes(data.Group_ID)
        if (decision) {
            const d = {
                isGroup: Object.hasOwn(data,"Group_ID"),
                id:data.Conversation_ID ? data.Conversation_ID : data.Group_ID
            }
            await handleMessageSend(userData, {message:message.message,type:message.type,...(message.ContactUID && { ContactUID: message.ContactUID }),...(message.fileName && { fileName: message.fileName })},d)
        }
    })
}

export const sendContact = async (contacts, selectedChatId, userData) => {
    contacts.map(async contact => {
        const docRef = selectedChatId.isGroup ? collection(db, "Groups", selectedChatId.id, "Messages") : collection(db, "Conversations", selectedChatId.id, "Messages")
        const docRef2 = selectedChatId.isGroup ? doc(db, "Groups", selectedChatId.id) : doc(db, "Conversations", selectedChatId.id)
        const mess_obj = {
            sender_UID: userData.uid,
            message: contact.Username,
            time: Date.now(),
            message_type: "Contact",
            ContactUID: contact.UID
        }
        await addDoc(docRef, mess_obj)
        await updateDoc(docRef2, {
            Last_message: mess_obj.message,
            Last_message_time: mess_obj.time,
            Last_message_sender: mess_obj.sender_UID,
            Last_message_type: "Contact"
        })
    })
}
export const uploadAudio = async (userData,audioBlob,selectedChatId,privateKey) => {
    if (!audioBlob) return;

    const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
    const audioRef = ref(storage, selectedChatId.isGroup ? `Groups/${selectedChatId.id}/Group_Chat/${audioFile.name}` : `Conversations/${selectedChatId.id}/Chat/${audioFile.name}`);

    await uploadBytes(audioRef, audioFile);
    const audioURL = await getDownloadURL(audioRef);

    // Save the message to Firestore
    await addDoc(collection(db, selectedChatId.isGroup ? "Groups" : "Conversations",selectedChatId.id,"Messages"), {
        sender_UID: userData.uid,
        message: audioURL,
        time: Date.now(),
        message_type: "audio"
    });

};

export const uploadMedia = async (userData,files,selectedChatId) => {
    for (let i = 0; i<files.length; i++) {
        const picRef = ref(storage, selectedChatId.isGroup ?`Groups/${selectedChatId.id}/Group_Chat/${files[i].name}` : `Conversations/${selectedChatId.id}/Chat/${files[i].name}`)
        const uploadTask = await uploadBytes(picRef, files[i])
        const url = await getDownloadURL(picRef)


        const docRef = selectedChatId.isGroup ? collection(db, "Groups", selectedChatId.id,"Messages") : collection(db, "Conversations", selectedChatId.id,"Messages")
        const mess_obj = {
            sender_UID: userData.uid,
            message: url,
            time: Date.now(),
            message_type: files[i].type.startsWith("image") ? "image" : "file",
            fileName: files[i].name,
        }
        await addDoc(docRef,mess_obj)
    }

};