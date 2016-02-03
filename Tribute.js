var name;
var player = 0;
var killCount;
var killNames;

function tribute(n) {
	name = n;
	killCount = 0;
	killNames = {};
	player++;
}

function getName() {
	return name;
}

function setName(name) {
	this.name = name;
}

function getPlayer() {
	return player;
}

function setPlayer(player) {
	this.player = player;
}

function getKillCount() {
	return killCount;
}

function setKillCount(killCount) {
	this.killCount = killCount;
}

function getKillNames() {
	return killNames;
}

function addKill(name) {
	killNames.push(name);
	killCount++;
}
