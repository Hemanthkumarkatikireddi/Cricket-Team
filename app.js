const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//Get All players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//Get Player PlayerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerId = `
    SELECT
    *
    FROM cricket_team
    WHERE
        player_id=${playerId};`;
  const dbResponse = await database.get(getPlayerId);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

//Post Player API
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const playerQuery = `
  INSERT INTO 
        cricket_team(player_name, jersey_number, role ) 
  VALUES 
        ('${playerName}', ${jerseyNumber}, '${role}');`;
  const dbResponse = await database.run(playerQuery);
  response.send("Player Added to Team");
});

//Put PLyer API
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const playersArray = `
  UPDATE 
        cricket_team
    SET
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
    WHERE 
        player_id=${playerId};`;
  await database.run(playersArray);
  response.send("Player Details Updated");
});

//Delete player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerArray = `
  DELETE FROM
    cricket_team
  WHERE player_id=${playerId};`;
  await database.run(playerArray);
  response.send("Player Removed");
});

module.exports = app;
