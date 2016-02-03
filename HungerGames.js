
var numberOfTributes;
var sessionID;

function hungerGame(id, num, name) {
	numberOfTributes = num;
	sessionID = id;
	waitForPeopleToJoin();
	
	/*
	CREATE TABLE 'id' (
	name varchar,
	inventory  varchar,
	numOfKills int,
	namesOfKills varchar,
	timeOfDeath varchar,
	)

	INSERT INTO 'id' (name) VALUES
		(name);
	*/
}

function waitForPeopleToJoin() {
	
	
	
}

function test() {
	var t = Tribute("Jeff");
	var b = t.getPlayer();
	document.getElementById("tester").innerHTML = b;
}
