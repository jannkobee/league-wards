import axios from "axios";

exports.handler = async (event) => {
  const { endpoint, gameName, tagLine, pUuid, regionCode } = event.queryStringParameters;

  if (!endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing endpoint parameter" }),
    };
  }

  try {
    let url;

    switch (endpoint) {
      case "account":
        if (!gameName || !tagLine) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing gameName or tagLine parameter" }),
          };
        }
        url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
        break;

      case "league":
        if (!pUuid || !regionCode) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing pUuid or regionCode parameter" }),
          };
        }
        url = `https://${regionCode}.api.riotgames.com/lol/league/v4/entries/by-puuid/${pUuid}`;
        break;

      case "summoner":
        if (!pUuid || !regionCode) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing pUuid or regionCode parameter" }),
          };
        }
        url = `https://${regionCode}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${pUuid}`;
        break;

      case "matches":
        if (!pUuid || !regionCode) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing pUuid or regionCode parameter" }),
          };
        }
        url = `https://${regionCode}.api.riotgames.com/lol/match/v5/matches/by-puuid/${pUuid}/ids`;
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid endpoint parameter" }),
        };
    }

    // Your API key is safe here on the server
    const response = await axios.get(url, {
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY, // Only server can see this
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: error.response?.data || "Internal server error",
      }),
    };
  }
};
