const functions = require('firebase-functions');
const FirebaseAdmin = require('firebase-admin');
const Path = require('path');
const axios = require('axios');
const api = axios.default.create({baseURL: 'http://d6279976c53a.ngrok.io'});

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

    let [message, chat] = await Promise.all([
      FirebaseAdmin.database()
        .ref(`messages/${chatId}/${messageId}`)
        .once('value'),
      FirebaseAdmin.database()
        .ref(`chats/${chatId}`)
        .once('value'),
    ]);

    message = message.val();
    chat = chat.val();

    const participants = sanitizeObjectToArray(
      chat.participants,
    );

    const messageSender = participants
      .filter(o => o.id === message.idSender);

    console.log({
      chat: JSON.stringify(chat),
      message: JSON.stringify(message),
      messageSender: JSON.stringify(messageSender),
    });

    const { data } = await api.post('/message', {chat, message});
    console.log(data);
  });
