import { httpsCallable } from "firebase/functions";
import {functions} from "../FirebaseLogic/Firebase.js";

export const getStreamToken = async (uid) => {
    if (!uid) {
        console.error("getStreamToken called with undefined UID!");
        return null;
    }
    try {
        const generateToken = httpsCallable(functions, "generateStreamToken"); // Call your function
        const response = await generateToken({uid} ); // Send userId to backend function
        return response.data.token; // Return the generated token
    } catch (error) {
        console.error("Error fetching Stream token:", error);
        return null;
    }
};