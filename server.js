var express = require('express');
var util = require('util');
var session = require('express-session');
//var http = require('http')
//var mysql = require('sql')
var app = express();
//var server = http.createServer(app)
var connect = require('connect');
//var cookieParser = require('cookie-parser')
//var MemoryStore = connect.middleware.session.MemoryStore
var game = require('./HungerGames');

// app.set('view engine', 'jade');
// app.set('view options', {layout: false});

app.use(express.static(__dirname + '/public'));

//app.use(cookieParser());
//app.use(session({
//  secret: 'secret'
//, key: 'express.sid'
//, store: store = new MemoryStore()
//}));

app.get('/', function (req, res) {
  //res.render('index', {value: req.session.value});
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
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  multipleStatements: true
});

con.connect(function(err) {
  if(err) {
    console.log('Error connecting to database');
    return;
  }
  console.log('Connection to the database successfully established');
});

//con.query('CREATE DATABASE HungerGames');
con.query('USE HungerGames');

/*
con.query('ALTER TABLE sessions ADD (\
	startGame tinyint NOT NUll, \
	maxPlayers int NOT NULL, \
	currentPlayers int NOT NULL, \
	biome varchar(100), \
	day varchar(100),\
	PRIMARY KEY(sessionsID))',
	function(err, result) {
		if(err) {
			console.log(err);
		}
		else {
			console.log('Sessions table successfully created');
		}
	}); */



//con.query('CREATE TABLE questions (question varchar(1000) NOT NULL) ' );

/*
//var sessDB = require('./SessionDataBase');
con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});
*/
function getData(data, callback) {
	callback(data);
}

function createGameSession(d) {
	getData(d, function(data) {
		gameSessionExists(data.sessionID, function(err1, res1) {
			if(err1) {
				console.log(err1);
				throw err1;
			}
			else {
				if( res1.length > 0 ) {
					console.log('Game session already exists');
					data.sessionID = randomGameSession();
					//console.log(res1);
					createGameSession(data);
				}
				else {
					var sessionData = {sessionsID: data.sessionID, startGame: 1, maxPlayers: data.playerCount, currentPlayers: 1};
					var playerTable = 'CREATE TABLE ' + data.sessionID + ' (name varchar(100) NOT NULL, socketID varchar(100) NOT NULL, inventory varchar(1000), numOfKills int, namesOfKills varchar(1000), timeOfDeath varchar(100))';
					var playerData = {name: data.playerName, socketID: data.socket.id};

					con.query('INSERT INTO sessions SET ?', sessionData, function(err2, res2) {
						if(err2) {
							console.log(err2);
							throw err2;
						}
						else {
							console.log('Inserted ' + data.sessionID + ' into session table.');
							con.query(playerTable, function(err3, res3) {
								if(err3) {
									console.log(err3);
									throw err3;
								}
								else {
									console.log('Created player table for ' + data.sessionID + ' session');
									con.query('INSERT INTO ' + data.sessionID + ' SET ?', playerData, function(err4, res4) {
										if(err4) {
											console.log("0");
											console.log(err4);
											throw err4;
										}
										else {
											console.log('Inserted ' + data.playerName + ' into ' + data.sessionID + ' player table.');
											var id = data.sessionID;
											var num = data.playerCount;
											var name = data.playerName;
											data.socket.join(id);
											io.to(id).emit('connection-response', 1);
											io.to(id).emit('store-session', data.sessionID, data.socket.id);
											io.to(id).emit('new-player', data.playerName, data.socket.id);
											console.log('Random game session successfully created');
										}
									});
								}
							});
						}
					});
				}
			}
		});
	});
}

function randomGameSession() {
	console.log('RandomGameSession');
	var chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
	var session = "";
	
	for(var i = 0; i < 8; i++) {
		session += chars.charAt(Math.random() * chars.length);
	}
	
	//console.log('New randomGameSession: ' + session);
	
	//d = new Date();
	//d.setTime(d.getDay() + 1);
	//data.setItem("sessionID", session);
	//data.setitem("date", d);
	//document.redirect("PlayGame.html");
	//document.getElementById("result").innerHTML = session;
	return session;
}


function gameSessionExists(sess, callback) {
	//console.log('Ran validation for: ' + sess);
	
	if( sess == "00000000" ) {
		callback();
	}
	
	var sessSQL = 'SELECT * FROM sessions WHERE sessionsID = ' + con.escape(sess);
	con.query( sessSQL,
	function(err, res) {
		//console.log(res);
		callback(err, res);
	});
}

function isGameStarting(sess, callback) {
	
	var sessSQL = 'SELECT * FROM sessions WHERE sessionsID = ' + con.escape(sess) + ' AND startGame = 1 AND currentPlayers < maxPlayers';
	con.query( sessSQL, 
	function(err, res) {
		callback(err, res);
	});
}

