var express = require('express');
var util = require('util');
var session = require('express-session');
var app = express();
var connect = require('connect');
//var game = require('./HungerGames');

// app.set('view engine', 'jade');
// app.set('view options', {layout: false});

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

var server = app.listen(8080, function() {
	var host = server.address().address,
		port = server.address().port;
	console.log('App running at http://%s%s', host, port);
});

var io = require('socket.io').listen(server);

var mysql = require("mysql");

// Creates a connection to the database
 /*
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "WmVagQX%#p87",
  multipleStatements: true
}); */

var pool = mysql.createPool({
	connectionLimit: 1000,
	host: "localhost",
	user: "root",
	password: "WmVagQX%#p87",
	multipleStatements: true
});
/*
con.getConnection(function(err, con) {
  if(err) {
    console.log('Error connecting to database');
    return;
  }
  console.log('Connection to the database successfully established');
});*/

//con.query('CREATE DATABASE HungerGames');
pool.getConnection(function(err, con) {
	con.query("USE HungerGames", function(err, res){
		con.release();
	});
});

var sessions = [];

var Session = function(maxPlayers) {
	this.maxPlayers = maxPlayers;
	this.players = [];
	this.sessionID = randomGameSession();
	this.startGame = true;
	this.currentPlayers = 0;
	this.day = 0;
	this.timeOfDay = "12:00:00";
	this.messageLog = "Welcome to the chat! \n";
}

var Player = function(socket, socketID, name, sessionID) {
	this.socket = socket;
	this.socketID = socketID;
	this.name = name;
	this.sessionID = sessionID;
	this.inventory = [];
	this.numOfKills = 0;
	this.namesOfKills = [];
	this.timeOfDeath = "12:00:00";
};

function addSession(maxPlayers) {
	var session = new Session(maxPlayers);
	sessions.push(session);
	console.log("Added game to array...");
	return session;
}

Session.prototype.addPlayer = function(socket, socketID, name) {
	var nplayer = new Player(socket, socketID, name);
	this.players.push(nplayer);
	this.currentPlayers++;
	console.log("Added player named: " + name + " with socketID: " + socketID);
	return nplayer;
};

Session.prototype.leaveGameSession = function(socketID) {
	this.removePlayer(socketID);
};

Session.prototype.removePlayer = function(socketID) {
	for( var k = 0; k < this.players.length; k++ ){
		if(this.players[k].socketID == socketID) {
			var rplayer = this.players[k];
			this.players.splice(k, 1);
			console.log("Player left the game...");
			if(this.players.length == 0) {
				
			}
			return rplayer;
		}
		else {
			console.log("Player not found...");
		}
	}
};

Session.prototype.getNames = function() {
	var names = [];
	for(var i = 0; i < this.players.length; i++) {
		names.push(this.players[i].name);
	}
	return names;
};

Session.prototype.getSocketIDs = function() {
	var socketIDs = [];
	for(var i = 0; i < this.players.length; i++) {
		socketIDs.push(this.players[i].socketID);
	}
	return socketIDs;
};

Session.prototype.isGameJoinable = function() {
	if(this.startGame == true) {
		return true;
	}
	return false;
};

function randomGameSession() {
	console.log('RandomGameSession');
	var chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
	var id = "";

	for(var i = 0; i < 8; i++) {
		id += chars.charAt(Math.random() * chars.length);
	}
	for(var i = 0; i < sessions.length; i++) {
		if(sessions.sessionID == id) {
			return randomGameSession();
		}
	}
	return id;
}

function getSession(sessionID) {
	for( var i = 0; i < sessions.length; i++ ) {
		if(sessions[i].sessionID == sessionID) {
			return sessions[i];
		}
	}
	return false;
}

function getSessionBySocketID(socketID) {
	for( var i = 0; i < sessions.length; i++ ) {
		for( var k = 0; k < sessions[i].players.length; k++ ) {
			if(sessions[i].players[k].socketID == socketID) {
				return sessions[i];
			}
		}
	}
	console.log("Unable to find session with socketID: " + socketID);
	return false;
}

function removeSession(sessionID) {
	for(var i = 0; i < sessions.length; i+=) {
		if(session[i].sessionID == sessionID) {
			sessions.splice(i, 1);
			console.log("Successfully removed session with sessionID: " + sessionID);
			return true;
		}
	}
	console.log("Could not find session to remove with sessionID: " + sessionID);
	return false;
}

