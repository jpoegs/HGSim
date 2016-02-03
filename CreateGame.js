var mysql = require("mysql");
var io = require("socket.io").listen(3000)

// Creates a connection to the database
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password"
});

con.connect(function(err) {
  if(err) {
    console.log('Error connecting to database');
    return;
  }
  console.log('Connection successfully established');
});

con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});

function randomGameSession() {
	console.log('RandomGameSession');
	if(localStorage.sessionID == undefined || !isValidGameSession(localStorage.sessionID)) {
		var chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
		var session = "";
		console.log('Local storage defined');
		for(var i = 0; i < 8; i++) {
			session += chars.charAt(Math.random() * chars.length);
		}
		
		if( !isValidGameSession(session)) {
			randomGameSession();
		
		d = new Date();
		d.setTime(d.getDay() + 1);
		localStorage.setItem("sessionID", session);
		localStorage.setitem("date", d);
		document.redirect("PlayGame.html");
		document.getElementById("result").innerHTML = session;
	} 
	else {
		console.log('Local storage not defined');
		var x = localStorage.sessionID;
		document.getElementById("result").innerHTML = x;
	}
	return localStorage.sessionID
}

function isValidGameSession(sess) {
	con.query('SELECT sessionsID FROM sessions WHERE sessionsID LIKE sess',
	function(err, res){
		if(err)
			console.log('Error Game Session');
			return false;
			throw err;
		else
			if( res > 0 )
				console.log('Game session already exists');
				return false;
			else
				console.log('Game session is good');
				return true;
	});
}

var players = 0

io.on('connection', function(socket) {
	players++
	console.log('Player connnected successfully');
	var id = randomGameSession()
	var num = document.getElementById("playerCount").value
	var name = document.getElementById("tributeName").value
	
	HungerGame(id, num, name)
	
	io.sockets.emit.("users connected", players)
	
	socket.on("disconnect", function() {
		players--
		io.sockets.emit("users conneced", players)
	})
}



function hostCreateNewGame() {
	var 
	
}

