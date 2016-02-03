CREATE TABLE sessions (
	sessionsID varchar(8) NOT NULL,
	startGame tinyint NOT NUll,
	maxPlayers int NOT NULL,
	currentPlayers int NOT NULL,
	biome varchar,
	day varchar
)

CREATE TABLE questions (
	question varchar NOT NULL,
	choice varchar
)