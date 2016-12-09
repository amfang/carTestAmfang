/*
 var express = require("express");

 // cfenv provides access to your Cloud Foundry environment
 // for more info, see: https://www.npmjs.com/package/cfenv
 var cfenv = require("cfenv");

 // create a new express server
 var app = express();

 //add http&socket module
 var http = require("http").Server(app);
 var io = require("socket.io")(http);

 // serve the files out of ./public as our main files
 app.use(express.static(__dirname + "/public"));


 io.on("connection",function(socket){

 socket.on("String",function(key){
 if(key == "w" || key == "s" || key == "a" || key == "d"){
 console.log("Received " + key + " from frontend");

 //************************
 //fill in a method "io.sockets.emit(param1,param2)" in line 35
 //The first parameter is the data type "message", the second parameter is the data you want to send
 io.sockets.emit("message", key);
 }
 else{
 console.log("Not a direction order");
 }
 });

 });

 // get the app environment from Cloud Foundry
 var appEnv = cfenv.getAppEnv();

 // start server on the specified port and binding host

 http.listen(appEnv.port, "0.0.0.0", function() {
 // print a message when the server starts listening
 console.log("server starting on " + appEnv.url + " " + appEnv.port);
 });

 */

/*
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.send('<h1>Welcome Realtime Server</h1>');
});
*/
var express = require("express");

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require("cfenv");

// create a new express server
var app = express();

//add http&socket module
var http = require("http").Server(app);
var io = require("socket.io")(http);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + "/public"));

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

io.on('connection', function(socket){
	console.log('a user connected');

	//监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;

		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}

		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+'加入了聊天室');
	});

	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};

			//删除
			delete onlineUsers[socket.name];
			//在线人数-1
			onlineCount--;

			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
	});

	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username+'说：'+obj.content);
	});

});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host

http.listen(appEnv.port, "0.0.0.0", function() {
	// print a message when the server starts listening
	console.log("server starting on " + appEnv.url + " " + appEnv.port);
});

/*
http.listen(3000, function(){
	console.log('listening on *:3000');
});
*/
