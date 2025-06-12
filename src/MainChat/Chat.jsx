import React, {Suspense, useEffect, useRef, useState} from "react";
import {useAuth} from "../Authentication/AuthContext.jsx";
import {findRequestSenderByUID, removeFriend, searchByName, showFriendRequests} from "../FirebaseLogic/UserFunctions.js";
import {collection, getDocs, onSnapshot, orderBy, query,limit,startAfter } from "firebase/firestore";
import {db, storage} from "../FirebaseLogic/Firebase.js";
import {
    addUserToGroup,
    getAllPictures,
    getGroupUsers,
    handleMessageSend,
    makeUsersAdmin,
    showAllChats, sortChatsByLastMessage
} from "../FirebaseLogic/GroupFunctions.js";
import Navbar from "../ChatComponents/navbar.jsx";
import accaount from "../assets/accaount.svg";
import messagesend from "../assets/messagesend.svg";
import notificationImg from "../assets/notification.svg"
import plus from "../assets/plus.svg";
import inboxx from "../assets/inbox.svg"
import arrowdown from "../assets/arrowdown.svg"
import groupIcon from "../assets/group.svg"
import gallery from "../assets/gallery.svg"
import file from "../assets/file.svg"
import mic from "../assets/mic.svg"
import Inbox from "../ChatComponents/Inbox.jsx";
import Loading from "../Animation/Loading.jsx";
import ConversationInfo from "../ChatComponents/ConversationInfo.jsx";
import gsap from "gsap";
import ChatNavbar from "../ChatComponents/ChatNavbar.jsx";
import GroupCreation from "../ChatComponents/GroupCreation.jsx";
import ForwardMenu from "../ChatComponents/ForwardMenu.jsx";
import Messages from "../ChatComponents/Messages.jsx";
import {useGSAP} from "@gsap/react";
import ChatProfile from "../ChatComponents/ChatProfile.jsx";
import SendingScreen from "../ChatComponents/SendingScreen.jsx";
import ContactSendMenu from "../ChatComponents/ContactSendMenu.jsx";
import Stream from "../Stream/Stream.jsx";
import {handlePressAnimation} from "../Animation/Animations.js";
import Audio from "../ChatComponents/Audio.jsx";



//Component Renders
const UserSearchPage = React.lazy(() => import("../ChatComponents/UserSearch.jsx"))



