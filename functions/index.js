/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { StreamChat } = require("stream-chat");

// Initialize Firebase Admin
admin.initializeApp();

// Stream API credentials
const apiKey = "m27q2kzfdsbj";
const apiSecret = "93wq332bggk65ska6n5smrk7hgf9r9vq2w765q74zcfhrbdacm5t2jajznd2ecnu";

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

exports.generateStreamToken = functions.https.onCall((data, context) => {
    const uid  = data.auth.uid;
    if (!uid) {
        throw new functions.https.HttpsError("invalid-argument", "Missing user ID");
    }

    const call_cids = ["default:call1", "livestream:call2"];
    const callToken  = serverClient.generateCallToken({ user_id, call_cids, validity_in_seconds });
    // Generate Stream token for the user
    const token = serverClient.createToken(uid);

    return { token };
});