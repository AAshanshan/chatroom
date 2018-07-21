var io = require('socket.io')();
var _ = require('underscore');



//api
/*

socket.emit('message', "this is a test");  // send to current request socket client

socket.broadcast.emit('message', "this is a test");  // sending to all clients except sender

socket.broadcast.to('game').emit('message', 'nice game');  // sending to all clients in 'game' room(channel) except sender

io.sockets.emit('message', "this is a test"); // sending to all clients, include sender
 
io.sockets.in('game').emit('message', 'cool game'); // sending to all clients in 'game' room(channel), include sender

io.sockets.socket(socketid).emit('message', 'for your eyes only'); // sending to individual socketid
*/

/*user list
Format:[
	{
		name:"",
		img:"",
		socketid:""
	}
]
*/
var roomUser = {};

var userList = [];

//var socketList = [];
io.on('connection',function(socket){
    var url = socket.request.headers.referer;
    var split_arr = url.split('/');
    var roomid = split_arr[split_arr.length-1] || 'index';

	//login function
	socket.on('login',function(user){

		user.id = socket.id;
		// userList.push(user);
        if(!roomUser[roomid]) {
            roomUser[roomid] = [];
        }
        roomUser[roomid].push(user);
		//socketList.push(socket);
		//send the userlist to all client

		// io.emit('userList',roomUser[roomid]);
        socket.join(roomid);
        io.to(roomid).emit('userList',roomUser[roomid]);
        socket.emit('userList',roomUser[roomid]);
		userList = roomUser[roomid];
		//send the client information to client
		socket.to(roomid).emit('userInfo',user);
		//send login info to all.
		socket.to(roomid).broadcast.emit('loginInfo',user.name+"上线了。");
	});

	//log out
	socket.on('disconnect',function(){
		var user = _.findWhere(roomUser[roomid],{id:socket.id});
		if(user){
            roomUser[roomid] = _.without(roomUser[roomid],user);
			//socketList = _.without(socketList,socket);
			//send the userlist to all client
            io.to(roomid).emit('userList',roomUser[roomid]);
			//send login info to all.
            socket.to(roomid).broadcast.emit('loginInfo',user.name+"下线了。");
		}
	});

	//send to all
	socket.on('toAll',function(msgObj){
		/*
			format:{
				from:{
					name:"",
					img:"",
					id:""
				},
				msg:""
			}
		*/
        socket.to(roomid).broadcast.emit('toAll',msgObj);
	});
	//sendImageToALL
	socket.on('sendImageToALL',function(msgObj){
		/*
			format:{
				from:{
					name:"",
					img:"",
					id:""
				},
				img:""
			}
		*/
        socket.to(roomid).broadcast.emit('sendImageToALL',msgObj);
	})


	//send to one
	socket.on('toOne',function(msgObj){
		/*
			format:{
				from:{
					name:"",
					img:"",
					id:""
				},
				to:"",  //socketid
				msg:""
			}
		*/
		//var toSocket = _.findWhere(socketList,{id:msgObj.to});
		var toSocket = _.findWhere(io.sockets.sockets,{id:msgObj.to});
		console.log(toSocket);
		toSocket.emit('toOne', msgObj);
	});
});

exports.listen = function(_server){
	io.listen(_server);
};