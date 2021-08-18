import 'package:flutter/cupertino.dart';

// User
class User {
  final String id;
  final String name;
  final String email;

  User({this.id, @required this.name, @required this.email});
}

// User Data
class UserData {
  final String id;
  final String email;
  final String name;

  UserData(this.id, this.email, this.name);
}

// Dynamic Data for users
class ChatUsers {
  String name;
  String messageText;
  String time;

  ChatUsers({
    @required this.name,
    @required this.messageText,
    @required this.time,
  });
}

// Chat Models
class ChatUser {
  String receiverEmail;
  String senderEmail;
  String roomID;

  ChatUser(
      {@required this.receiverEmail,
      @required this.senderEmail,
      @required this.roomID});
}

// Message Model
class Message {
  String id;
  String roomID;
  String txtMsg;
  String receiverEmail;
  String senderEmail;
  String time;
  bool sender;

  Message(
      {this.id,
      this.roomID,
      this.txtMsg,
      this.receiverEmail,
      this.senderEmail,
      this.time,
      this.sender});
}