function startGame(sessionID) {
	var session = getSession(sessionID);
	session.startGame = false;
	io.to(sessionID).emit('initialize-game');
	io.to(sessionID).emit('question', "This is a question", "Answer 1", "Answer 2", "Answer 3", "Answer 4");
	timer(sessionID, 15);
}

function timer(sessionID, seconds) {
	var timeLeft = seconds;
	io.to(sessionID).emit('timer', timeLeft);
	
	var interval = setInterval(function() {
		io.to(sessionID).emit('timer', timeLeft);
		timeLeft--;
	}, 1000);
	
	setTimeout(function() {
		clearInterval(interval);
		getNextQuestion(sessionID)
	}, seconds * 1000);
}

function getNextQuestion(sessionID) {
	io.to(sessionID).emit('question', "This is a question", "Answer 1", "Answer 2", "Answer 3", "Answer 4");
	timer(sessionID, 15);
}

var items = 


//io.set('heartbeat interval', 8);
//io.set('heartbeat timeout', 15);

io.on('connection', function(socket) {

	console.log('Connection established');

	socket.on('create-game', function(data) {
		console.log("Attempting to create game..." + data);
		var session = addSession(data.playerCount);
		socket.join(session.sessionID);
		var nplayer = session.addPlayer(socket, socket.id, data.playerName);
		var name = nplayer.name;
		var socketID = nplayer.socketID;
		var sessionID = session.sessionID;
		socket.emit('connection-response', 1);
		socket.emit('new-player', name, socketID);
		socket.emit('store-session', sessionID, socketID);
		console.log("Finished creating a new game session with id: " + sessionID);
		socket.emit('server-message', session.messageLog);
	});
	
	socket.on('send-message', function(id, message) {
		io.to(id).emit('recieve-message', message);
	});
	
	socket.on('isValidGameSession', function(sessionID) {
		var session = getSession(sessionID);
		var join = session.isGameJoinable();
		console.log("This game is " + join);
		socket.emit('get-validation', join);
	});
	
	//io.emit("User connected", players)
	
	socket.on('join-game', function(data) {
		console.log("SessionID joining... " + data.sessionID);
		var session = getSession(data.sessionID);
		socket.join(data.sessionID);
		var nplayer = session.addPlayer(socket, socket.id, data.playerName);
		var names = session.getNames();
		var socketIDs = session.getSocketIDs();
		var name = nplayer.name;
		var socketID = nplayer.socketID;
		socket.emit('connection-response', 1);
		socket.emit('get-all-players', names, socketIDs);
		console.log("The players in this game session are: " + names);
		io.to(data.sessionID).emit('new-player', name, socketID);
		socket.emit('store-session', data.sessionID, socketID);
		socket.emit('server-message', session.messageLog);
		socket.emit('server-message', name + " joined the game!");
	});
	
	socket.on('get-players', function(sessionID) {
		var session = getSession(sessionID);
		var names = session.getNames();
		var socketIDs = session.getSocketIDs();
		io.to(sessionID).emit('get-all-players', names, socketIDs);
	});
	
	socket.on('start-game', function(data) {
		if(data.host == "true") {
			startGame(data.sessionID);
		}
	});

	socket.on('send-message', function(message, sess, name) {
		var session = getSession(sess);
		session.messageLog += name + ": " + message + "\n";
		console.log("MESSAGE SENT!!");
		io.to(sess).emit('receive-message', name, message);
		console.log("Message from " + name + " on " + sess + ": " + message);
	});

	socket.on('remove-player', function(sessionID, socketID) {
		if(typeof socketID == "undefined" || socketID == "" || socketID == null) {
			console.log("No player data to remove...");
			return;
		}
		var session = getSession(sessionID);
		if(session != false) {
			var rplayer = session.removePlayer(socketID);
			var name = rplayer.name;
			io.to(sessionID).emit('player-left', socketID);
			socket.emit('server-message', name + " joined the game!");
			console.log('Player left. Removing player...');
		}
		else {
			console.log('Error in removing player by sessionID and socketID...');
		}
	});
	socket.on("disconnect", function() {
		console.log("Trying to remove: " + socket.id);
		var session = getSessionBySocketID(socket.id);
		if(session != false) {
			session.leaveGameSession(socket.id);
			console.log('Player left. Removing player...');
		}
		else {
			console.log('Error in removing player by socketID...');
		}
		console.log('Connection terminated');
	});
	
});