function getPlayers(sess, callback) {
	var sessSQL = 'SELECT * FROM ' + sess;
	con.query( sessSQL, 
	function(err, res) {
		console.log('Getting players for ' + sess);
		callback(err, res);
	});
}

function getPlayerData(res, sock, callback) {
	callback(res, sock);
}

function findPlayer(sess, socket) {
	getPlayerData(sess, socket, function(sess, sock) {
		var delName = 'DELETE FROM ' + sess + ' WHERE socketID = ' + con.escape(sock);
		con.query(delName, function(err2, res2) {
			if(err2) {
				console.log('1');
				console.log(err2);
				throw err2;
			}
			else {
				if(res2.affectedRows > 0) {
					var sessSQL = 'UPDATE sessions SET currentPlayers = currentPlayers - 1 WHERE sessionsID = ' + con.escape(sess);
					console.log('3');
					con.query(sessSQL, function(err3, res3) {
						if(err3) {
							console.log(err3);
							throw err3;
						}
						else {
							console.log('Player left from ' + sess);
							io.to(sess).emit('player-left', sock);
						}
					});
				}
			}
		});
	});
}

function leaveGameSession(s) {
	getData(s, function(sock) {
		var search = 'SELECT * FROM sessions';
		con.query(search, function(err, res) {
			if(err) {
				console.log(err);
				throw err;
			}
			else {
				for(var i = 1; i < res.length; i++) {
					findPlayer(res[i].sessionsID, sock);
				}
			}
		});
	});
}

function joinGameSession(data) {
	var sessSQL = 'UPDATE sessions SET currentPlayers = currentPlayers + 1 WHERE sessionsID = ' + con.escape(data.sessionID) + ' AND startGame = 1 AND currentPlayers < maxPlayers';
	con.query(sessSQL, function(err, res) {
		if(err) {
			console.log(err);
		}
		else {
			var addName = {name: data.playerName, socketID: data.socket.id};
			con.query('INSERT INTO ' + data.sessionID + ' SET ?', addName, function(err2, res2) {
				if(err2) {
					console.log(err2);
				}
				else {
					getPlayers(data.sessionID, function(err3, res3) {
						if(err) {
							console.log(err3);
							throw err3;
						}
						else {
							var playerNames = [];
							var playerSockets = [];
							
							for(var i = 0; i < res3.length; i++) {
								playerNames.push(res3[i].name);
								playerSockets.push(res3[i].socketID);
							}
							
							console.log('The players in ' + data.sessionID + ' are ' + playerNames);
							io.to(data.sessionID).emit('store-session', data.sessionID, data.socket.id)
							io.to(data.sessionID).emit('get-all-players', playerNames, playerSockets);;
							io.to(data.sessionID).emit('new-player', data.playerName, data.socket.id);
							console.log(data.playerName + ' has joined ' + data.sessionID);
						}
					});
				}
			});
		}
	});
}

io.on('connection', function(socket) {

	socket.on('create-game', function(d) {
		d.socket = socket;
		createGameSession(d);
		//game.hungerGame(id, num, name);
	});
	
	socket.on('isValidGameSession', function(sess) {
		isGameStarting(sess, function(err, res) {
			console.log('Starting...');
			console.log(res);
			if(err) {
				console.log(err);
				throw err;
			}
			else {
				if( res.length > 0 ) {	
					console.log('You can join that game!');
					socket.emit('getValidation', true)
				}
				else {
					console.log('Cant join that game');
				}
			}
		});
	});
	
	console.log('Player connnected successfully');
	
	//io.emit("User connected", players)
	
	socket.on('join-game', function(data) {
		data.socket = socket;
		socket.join(data.sessionID);
		joinGameSession(data);
		//data.sessionID = session;
		//data.playerName = name;
		
	});
	
	socket.on('get-players', function(sess) {
		getPlayers(sess, function(err, res) {
			if(err) {
				console.log(err);
				throw err;
			}
			else {
				console.log(res);
				io.to(ses).emit('get-all-players', res);
			}
		});
	});
	
	socket.on("disconnect", function() {
		leaveGameSession(socket.id);
		console.log('User disconnected');
	});
	
});



/*
io.listen(app).set('authorization', function (data, accept) {
  if (!data.headers.cookie) 
    return accept('No cookie transmitted.', false);

  data.cookie = cookieParser(data.headers.cookie);
  data.sessionID = data.cookie['express.sid'];

  store.load(data.sessionID, function (err, session) {
    if (err || !session) return accept('Error', false);

    data.session = session;
    return accept(null, true);
  });
}).sockets.on('connection', function (socket) {
  var sess = socket.handshake.session;
  socket.log.info(
      'a socket with sessionID'
    , socket.handshake.sessionID
    , 'connected'
  );
  socket.on('set value', function (val) {
    sess.reload(function () {
      sess.value = val;
      sess.touch().save();
    });
  });
}); */
