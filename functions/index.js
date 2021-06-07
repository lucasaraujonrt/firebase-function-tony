const functions = require('firebase-functions');
const FirebaseAdmin = require('firebase-admin');
const Path = require('path');
const axios = require('axios');
const api = axios.default.create({baseURL: 'http://beb949dd6661.ngrok.io'});

const TonyId = "b910190c-6654-421b-9ff6-674ea8c41174";

// eslint-disable-next-line import/no-dynamic-require
const serviceAccount = require(Path.resolve(__dirname, './tony-firebase.json'));

FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://tccchatbot-97314-default-rtdb.firebaseio.com',
});

function sanitizeObjectToArray(obj) {
  if (!obj || obj.length <= 0) return [];

  return Object.entries(obj)
    .sort()
    .map(item => ({
      id: item[0],
      content: item[1],
    }));
}

exports.SendMessageToTony = functions.database.ref('/messages/{chatId}/{messageId}')
  .onCreate(async (snapshot, context) => {
    const { chatId, messageId } = context.params;

    let [message] = await Promise.all([
      FirebaseAdmin.database()
        .ref(`messages/${chatId}/${messageId}`)
        .once('value'),
    ]);

    message = message.val();
    
    console.log({
      chat: chatId,
      message: message,
    });

    if (message.idSender !== TonyId){
      const { data } = await api.post('/message', {chatId, message: message.content});
      console.log(data);
    }
  });