function Chat() {




    const {userData} = useAuth()
    const [loading,setLoading] = useState(false)
    const [userProfile,setUserProfile] = useState(null)
    const [friendRequests,setFriendRequests] = useState(null)
    const [messagesCache,setMessagesCache] = useState({})
    const [unreadMessagesCache,setUnreadMessagesCache] = useState({})
    const [lastOpenedChat, setLastOpenedChat] = useState({});
    const [globalUnsubscribes,setGlobalUnsubscribes] = useState([])
    const [chatData,setChatData] = useState([])
    const [friendProfiles,setFriendProfiles] = useState([])
    const [sortedChatData,setSortedChatData] = useState([])
    const [selectedChatId,setSelectedChatId] = useState(null)
    const [messages,setMessages] = useState([])
    const [picturesCache,setPicturesCache] = useState({})
    const [groupUsers,setGroupUsers] = useState([])
    const [conversationUser,setConversationUsers] = useState(null)
    const [friends,setFriends] = useState([])
    const [forwardMessage,setForwardMessage] = useState(null)

    const [message,setMessage] = useState(null)
    const [files,setFiles] = useState(null)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    //Component Render States
    const [contactSendMenu,setContactSendMenu] = useState(false)
    const [searchUsers,setSearchUsers] = useState(false)
    const [fileMenu,setFileMenu] = useState(false)
    const [voiceMessageScreen,setVoiceMessageScreen] = useState(false)
    const [inbox,setInbox] = useState(false)
    const [group,setGroup] = useState(false)
    const [chatInfo,setChatInfo] = useState(false)
    const [forwardMenu,setForwardMenu] = useState(false)
    const [call,setCall] = useState(false)

    const { contextSafe } = useGSAP();



    const lastOpenedChatRef = useRef({}); // ✅ Ref to store the latest value
    const sortedChatDataRef = useRef(sortedChatData);
    const friendProfilesRef = useRef(friendProfiles);

    useEffect(() => {
        lastOpenedChatRef.current = lastOpenedChat; // ✅ Keep ref updated with latest state
    }, [lastOpenedChat]);

    useEffect(() => {
        friendProfilesRef.current = friendProfiles; // ✅ Keep ref updated with latest state
    }, [friendProfiles]);


    useEffect(() => {
        if (!userData) return;
        const unsubscribes = [];
        let group_IDS = [], conversation_IDS = [], all_IDS = [], pictures = []


        async function getAllChatIDS(){
            const groupIdRef = await getDocs(collection(db, "Users", userData.uid, "Group_IDS"))
            groupIdRef.docs.map(doc => {
                group_IDS.push({
                    isGroup:true,
                    group_id:doc.data().Group_ID
                })
            })
            const conversationIdRef = await getDocs(collection(db, "Users", userData.uid, "Friends"))
            conversationIdRef.docs.map(doc => {
                conversation_IDS.push({
                    isGroup:false,
                    conversation_id:doc.data().Conversation_ID
                })
            })
            all_IDS = group_IDS.concat(conversation_IDS)
            pictures = await getAllPictures(all_IDS,userData)
            setPicturesCache(pictures)
        }

        async function getAllChatInfo(){
            setUserProfile((await findRequestSenderByUID(userData.uid))[0])
            const res = await  showAllChats(userData)
            setChatData(res[0])
            setFriendProfiles(res[1])
        }

        async function getFriendRequestNumber(){
            const requests = await showFriendRequests(userData.uid)
            setFriendRequests(requests.length)
        }




        async function initializeChats(){
            await getAllChatIDS()
            await getAllChatInfo()
            await getFriendRequestNumber()




            all_IDS.forEach(chatId => {
                const chatRef = chatId.isGroup ? collection(db, "Groups", chatId.group_id, "Messages") : collection(db, "Conversations", chatId.conversation_id, "Messages")
                const q = query(chatRef, orderBy("time", "desc"),limit(20));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const newMessages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })).reverse();

                    setMessagesCache(prevCache => {
                        const existingMessages = prevCache[chatId.isGroup ? chatId.group_id : chatId.conversation_id] || [ ];
                        const allMessages = [...existingMessages, ...newMessages];
                        const uniqueMessages = Array.from(new Map(allMessages.map(msg => [msg.id, msg])).values());

                        return{
                            ...prevCache,
                            [chatId.isGroup ? chatId.group_id : chatId.conversation_id]: uniqueMessages // Cache messages for every chat
                        }

                    });

                    setSortedChatData(prevChats => {
                        // Find the chat to move
                        const updatedChats = prevChats.map(chat => {
                            if ((chat.isGroup && chat.Group_ID === chatId.group_id) || (!chat.isGroup && chat.Conversation_ID === chatId.conversation_id)) {
                                return { ...chat, Last_message_time: newMessages.slice(-1)[0]?.time || chat.Last_message_time };
                            }
                            return chat;
                        });

                        // Sort the chats by latest message time
                        return updatedChats.sort((a, b) => (b.Last_message_time || 0) - (a.Last_message_time || 0));
                    });


                    const lastReadTimestamp = lastOpenedChatRef.current[chatId.isGroup ? chatId.group_id : chatId.conversation_id] || 0;
                    const unreadCount = lastReadTimestamp!==1 ? newMessages.filter(msg => msg.time > lastReadTimestamp && msg.sender_UID !== userData.uid).length : 0;

                    if (unreadCount!==0) handleNotificationSend(chatId.isGroup,chatId.isGroup ? chatId.group_id : chatId.conversation_id,newMessages)
                    setUnreadMessagesCache(prevState => (
                        {
                        ...prevState,
                        [chatId.isGroup ? chatId.group_id : chatId.conversation_id]: unreadCount
                    }));

                });

                askNotificationPermission()



                unsubscribes.push(unsubscribe);
            });

            setGlobalUnsubscribes(unsubscribes); // Store unsubscribe functions
            setLoading(true);
        }


        initializeChats()


        return () => {
            unsubscribes.forEach(unsub => unsub()); // Clean up listeners when component unmounts
        };
    }, [userData]);

    useEffect( () => {
        if (selectedChatId) {
            setMessages(messagesCache[selectedChatId.id] || []);
        }
    }, [messagesCache, selectedChatId]);

    useEffect(() => {
        if (selectedChatId){
            const messageBody = document.querySelector('#messages');
            messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
        }
    },[messages])

    useEffect(() => {
        if (chatData.length > 0) {
            setSortedChatData(chatData);
            sortedChatDataRef.current = chatData;
        }
    }, [chatData]); // Runs when `chatData` updates

    useEffect(() => {
        if (!sortedChatData) return;

        const newFriends = sortedChatData
            .filter(data => !Object.hasOwn(data, 'Group_ID')) // Only process private chats
            .map(data =>
                data.User1_UID === userData.uid
                    ? friendProfiles.find(user => user.UID === data.User2_UID)
                    : friendProfiles.find(user => user.UID === data.User1_UID)
            )
            .filter(us => us); // Remove any undefined values

        setFriends(prevState => {
            const updatedFriends = [...prevState, ...newFriends];
            return [...new Set(updatedFriends)]; // Remove duplicates
        });

    }, [sortedChatData, friendProfiles]); // Runs only when these dependencies change

    useEffect(() => {
        const storedLastOpenedChat = localStorage.getItem("lastOpenedChat");
        if (storedLastOpenedChat) {
            setLastOpenedChat(JSON.parse(storedLastOpenedChat));
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            // Force a re-render when window is resized to update conditional classes
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const handleNotificationSend = (isGroup,id,newMessages) => {
        if (sortedChatDataRef.current.length > 0 && friendProfilesRef.current.length > 0) {
            const text = `${isGroup ? sortedChatDataRef.current.find(chat => (chat.Group_ID === id)).Group_name :  sortedChatDataRef.current.find(chat => (chat.Conversation_ID === id)).User1_UID === userData.uid ? friendProfilesRef.current.find(user => user.UID === sortedChatDataRef.current.find(chat => (chat.Conversation_ID === id)).User2_UID).Username : friendProfilesRef.current.find(user => user.UID === sortedChatDataRef.current.find(chat => (chat.Conversation_ID === id)).User1_UID).Username}: ${newMessages.slice(-1)[0]?.message}`;
            const notification = new Notification("Pigeon Post", { body: text, icon: notificationImg,tag: 'renotify',renotify:true});
            notification.onclick = (e) => {
                e.preventDefault()
                notification.close()
            };
        }
    }


    const handleChatImgClick = contextSafe((className) => {
        const square = document.querySelector(".chat-profile-image");
        const HTMLelement = document.querySelector(`.${className}`);
        const state = Flip.getState(square);
        if (square.classList.length===1){
            gsap.to(HTMLelement, {
                duration:0.7,
                autoAlpha:1,
                zIndex:13,
                ease:"expo.in"
            })
        }else {
            gsap.to(HTMLelement, {
                duration:0.7,
                autoAlpha:0,
                ease:"expo.out"
            })
        }
        square.classList.toggle("good-full")
        Flip.from(state,{
            duration:0.8,
            ease: "slow(0.1,0.1,false)",
            absolute: true,
        });

    })

    const handleChatClick = async (isGroup, data) => {
        setFileMenu(false)
        setMessage(null)
        if (selectedChatId) {
            const newLastOpenedChat = {
                ...lastOpenedChat,
                [selectedChatId.id]: Date.now()
            };

            setLastOpenedChat(newLastOpenedChat);
            localStorage.setItem("lastOpenedChat", JSON.stringify(newLastOpenedChat));
        }
        if (isGroup) {
            setSelectedChatId({
                isGroup: true,
                id: data.Group_ID,
                groupName: data.Group_name,
                groupDescription: data.Group_description,
                groupPicture: data.Group_picture,
                groupAdmins: data.Group_admins,
            })

            // Mark the chat as opened
            setLastOpenedChat(prevState => ({
                ...prevState,
                [data.Group_ID]: 1
            }));

            // Reset unread messages
            setUnreadMessagesCache(prevState => ({
                ...prevState,
                [data.Group_ID]: 0
            }));
            setGroupUsers(await getGroupUsers(data.Group_ID))
        } else {
            const us = data.User1_UID === userData.uid ? friendProfiles.find(user => user.UID === data.User2_UID) : friendProfiles.find(user => user.UID === data.User1_UID)
            setSelectedChatId({
                isGroup: false,
                id: data.Conversation_ID,
                friendName: data.User1_UID === userData.uid ? data.User2_UID : data.User1_UID,
                friendProfile: us
            })
            // Mark the chat as opened
            setLastOpenedChat(prevState => ({
                ...prevState,
                [data.Conversation_ID]: 1
            }));

            // Reset unread messages
            setUnreadMessagesCache(prevState => ({
                ...prevState,
                [data.Conversation_ID]: 0
            }));
            setConversationUsers(us)
        }
        setMessages(messagesCache[data.Group_ID] || [])
    }

    const renderChats = sortedChatData ? sortedChatData.map(data => {
        if (Object.hasOwn(data, 'Group_ID')) {
            return (
                <div  onClick={() => handleChatClick(true,data)} key={data.Group_ID} style={{display:"flex", flexDirection:"column",textAlign:"left",marginBottom:"1.8vh", gap:"16px"}}>
                    <div className="chat"  style={selectedChatId && selectedChatId.id===data.Group_ID ? {backgroundColor:"#00ebc7",boxShadow:"5px 5px #00214D"} : null}>
                        <div style={{display:"flex",flexDirection:"row",gap:"5px",alignItems:"center",maxWidth:"78%",overflow:"hidden"}}>
                            <img style={{clipPath:data.Group_picture!=="group_default" ? "circle()" : null}} className="chat-image" alt="Group Picture" src={data.Group_picture==="group_default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_group.svg?alt=media&token=94365a2e-d3d6-44b9-977a-1b7d4a93d71c" : data.Group_picture}/>
                            <div style={{display:"flex",flexDirection:"column",textAlign:"left",gap:"5x"}}>
                                <span style={{fontWeight:"700"}}>{data.Group_name}</span>
                                <span style={{whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{messagesCache[data.Group_ID]?.slice(-1)[0]?.message || ""}</span>
                            </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column"}}>
                            {unreadMessagesCache && unreadMessagesCache[data.Group_ID] > 0 && (
                                <span style={{borderRadius:"14px", padding:"3px",backgroundColor:"#ff5470",color: "#00214D",textAlign:"center"}}>
                            {unreadMessagesCache[data.Group_ID]}
                        </span>
                            )}
                            {new Date(messagesCache[data.Group_ID]?.slice(-1)[0]?.time).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false, // Change to `true` for AM/PM format
                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Ensure it uses the local timezone
                            }) || ""}
                        </div>
                    </div>
                </div>
            )
        } else {
            const us = data.User1_UID === userData.uid ? friendProfiles.find(user => user.UID === data.User2_UID) : friendProfiles.find(user => user.UID === data.User1_UID)
            return (
                <div key={data.Conversation_ID} onClick={() => handleChatClick(false,data)} style={{display:"flex", flexDirection:"column",textAlign:"left",marginBottom:"1.8vh", gap:"16px"}}>
                    <div className="chat" style={selectedChatId && selectedChatId.id===data.Conversation_ID ? {backgroundColor:"#00ebc7",boxShadow:"5px 5px #00214D"} : null}>
                        <div style={{display:"flex",flexDirection:"row",gap:"5px",alignItems:"center",maxWidth:"78%",overflow:"hidden"}}>
                            <img style={{clipPath:us.Picture!=="default" ? "circle()" : null}} className="chat-image" alt="Conversation Picture" src={us.Picture==="default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_user.svg?alt=media&token=a932cd77-1b1e-4edc-b36b-6784c14861b7" : us.Picture}/>
                            <div style={{display:"flex",flexDirection:"column",textAlign:"left",gap:"5x"}}>
                                <span style={{fontWeight:"700"}}>{us.Username}</span>
                                <span style={{whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{messagesCache[data.Conversation_ID]?.slice(-1)[0]?.message || ""}</span>
                            </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column"}}>
                            {unreadMessagesCache && unreadMessagesCache[data.Conversation_ID] > 0 && (
                                <span style={{borderRadius:"14px", padding:"3px",backgroundColor:"#ff5470",color: "#00214D",textAlign:"center"}}>
                            {unreadMessagesCache[data.Conversation_ID]}
                        </span>
                            )}
                            {new Date(messagesCache[data.Conversation_ID]?.slice(-1)[0]?.time).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false, // Change to `true` for AM/PM format
                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Ensure it uses the local timezone
                            }) || ""}
                        </div>
                    </div>
                </div>
            )
        }
    }) : null



    const renderChatMessages = messages ? <Messages messages={messages} selectedChatId={selectedChatId} setFileMenu={setFileMenu} groupUsers={groupUsers} setForwardMessage={setForwardMessage} setForwardMenu={setForwardMenu} picturesCache={picturesCache}/>: null


    const handleSearchUser = (e) => {
        const filteredUsers = chatData.filter((user) => {
            if (Object.hasOwn(user, 'Group_ID')) {
                return user.Group_name.toLowerCase().includes(e.target.value.toLowerCase());
            } else {
                const friendProfile = user.User1_UID === userData.uid ? friendProfiles.find(use => use.UID === user.User2_UID) : friendProfiles.find(use => use.UID === user.User1_UID)
                return friendProfile.Username.toLowerCase().includes(e.target.value.toLowerCase());
            }
        });

        setSortedChatData(filteredUsers)
    }



    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            const mes = message
            setMessage(null)
            await handleMessageSend(userData, {message: mes, type: "message"},selectedChatId)
        }
    }

    const askNotificationPermission = () => {
        // Check if the browser supports notifications
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications.");
            return;
        }
        Notification.requestPermission()
    }

    const  loadPreviousMessages = async () =>  {
        const chatKey = selectedChatId.id;

        if (messages.length<20) return null;

        const chatRef = selectedChatId.isGroup
            ? collection(db, "Groups", selectedChatId.id, "Messages")
            : collection(db, "Conversations", selectedChatId.id, "Messages");

        const q = query(
            chatRef,
            orderBy("time", "desc"),
            startAfter(messages[0].time),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const olderMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).reverse(); // optional: to keep chronological order

        setMessagesCache(prevCache => {
            const existing = prevCache[chatKey] || [];
            const all = [...olderMessages, ...existing]; // prepend older messages
            const unique = Array.from(new Map(all.map(msg => [msg.id, msg])).values());
            return {
                ...prevCache,
                [chatKey]: unique
            };
        });

    }




    return (
        <div style={{zIndex:"11",height: "100vh", width: "100vw",fontFamily:"Inter",overflow:"hidden"}}>
            {loading ?
            <div style={{opacity:(searchUsers || chatInfo || inbox || group || forwardMenu || files || contactSendMenu || call) ? "0.5" : null}}>
            <Navbar userProfile={userProfile}/>
            <div style={{ display: "flex"}}>
                {/* Left Sidebar - 30% */}
                <div style={windowWidth < 850 ? {zIndex:selectedChatId===null ? "1" : "-1"} : null} className="chat-holder">
                        <input onChange={(e) => handleSearchUser(e)} className="search-input"  placeholder="Search" />
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div className="user-add-holder" onClick={() => setSearchUsers(true)}>
                                <img style={{height:"22px",width:"22px"}} src={plus} alt="add"/>
                            </div>
                            <div className="user-add-holder" style={{position:"relative"}} onClick={() => setInbox(true)}>
                                {friendRequests !==0 ? <div className="inbox-indicator">{friendRequests}</div> : null}
                                <img style={{height:"22px",width:"22px"}} src={inboxx} alt="inbox"/>
                            </div>
                            <div className="user-add-holder" onClick={() => setGroup(true)}>
                                <img style={{height:"22px",width:"31px"}} src={groupIcon} alt="group"/>
                            </div>
                        </div>
                    <span style={{fontWeight:"600",fontSize:"24px", marginLeft:"9px"}}>Chats</span>
                    {renderChats}
                </div>



                {selectedChatId ?
                    <div className="conversation-main-holder" >
                        <div style={{height:"80px", width:"100%", display:"flex",padding:"20px",backgroundColor:"#00ebc7",borderBottom:"4px solid #00214D"}}>
                            <div className="chat-profile" style={{width:"100%", display: "flex", flexDirection:"row",justifyContent:"space-between", padding:"0px 9px", borderRadius:"15px", alignItems:"center", transition:"background-color 0.4s ease-in-out, box-shadow 0.4s ease-in-out"}}>
                                <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
                                    <img className="previous-button" alt="previous" src={arrowdown} style={{height:"12px",cursor:"pointer",transform:"rotate(90deg)"}} onClick={() => {
                                        setFileMenu(false)
                                        setMessage(null)
                                        const newLastOpenedChat = {
                                            ...lastOpenedChat,
                                            [selectedChatId.id]: Date.now()
                                        };

                                        setLastOpenedChat(newLastOpenedChat);
                                        localStorage.setItem("lastOpenedChat", JSON.stringify(newLastOpenedChat));
                                        setSelectedChatId(null)
                                        setMessages([])
                                    }}/>
                                    <img style={{clipPath:(picturesCache[selectedChatId.id]!=="group_default" && picturesCache[selectedChatId.id]!=="default") ? "circle()" : null}} className="chat-profile-image" alt="chat-image" onClick={() =>setChatInfo(true)} src={picturesCache[selectedChatId.id]==="group_default" ? "https://firebasestorage.googleapis.com/v0/b/pigeon-post-6156e.firebasestorage.app/o/default_group.svg?alt=media&token=94365a2e-d3d6-44b9-977a-1b7d4a93d71c" : picturesCache[selectedChatId.id]}/>
                                    <div style={{display:"flex",flexDirection:"column",textAlign:"left",gap:"5x"}}>
                                        <span style={{fontWeight:"700"}}>{selectedChatId.isGroup ? selectedChatId.groupName : selectedChatId.friendProfile.Username}</span>
                                        <span>{selectedChatId.isGroup ? selectedChatId.groupDescription : selectedChatId.friendProfile.Description}</span>
                                    </div>
                                </div>
                                <ChatProfile handleClick={() =>handleChatImgClick(selectedChatId.id)} data={{
                                    Username: selectedChatId.isGroup ? selectedChatId.groupName : selectedChatId.friendProfile.Username,
                                    Description: selectedChatId.isGroup ? selectedChatId.groupDescription : selectedChatId.friendProfile.Description,
                                }} className={selectedChatId.id}/>
                                <ChatNavbar friends={friends}  selectedChatId={selectedChatId} groupUsers={groupUsers} setCall={setCall}  />
                            </div>
                        </div>
                        <div className="message-container" id="messages">
                            {messages.length>=20 && <button style={{marginBottom:"14px",backgroundColor:"#00ebc7",color:"#00214D",boxShadow:"5px 5px #00214D"}} onClick={(e) => {
                                e.preventDefault()
                                loadPreviousMessages()
                            }}>Load Previous Messages</button>}
                            {renderChatMessages}
                        </div>
                        {voiceMessageScreen ? <Audio userData={userData} selectedChatId={selectedChatId} setVoiceMessageScreen={setVoiceMessageScreen}/> : <div  className="message-input-holder" >
                            <div className="file-menu-holder" >
                                <label className="file-menu-button" style={{ cursor: "pointer", display: "flex", alignItems: "center",padding:"1vh" }}>
                                    <div style={{display:"flex",gap:"1vw"}}>
                                        <img style={{ height: "4vh" }} src={file} alt="file" />
                                        <span>Documents</span>
                                    </div>
                                    <input
                                        type="file"
                                        multiple={true}
                                        onChange={(e) => (e.target.files?.length > 0) && setFiles(e.target.files)}
                                        className="user-settings-picture-input"
                                        style={{ display: "none" }}
                                    />
                                </label>
                                <label className="file-menu-button" style={{ cursor: "pointer", display: "flex", alignItems: "center",padding:"1vh" }}>
                                    <div style={{display:"flex",gap:"1vw"}}>
                                        <img style={{ height: "4vh" }} src={gallery} alt="gallery" />
                                        <span>Gallery</span>
                                    </div>
                                    <input
                                        type="file"
                                        multiple={true}
                                        accept="image/*"
                                        onChange={(e) => (e.target.files?.length > 0) && setFiles(e.target.files)}
                                        className="user-settings-picture-input"
                                        style={{ display: "none" }}
                                    />
                                </label>
                                <div onClick={() => setContactSendMenu(true)} className="file-menu-button" style={{ cursor: "pointer", display: "flex", alignItems: "center",padding:"1vh" }}>
                                    <div style={{display:"flex",gap:"1vw"}}>
                                        <img style={{ height: "4vh" }} src={accaount} alt="accaunt" />
                                        <span>Contact</span>
                                    </div>
                                </div>
                            </div>
                            <img style={{height:"21px",width:"21px",cursor:"pointer"}} src={plus} onClick={() => {setFileMenu(prevState => !prevState);handlePressAnimation("file-menu-holder")}} alt="file-send"/>
                            <input value={message ? message : ""} onKeyPress={(e) => handleKeyDown(e)}  onChange={(e) => setMessage(e.target.value)} className="message-input" placeholder="Enter Message" ></input>
                            {message!=="" && message!==null ? <img src={messagesend} onClick={async () => {
                                const mes = message
                                setMessage(null)
                                await handleMessageSend(userData, {message: mes, type: "message"},selectedChatId)
                            }} alt="send" style={{height:"30px",width:"30px",cursor:"pointer"}} /> : <img src={mic} alt="microphone" style={{height:"30px",width:"30px",cursor:"pointer"}} onClick={async () => {
                                setVoiceMessageScreen(true)
                            }}/> }

                        </div>}

                    </div>: <div className="dotted-background"></div>}


                {selectedChatId!==null && (selectedChatId.isGroup ? groupUsers : conversationUser ) ?
                    <ConversationInfo  conversationUser={selectedChatId.isGroup ? groupUsers : conversationUser} isGroup={selectedChatId} sortedChatData={sortedChatData}  handleChatClick={handleChatClick} narrowScreen={false} setChatInfo={setChatInfo}/> : null}
            </div>

            </div> : <Loading/> }

            {chatInfo ? <Suspense fallback={<Loading/>}>
                <ConversationInfo  conversationUser={selectedChatId.isGroup ? groupUsers : conversationUser} isGroup={selectedChatId} sortedChatData={sortedChatData} handleChatClick={handleChatClick} narrowScreen={true} setChatInfo={setChatInfo}/>
            </Suspense> : null}
            {searchUsers ? <Suspense fallback={<Loading/>}>
                <UserSearchPage setSearchUsers={setSearchUsers}/>
            </Suspense> : null}
            {inbox ? <Suspense fallback={<Loading/>}>
                <Inbox setInbox={setInbox}/>
            </Suspense> : null}
            {group ? <Suspense fallback={<Loading/>}>
                <GroupCreation friends={friends} setGroup={setGroup} />
            </Suspense> : null }
            {forwardMenu ? <Suspense fallback={<Loading/>}>
                <ForwardMenu  message={forwardMessage} setForwardMenu={setForwardMenu} sortedChatData={sortedChatData} friends={friends} picturesCache={picturesCache} friendProfiles={friendProfiles}/>
            </Suspense> : null }
            {files ? <Suspense fallback={<Loading/>}>
                <SendingScreen data={files} userData={userData} selectedGroupId={selectedChatId} setFileMenu={setFileMenu} setData={setFiles}/>
            </Suspense>: null}
            {contactSendMenu ? <Suspense fallback={<Loading/>}>
                <ContactSendMenu friends={friends} setContactSendMenu={setContactSendMenu} selectedChatId={selectedChatId}/>
            </Suspense>: null}
            {call ? <Suspense fallback={<Loading/>}>
                <Stream setCall={setCall} selectedChatId={selectedChatId} userProfile={userProfile}/>
            </Suspense>: null}
        </div>


    )

}

export default Chat