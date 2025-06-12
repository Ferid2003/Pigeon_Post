import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc, where,
    writeBatch
} from "firebase/firestore";
import {db, groupCollection, storage} from "./Firebase.js";
import {findRequestSenderByUID, getConversationByID} from "./UserFunctions.js";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage"


export const createGroup = async (groupName,groupDescription,picture,userData,uid_list) => {
    let link = null
    const final_group_data = {
        Group_admins:userData.uid,
        Group_description:groupDescription,
        Group_name:groupName,
        Group_picture: "group_default",
        Last_message:null,
        Last_message_time:null,
        Last_message_sender:null,
        Last_message_type:null
    }
    const docRef = await addDoc(groupCollection,final_group_data)
    const docId = docRef.id
    if (picture){
        const picRef = ref(storage, `Groups/${docId}/Group_Picture`)
        const uploadTask = await uploadBytes(picRef, picture)
        link = await getDownloadURL(picRef)
        await updateDoc(doc(db,"Groups",docId), {
            Group_picture: link
        });
    }
    const group_data_for_user = {
        Group_ID:docId
    }
    await setDoc(doc(db, "Groups", docId), {Group_ID: docId}, {merge: true});
    const docRef2 = collection(db,"Groups",docId,"Group_users")
    await addDoc(collection(db,"Users",userData.uid,"Group_IDS"),group_data_for_user)
    for (let i = 0; i< uid_list.length; i++){
        await setDoc(doc(docRef2, uid_list[i]), { User_UID: uid_list[i] });
        await addDoc(collection(db,"Users",uid_list[i],"Group_IDS"),group_data_for_user)
    }
    await setDoc(doc(docRef2, userData.uid), { User_UID: userData.uid });

    window.location.reload()
}

export const addUserToGroup = async (group_id,uid_list) => {
    const docRef = collection(db,"Groups",group_id,"Group_users")
    for (let i = 0; i< uid_list.length; i++){
        await setDoc(doc(docRef, uid_list[i]), { User_UID: uid_list[i] });
        await addDoc(collection(db,"Users",uid_list[i],"Group_IDS"),{Group_ID:group_id})
    }
}

export const getGroupByID = async (id) => {
    const docRef = doc(db,"Groups",id)
    const docSnapshot = await getDoc(docRef)
    return docSnapshot.data()
}

export const showGroups = async (userData) => {
    const querySnapshot = await getDocs(collection(db, "Users", userData.uid, "Group_IDS"))

    const groupPromises = querySnapshot.docs.map(async (doc) => {
        return await getGroupByID(doc.data().Group_ID);
    });

    // Wait for all Firestore requests to complete
    return await Promise.all(groupPromises)
}
export const showUsers = async (userData) => {
    const querySnapshot = await getDocs(collection(db, "Users", userData.uid, "Friends"))
    const conversationPromises = querySnapshot.docs.map(async (doc) => {
        return await findRequestSenderByUID(doc.data().Friend_UID)
    });
    const nestedArray = await Promise.all(conversationPromises);

    return nestedArray.flat()

}
export const showConversations = async (userData) => {
    const querySnapshot = await getDocs(collection(db, "Users", userData.uid, "Friends"))
    const conversationPromises = querySnapshot.docs.map(async (doc) => {
        return await getConversationByID(doc.data().Conversation_ID);
    });
    return await Promise.all(conversationPromises)
}

export const sortChatsByLastMessage = async (chats) => {
    return chats.sort((a, b) => b.Last_message_time - a.Last_message_time);
}

export const showAllChats = async (userData) => {
    const groups = await showGroups(userData)
    const conversations = await showConversations(userData)
    const users = await showUsers(userData)
    return [await sortChatsByLastMessage(groups.concat(conversations)),users]
}


export const handleMessageSend = async (userData,message,selectedGroupId) => {
    const docRef = selectedGroupId.isGroup ? collection(db, "Groups", selectedGroupId.id,"Messages") : collection(db, "Conversations", selectedGroupId.id,"Messages")
    const docRef2 = selectedGroupId.isGroup ? doc(db, "Groups", selectedGroupId.id) : doc(db, "Conversations", selectedGroupId.id)
        const mess_obj = {
            sender_UID: userData.uid,
            message: message.message,
            time: Date.now(),
            message_type: message.type,
            ...(message.fileName && { fileName: message.fileName }),
            ...(message.ContactUID && { ContactUID: message.ContactUID })
        }
        await addDoc(docRef,mess_obj)
        await updateDoc(docRef2,{
            Last_message:  mess_obj.message,
            Last_message_time:mess_obj.time,
            Last_message_sender:mess_obj.sender_UID,
            Last_message_type: message.type
        })

            // const {encryptedMessage,nonce} = await encryptMessage(message.message,privateKey,receiverPublicKey)
            // const mess_obj =  {
            //     sender_UID: userData.uid,
            //     message: encryptedMessage,
            //     nonce: nonce,
            //     time: Date.now(),
            //     message_type: message.type,
            //     ...(message.fileName && { fileName: message.fileName }),
            //     ...(message.nonce && { nonce: message.nonce }),
            //     ...(message.ContactUID && { ContactUID: message.ContactUID })
            // }
            // await addDoc(docRef,mess_obj)
            // await updateDoc(docRef2,{
            //     Last_message: encryptedMessage,
            //     Last_message_time:mess_obj.time,
            //     Last_message_sender:mess_obj.sender_UID,
            //     Last_message_type: message.type
            // })


}

export const getGroupMessages = async (group_id) => {
    //setSelectedGroupId(group_id)
    const querySnapshot = await getDocs(collection(db, "Groups",group_id,"Messages"));
    return querySnapshot.docs.map(doc => doc.data())
}



