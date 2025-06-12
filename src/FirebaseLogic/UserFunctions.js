import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import {db, storage, userCollection} from "./Firebase.js";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";

export const registerNewUser = async(mail,user,name) => {
    const userDocRef = doc(db, "Users", user.uid);
    await setDoc(userDocRef, {
        UID: user.uid,
        Role: "USER",
        Username: name,
        Picture: "default",
        Description: "Hey! I am using Pigeon Post.",
    });
    const friendDocRef = doc(db, "Users", user.uid,"Friends",user.uid);
    await setDoc(friendDocRef, {
        Conversation_ID: user.uid+user.uid,
        Friend_UID: user.uid
    });
    await createConversation(user.uid,user.uid,user.uid+user.uid)
}


export const findRequestSenderByUID = async (uid) => {
    let sender = null;
    const q = query(userCollection, where("UID", "==", uid))
    const querySnapshot = await getDocs(q)
    sender = querySnapshot.docs.map(async doc => {
        return doc.data()
    })
    return await Promise.all(sender)
}


export const getConversationByID = async (id) => {
    const docRef = doc(db,"Conversations",id)
    const docSnapshot = await getDoc(docRef)
    return docSnapshot.data()
}

export const updateUserProfile = async  (user_uid,data) => {
    const docRef = doc(db, "Users", user_uid)
    const user = (await findRequestSenderByUID(user_uid))[0]
    let picRef = null;
    if (data.Picture){
        picRef = ref(storage, `Users/${user_uid}/Profile`)
        const uploadTask = await uploadBytes(picRef, data.Picture)
    }


    await updateDoc(docRef, {
        Picture: picRef ? await getDownloadURL(picRef) : user.Picture,
        Username: data.Username!=="" ? data.Username : user.Username,
        Description: data.Description!=="" ? data.Description : user.Description,
    })

}

export const checkIfFriends = async (id,user_uid) => {
    let res= null;
    const coll = collection(db, "Users", user_uid, "Friends")
    const q = query(coll, where("Friend_UID", "==", id))
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        res = doc.data()
    });
    return res!==null
}

export const sendFriendRequest = async (user_uid,id) => {
    if (user_uid === id) window.alert("Cannot send Friend Request to Yourself")
    if (!await checkIfFriends(id,user_uid) && !await checkIfFriendRequestPresent(id,user_uid)) {
        const docRef = doc(db, `Users`, id, "FriendRequests", user_uid)
        const request = {
            senderUID: user_uid,
            sendTime: Date.now(),
        }
        try {
            await setDoc(docRef, request)
        } catch (err) {
            console.log(err)
        }
    } else {
        window.alert("You are already friends with this person or Friend Request is already present")
    }
}

export const checkIfFriendRequestPresent = async (id,user_uid) => {
    const q = query(collection(db, "Users",id,"FriendRequests"), where("senderUID", "==", user_uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0

}

export const searchByName = async (searchedName,user_uid) => {
    const q = query(userCollection, where("Username", "==", searchedName))
    const querySnapshot = await getDocs(q);
    let finalResult = []
    querySnapshot.forEach((doc) => {
        const data = doc.data()
        if(data.UID!==user_uid){
            finalResult.push({username: data.Username, uid: data.UID})
        }
    });
    return finalResult
}

export const createConversation = async (User1_UID, User2_UID, Conversation_ID) => {
    const conversationRef = doc(db, "Conversations", Conversation_ID)
    await setDoc(conversationRef, {
        Last_message:"",
        Last_message_time:"",
        Last_message_sender:"",
        User1_UID:User1_UID,
        User2_UID:User2_UID,
        Conversation_ID: Conversation_ID
    })
}

export const acceptFriendRequest = async (id,user_uid) => {
    const requestRef = doc(db,"Users",user_uid,"FriendRequests",id)
    const requestRef2 = doc(db,"Users",id,"FriendRequests",user_uid)
    const friendRef1 = doc(db,"Users",user_uid,"Friends",id)
    const friendRef2 = doc(db,"Users",id,"Friends",user_uid)
    try {
        const batch = writeBatch(db);

        batch.set(friendRef1, {
            Friend_UID:id,
            Conversation_ID:user_uid+""+id
        });

        batch.set(friendRef2, {
            Friend_UID:user_uid,
            Conversation_ID:user_uid+""+id
        });

        batch.delete(requestRef);

        const reqRef2Snap = await getDoc(requestRef2)

        if (reqRef2Snap.exists()){
            batch.delete(requestRef2)
        }

        await batch.commit();

        await createConversation(user_uid,id,user_uid+""+id)

        window.location.reload()


    }
    catch (err){
        console.log(err)
    }
}

export const removeFriend = async (id,user_uid,conversation_id) => {
    const docRef = doc(db,"Users",id,"Friends",user_uid)
    const docRef2 = doc(db,"Users",user_uid,"Friends",id)
    const convRef = doc(db,"Conversations",conversation_id)
    const messagesRef = collection(db, "Conversations", conversation_id, "Messages");

    // Get all messages
    const messagesSnapshot = await getDocs(messagesRef);

    // Delete each message document
    // const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    // await Promise.all(deletePromises);
    try {
        const batch = writeBatch(db);

        messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        batch.delete(docRef);

        batch.delete(docRef2);

        batch.delete(convRef);


        await batch.commit();

        window.location.reload()

    }
    catch (err){
        console.log(err)
    }
}

export const denyFriendRequest = async (id,user_uid) => {
    const docRef = doc(db, `Users`, user_uid, "FriendRequests", id)
    try {
        await deleteDoc(docRef)
    } catch (err) {
        console.log(err)
    }
}

export const showFriendRequests = async (user_uid) => {
    const docRef = collection(db, "Users", user_uid, "FriendRequests")
    const snapshot = await getDocs(docRef);
    return await Promise.all(
        snapshot.docs.map(async (doc) => {
            return ((await findRequestSenderByUID(doc.data().senderUID))[0]);
        })
    )
}