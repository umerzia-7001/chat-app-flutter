const Chats = require("../schema/Chats");
const { v4: uuidV4 } = require("uuid");

let users = [];

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const addUser = ({ receiverEmail, senderEmail }, socket) => {
  if (!receiverEmail || !senderEmail)
    return { error: "You tried to add zero uses" };

  const user = { receiverEmail, senderEmail };

  //   if there is a recieverEmail of same and my email is the senderEmail
  Chats.aggregate([
    {
      $match: {
        receiverEmail,
        senderEmail,
      },
    },
  ]).then((chat) => {
    if (chat.length > 0) {
      socket.emit("openChat", { ...chat[0] });
    } else {
      Chats.aggregate([
        {
          $match: {
            receiverEmail: senderEmail,
            senderEmail: receiverEmail,
          },
        },
      ]).then((lastAttempt) => {
        if (lastAttempt.length > 0) {
          socket.emit("openChat", { ...lastAttempt[0] });
        } else {
          const newChat = {
            ...user,
            roomID: uuidV4(),
          };

          socket.emit("openChat", { ...newChat });

          // Create new Chat
          new Chats({
            ...user,
            roomID:uuidV4()
          }).save();
        }
      });
    }
  });
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
