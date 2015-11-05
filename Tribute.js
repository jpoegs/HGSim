class Tribute {
	
	private var name;
	private var killCount;
	private var killNames;
	
	constructor(name) {
		this.name = name;
		killCount = 0;
		killNames = {};
	}
	
	public function getName() {
		return name;
	}
	
	public function setName(name) {
		this.name = name;
	}
	
	public function getKillCount() {
		return name;
	}
	
	public function setKillCount(killCount) {
		this.killCount = killCount;
	}
	
	public function getKillNames() {
		return killNames;
	}
	
	public function addKill(name) {
		killNames.push(name);
	}
}