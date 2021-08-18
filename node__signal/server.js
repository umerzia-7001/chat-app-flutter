const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const morgan = require("morgan");
const dotenv = require("dotenv");
const http = require("http");
const socketio = require("socket.io");
const {MongoClient} = require('mongodb');
const app = express();

const server = http.createServer(app);
const io = socketio(server).sockets;

// * BorderParser Middleware
app.use(express.json());

async function main() {
  const uri = "mongodb+srv://umerzia:umer7001@cluster0.2xawq.mongodb.net/chat-flutter?retryWrites=true&w=majority";
  //const uri = 'http://192.168.100.122:5000';

  const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
       
 
        // Make the appropriate DB calls
        await  listDatabases(client);
 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);

async function run() {

       await client.connect();
       console.log("Connected correctly to server");
       const db = client.db(dbName);
       // Use the collection "people"
       const col = db.collection("people");
       // Construct a document                                                                                                                                                              
       let personDocument = {
           "name": { "first": "Alan", "last": "Turing" },
           "birth": new Date(1912, 5, 23), // June 23, 1912                                                                                                                                 
           "death": new Date(1954, 5, 7),  // June 7, 1954                                                                                                                                  
           "contribs": [ "Turing machine", "Turing test", "Turingery" ],
           "views": 1250000
       }
       // Insert a single document, wait for promise so we can read it back
       const p = await col.insertOne(personDocument);
       // Find one document
       const myDoc = await col.findOne();
       // Print to the console
       console.log(myDoc);
      }

  main().catch(console.error);


async function listDatabases(client){
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};



// * Load Env
dotenv.config({ path: "./config.env" });

// * Connect DB
const db = config.get("mongoURI");
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Mongodb is connected..."))
  .catch((err) => console.log(err));

//* Log route actions
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//* Use Routes
// * Auth Routes *//
app.use("/login", require("./routes/login"));
app.use("/users", require("./routes/register"));

/** Chatroom routes */
require("./middleware/socket")(app, io, db);

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server started on port ${port}`));
