import {auth} from "../FirebaseLogic/Firebase.js";
import {signOut,sendPasswordResetEmail,updatePassword,signInWithEmailLink,isSignInWithEmailLink,sendSignInLinkToEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {createContext, useContext, useEffect, useState} from "react";
import {getStreamToken} from "../Stream/StreamLogic.js";

const AuthContext = createContext()

export function useAuth(){
    return useContext(AuthContext)
}

export function AuthProvider({children}){

    const [loading,setLoading] = useState(true)
    const [user,setUser] = useState()
    const [userData, setUserData] = useState()
    const [userStreamToken,setUserStreamToken] = useState()


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                setUser(user);
                setUserData(auth.currentUser)
                const token = await getStreamToken(auth.currentUser.uid);
                setUserStreamToken(token);
                setLoading(false);
            } else {
                // User is not authenticated, handle it accordingly
                setUser(null);
                setLoading(false);
            }

        })
        return unsubscribe
    },[])

    function login(email,password){
        return signInWithEmailAndPassword(auth,email,password)
    }

    function verifyVerificationLink (url){
        return isSignInWithEmailLink(auth,url)
    }

    function signUpWithVerificationLink(email,url){
        return signInWithEmailLink(auth,email,url)
    }

    function renewPassword(password){
        updatePassword(auth.currentUser,password)
    }



    function signUp(email,password){
        return createUserWithEmailAndPassword(auth,email,password)
    }

    function sendVerificationEmail(email,actionCodeSettings){
        return sendSignInLinkToEmail(auth,email,actionCodeSettings)
    }


    function logOut(){
        return signOut(auth)
    }

    function resetPassword(email){
        return sendPasswordResetEmail(auth, email);
    }

    const value = {
        user,
        userData,
        login,
        signUp,
        logOut,
        resetPassword,
        sendVerificationEmail,
        verifyVerificationLink,
        signUpWithVerificationLink,
        renewPassword,
        userStreamToken
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )

}