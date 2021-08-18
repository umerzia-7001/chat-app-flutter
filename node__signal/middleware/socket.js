const { addUser } = require("../helpers/misc");
const Messages = require("../schema/Messages");

module.exports = (app, io, db) => {
  io.on("connection", function (socket) {
    // "6YDAM1LVauUWTnQoAAAC",
     socket.on("_getUsers", ({senderEmail}) => {
      User.find({}, (err, data) => {
        // const users = data.filter(user => user.email != senderEmail);
        io.emit("_allUsers", data);
      })
      .select("-password")
    });

    //* Unique chat *//
    socket.on(
      "startUniqueChat",
      ({ receiverEmail, senderEmail }, callback) => {
        addUser({ receiverEmail, senderEmail }, socket);
      }
    );

     socket.on("joinTwoUsers", ({ roomID }) => {
        socket.join(roomID);
      });

      socket.on('load_user_chats', ({receiverEmail, senderEmail}) => {

        // Emit all messages when curretn user is receiving
        Messages.aggregate([
          {
            $match: {
              receiverEmail,
              senderEmail,
            },
          },
        ]).then((chat) => {
          if (chat.length > 0) {
            for(var i = 0; i < chat.length; i++){
              socket.emit("loadUniqueChat",  chat[i] );
            }
          }
        });

        // Emit all messages when curretn user is sending
        Messages.aggregate([
              {
                $match: {
                  receiverEmail: senderEmail,
                  senderEmail: receiverEmail,
                },
              },
            ]).then((lastAttempt) => {
              if (lastAttempt.length > 0) {
                  for(var i = 0; i < lastAttempt.length; i++){
                    socket.emit("loadUniqueChat",  lastAttempt[i] );
                  }
              } else {
                socket.emit("loadUniqueChat", { });
              }

            });
      });

      socket.on("sendTouser", (data) => { // on sending message called we dispatch it to other user
       socket.broadcast.to(data.roomID).emit("dispatchMsg", { ...data });

       const {
         _id,
         roomID,
         senderEmail,
         receiverEmail,
         time,
         txtMsg
       } = data;

       new Messages({
         _id,
         roomID,
         senderEmail,
         receiverEmail,
         time,
         txtMsg,
       }).save();

   });
  })
}
