import 'package:flutter_icons/flutter_icons.dart';
import 'package:flutter_redux/flutter_redux.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:signal/main.dart';
import 'package:signal/models/Models.dart';
import 'package:signal/screens/inbox/Inbox.dart';
import 'package:signal/store/actions/types.dart';
import 'package:signal/store/reducer.dart';
import 'package:socket_io_client/socket_io_client.dart';

class UsersList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: SignalList(),
    );
  }
}

class SignalList extends StatefulWidget {
  SignalList({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _SignalListState createState() => new _SignalListState();
}

class _SignalListState extends State<SignalList> {
  Socket socket;

  @override
  void initState() {
    super.initState();
    socketServer();

    // Emit to Get all users in Database
    User currentUser = store.state.user;
    socket.emit("_getUsers", {'senderEmail': currentUser.email});

    // Gotten users to store
    socket.on("_allUsers", (allUsers) {
      List<UserData> users = [];

      for (var u in allUsers) {
        UserData _users = UserData(u['_id'], u['email'], u['name']);
        users.add(_users);
      }

      users.where((user) => user.email == store.state.user.email).toList();

      store.dispatch(new UpdateAllUserAction(users));
    });
  }

  // Socket Connection
  void socketServer() {
    try {
      // Configure socket transports must be sepecified
      socket = io('http://192.168.100.122:5000', <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': false,
      });

      // Connect to websocket
      socket.connect();

      // Handle socket events
      socket.on('connect', (_) => print('connect: ${socket.id}'));
    } catch (e) {
      print(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      child: SafeArea(
        child: Scaffold(
          appBar: AppBar(
            backgroundColor: Color(0xFF1EA955),
            leading: CircleAvatar(
              backgroundColor: Colors.white,
              radius: 10,
              child: StoreConnector<ChatState, User>(
                converter: (store) => store.state.user,
                onWillChange: (prev, next) {},
                builder: (_, user) {
                  return Text(
                    "",
                    style: TextStyle(
                      fontSize: 10,
                    ),
                  );
                },
              ),
            ),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                StoreConnector<ChatState, User>(
                  converter: (store) => store.state.user,
                  onWillChange: (prev, next) {},
                  builder: (_, user) {
                    return Padding(
                      padding: EdgeInsets.only(left: 10),
                      child: Text(user.name, style: TextStyle(fontSize: 14)),
                    );
                  },
                ),
              ],
            ),
            actions: <Widget>[
              Padding(
                  padding: EdgeInsets.only(right: 20.0),
                  child: GestureDetector(
                    onTap: () {},
                    child: Icon(
                      FontAwesome.phone,
                      size: 30.0,
                    ),
                  )),
            ],
          ),
          body: Container(
            child: Column(children: [
              StoreConnector<ChatState, List<UserData>>(
                  converter: (store) => store.state.allUsers,
                  onWillChange: (prev, next) {},
                  builder: (_, allUsers) {
                    if (allUsers == null) {
                      return Container(
                          child: Center(
                        child: Text("Loading Users..."),
                      ));
                    }

                    List<dynamic> filteredUsers = allUsers
                        .where((user) => user.email != store.state.user.email)
                        .toList();

                    return StoreConnector<ChatState, User>(
                        converter: (store) => store.state.user,
                        onWillChange: (prev, next) {},
                        builder: (_, user) {
                          return Container(
                              padding: const EdgeInsets.only(top: 10),
                              child: ListView.builder(
                                shrinkWrap: true,
                                itemCount: filteredUsers.length,
                                itemBuilder: (BuildContext context, int index) {
                                  return InkWell(
                                      splashColor: null,
                                      onTap: () {
                                        socket.close();

                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                              builder: (context) => Inbox(
                                                    senderMe: user.email,
                                                    receiver:
                                                        filteredUsers[index]
                                                            .email,
                                                  )),
                                        );
                                      },
                                      child: Ink(
                                          child: ListTile(
                                        leading: CircleAvatar(
                                          backgroundColor: null,
                                          child: Text(filteredUsers[index]
                                              .name
                                              .substring(0, 2)
                                              .toUpperCase()),
                                        ),
                                        title: Text(filteredUsers[index].name),
                                        subtitle: Text(
                                          filteredUsers[index].name +
                                              ' is on Signal',
                                          style: TextStyle(fontSize: 12.0),
                                        ),
                                        trailing: new Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: <Widget>[
                                            new Text("date"),
                                          ],
                                        ),
                                      )));
                                },
                              ));
                        });
                  }),
            ]),
          ),
        ),
      ),
    );
  }
}
