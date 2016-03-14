
var con;
var io;
var sessions = [];

function addSession(maxPlayers) {
	var sess = new session(maxPlayers);
	sessions.push(sess);
	return sess.sessionID;
}

function addPlayer(socket, socketID, name, sessionID) {
	for(var i = 0; i < sessions.length; i++) {
		if(sessions[i].sessionID == sessionID) {
			var nplayer = new player(socket, socketID, name, sessionID);
			sessions[i].players.push();
			sessions[i].currentPlayers++;
			socket.emit('new-player', nplayer);
			break;
		}
	}
}

function leaveGameSession(socketID) {
	for(var i = 0; i < sessions.length; i++) {
		removePlayer(sessions[i], socketID);
	}
}

function removePlayer(sessionID, socketID) {
	for(var i = 0; i < sessions.length; i++) {
		if(sessions[i].sessionID == sessionID) {
			for( var k = 0; k < sessions.players.length; k++ ){
				if(sessions[i].players[k].socketID == socketID) {
					sessions[i].players[k].socket.emit('player-left', sessions[i].players[k].socketID);
					sessions[i].players[k].splice(k, sessions.players.length);
					console.log("Player left the game...");
					break;
				}
				else {
					console.log("Player not found...");
				}
			}
			break;
		}
	}
}

function getAllPlayers(sessionID) {
	for(var i = 0; i < sessions.length; i++) {
		if(sessions.sessionID == sessionID) {
			io.to(sessionID).emit('get-all-players', sessions[i].players);
			break;
		}
	}
}

function session(maxPlayers) {
	this.maxPlayers = maxPlayers;
	this.players = [];
	sessionID = randomGameSession();
	startGame = true;
	currentPlayers = 0;
	day = 0;
	timeOfDay = "12:00:00";
}

function isGameJoinable(sessionID) {
	for(var i = 0; i < sessions.length; i++)
	{
		if(sessions[i].sessionID == session) {
			if(sessions[i].startGame = true) {
				return true;
			}
			else {
				return false;
			}
		}
	}
	return false;
}

function randomGameSession() {
	console.log('RandomGameSession');
	var chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
	var session = "";

	for(var i = 0; i < 8; i++) {
		session += chars.charAt(Math.random() * chars.length);
	}
	for(var i = 0; i < sessions.length; i++)
	{
		if(sessions.sessionID == session) {
			return randomGameSession();
		}
	}
	return session;
}

function player(socket, socketID, name, sessionID) {
	this.socket = socket;
	this.socketID = socketID;
	this.name = name;
	this.sessionID = sessionID;
	this.inventory = [];
	this.numOfKills = 0;
	this.namesOfKills = [];
	this.timeOfDeath = "12:00:00";
}

function setVars(sql, sockio) {
	con = sql;
	io = sockio;
}

function hungerGame(id, num, name) {
	numberOfTributes = num;
	sessionID = id;
}

function iintGame(sessionID) {
	var startGame = 'UPDATE sessions SET startGame = 0 WHERE sessionsID = ' + con.escape(sessionID);
	
	con.query(startGame, function(err, res) {
		if(err) {
			console.log(err);
			throw err;
		}
		else {
			io.to(sessionID).emit('start-game');
			cornacopia(sessionID);
		}
	});
}

function cornacopia(sessionID) {
	var corn = 'SELECT * FROM cornacopia';
	getSessionID( sessionID, function(id) {
		con.query(corn, function(err, res) {
			if(err) {
				console.log(err);
				throw err;
			}
			else {
				var cEvent = res[Math.random() * res.length];
				io.to(id).emit('event', cEvent);
				wait(id);
			}
		});
	});
}

function wait(sessionID) {
	getSessionID(sessionID, function(id) {
		setTimeout(function() {
			io.to(id).emit('end-event');
		}, 10000 );
	});
	
}

function getRandomEvent(sessionID) {
	var eventQuery = 'SELECT * FROM questions';
	getSessionID(sessionID, function(id) {
		con.query(eventQuery, function(err, res) {
			if(err) {
				console.log(err);
				throw err;
			}
			else {
				var rEvent = res[Math.random() * res.length];
				io.to(id).emit('event', rEvent);
				wait(id)
			}
		});
	});
}

function getRandomDisaster(sessionID) {
	var disasterQuery = 'SELECT * FROM disastors';
	getSessionID(sessionID, function(id) {
		con.query(disasterQuery, function(err, res) {
			if(err) {
				console.log(err);
				throw err;
			}
			else {
				var dEvent = Math.random() * res.length;
				io.to(id).emit('event', dEvent);
				wait(id);
			}
		});
	});
}

function getSessions(socketID, callback) {
	var query = 'SELECT * FROM sessions';
	
	con.query(query, function(err, res) {
		if(err) {
			console.log(err);
			throw err;
		}
		else {
			callback(res);
		}
	});
}

function getSessions(socketID) {
	getSessions(socketID, function(results) {
		
		for(var i = 0; results.length; i++) {
			getSession(results[i].sessionsID);
		}
		
		function getSession(sess) {
			var deathTime = new Date();
			var deathQuery = 'UPDATE ' + con.escape(sess) + ' SET timeOfDeath ' + deathTime + ' WHERE socketID = ' + socketID;
			con.query()
		}
	});
}

function getSessionID(sessionID, callback) {
	callback(sessionID);
}