export const getGroupUsers = async (group_id) => {
    let usernames = [];
    const querySnapshot = await getDocs(collection(db,"Groups",group_id,"Group_users"))
    usernames = querySnapshot.docs.map(async doc => {
        return  (await findRequestSenderByUID(doc.data().User_UID))[0]
    })
    return await Promise.all(usernames)
}
export const checkIfUserAdmin = (docSnap,group_id,user_uid) => {
    return docSnap.data().Group_admins.split(";").includes(user_uid)
}
export const makeUsersAdmin = (group_id,user_uid_list) => {
    const docRef = doc(db,"Groups",group_id)
    user_uid_list.map(async user_uid => {
        const docSnap = await getDoc(docRef)
        if (!checkIfUserAdmin(docSnap,group_id,user_uid)){
            await setDoc(docRef, {Group_admins: docSnap.data().Group_admins + ";" + user_uid}, {merge: true})
        }
    })
}

export const updateGroupFields = async (group_id, group_data) => {
    const docRef = doc(db, "Groups", group_id)
    const link = group_data.Group_picture!=="group_default" ? await uploadPictureToGroup(group_id, group_data.Group_picture) : null
    link!==null ?
    await updateDoc(docRef,{
        Group_description:group_data.Group_description,
        Group_name:group_data.Group_name,
        Group_picture: link ? link : "group_default"
    }) :
        await updateDoc(docRef,{
            Group_description:group_data.Group_description,
            Group_name:group_data.Group_name
        })

}

export const uploadPictureToGroup = async (group_id, picture) => {
    const picRef = ref(storage, `Groups/${group_id}/Group_Picture`)
    const uploadTask = await uploadBytes(picRef, picture)
    return await getDownloadURL(picRef)
}

export const getAllPictures = async (id_list,userData) => {
    let chatPictures = {}
    for (const id of id_list) {
        try {
            const docRef = id.isGroup ? doc(db, "Groups", id.group_id) : doc(db, "Conversations", id.conversation_id)
            const docSnap = await getDoc(docRef);
            if (!id.isGroup) {
                const docRef2 = docSnap.data().User1_UID!==userData.uid ? doc(db,"Users",docSnap.data().User1_UID) : doc(db,"Users",docSnap.data().User2_UID)
                const docSnap2 = await getDoc(docRef2);
                chatPictures[id.conversation_id] = docSnap2.data().Picture==="default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7" : docSnap2.data().Picture
            }else {
                chatPictures[id.group_id] = docSnap.data().Group_picture==="group_default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_group.svg?alt=media&token=94365a2e-d3d6-44b9-977a-1b7d4a93d71c" : docSnap.data().Group_picture
            }
        }catch (error) {
            console.error("Error fetching pictures:", error);
        }
    }
    const docRef = doc(db, "Users", userData.uid)
    const docSnap = await getDoc(docRef);
    chatPictures[userData.uid] = docSnap.data().Picture
    return chatPictures
}

export const leaveGroup = async (user_uid,group_id) => {
    const docRef2 = collection(db,"Groups",group_id,"Group_users")
    const docSnap2 = await getDocs(docRef2);
    if (docSnap2.size===1) await deleteGroup(user_uid, group_id)
    await deleteDoc(doc(db,"Groups",group_id,"Group_users",user_uid))
    const docRef = doc(db,"Groups",group_id)
    const docSnap = await getDoc(docRef);
    if (docSnap.data().Group_admins.split(";").includes(user_uid)){
        const arr = docSnap.data().Group_admins.split(";")
        const index = arr.indexOf(user_uid);
        arr.splice(index, 1);

        let res = ""

        for(let i = 0; i<arr.length; i++){
            if(i+1===arr.length){
                res+=arr[i]
            }else{
                res+=arr[i]
                res+=";"
            }
        }

        await updateDoc(docRef,{
            Group_admins:res
        })
    }
    await removeUserFromGroup(group_id,[user_uid])
    window.location.reload()
}

export const removeUserFromGroup = async (group_id,id_list) => {
    for (const id of id_list){
        const groupRef = collection(db, "Users", id, "Group_IDS");
        const q = query(groupRef, where("Group_ID", "==", group_id));
        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) { // ✅ Ensure deleteDoc is awaited
            await deleteDoc(docSnap.ref);
        }

        await deleteDoc(doc(db, "Groups", group_id, "Group_users", id));

        const docRef = doc(db, "Groups", group_id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().Group_admins.includes(id)) {
            const arr = docSnap.data().Group_admins.split(";");
            const index = arr.indexOf(id);
            arr.splice(index, 1);

            const res = arr.join(";"); // ✅ More efficient string concatenation

            await updateDoc(docRef, {
                Group_admins: res
            });
        }
    }

}

const deleteGroupFromUser = async (id,group_id) => {
    const groupIdsRef = collection(db, "Users", id, "Group_IDS");
    const q = query(groupIdsRef, where("Group_ID", "==", group_id));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
}

export const deleteGroup = async (user_uid,group_id) => {
    const messagesRef = collection(db,"Groups",group_id,"Messages")
    const usersRef = collection(db,"Groups",group_id,"Group_users")
    const groupRef = doc(db,"Groups",group_id)

    const messagesSnapshot = await getDocs(messagesRef)
    const usersSnapshot = await getDocs(usersRef)

    try {
        const batch = writeBatch(db)

        if (!messagesSnapshot.empty){
            messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref))
        }
        for (const doc1 of usersSnapshot.docs) {
            const d = await deleteGroupFromUser(doc1.data().User_UID,group_id)
            batch.delete(d.ref)
            batch.delete(doc1.ref)
        }
        batch.delete(groupRef)

        await batch.commit();

        window.location.reload()

    }catch (err){
        console.log(err)
    }

}