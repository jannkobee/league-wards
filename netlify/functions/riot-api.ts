import axios from "axios";
import { getAccountRegionalRouting, getMatchRegionalRouting } from "../../src/utils/riotRouting";

type QueryParameters = Record<string, string | undefined>;

export const handler = async (event: { queryStringParameters: QueryParameters | null }) => {
  const query = event.queryStringParameters ?? {};
  const { endpoint, gameName, tagLine, pUuid, regionCode, matchId } = query;
  if (!endpoint) return response(400, { error: "Missing endpoint parameter" });

  let url: string;
  const platform = regionCode?.toLowerCase();
  switch (endpoint) {
    case "account":
      if (!gameName || !tagLine) return response(400, { error: "Missing gameName or tagLine parameter" });
      url = `https://${getAccountRegionalRouting(regionCode ?? "asia")}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      break;
    case "league":
      if (!pUuid || !platform) return response(400, { error: "Missing pUuid or regionCode parameter" });
      url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(pUuid)}`;
      break;
    case "summoner":
      if (!pUuid || !platform) return response(400, { error: "Missing pUuid or regionCode parameter" });
      url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(pUuid)}`;
      break;
    case "matches": {
      if (!pUuid || !regionCode) return response(400, { error: "Missing pUuid or regionCode parameter" });
      const search = new URLSearchParams({ start: query.start ?? "0", count: query.count ?? "10" });
      if (query.queue) search.set("queue", query.queue);
      url = `https://${getMatchRegionalRouting(regionCode)}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(pUuid)}/ids?${search}`;
      break;
    }
    case "match":
      if (!matchId || !regionCode) return response(400, { error: "Missing matchId or regionCode parameter" });
      url = `https://${getMatchRegionalRouting(regionCode)}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
      break;
    default:
      return response(400, { error: "Invalid endpoint parameter" });
  }

  try {
    const result = await axios.get(url, { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } });
    return response(200, result.data);
  } catch (error) {
    if (axios.isAxiosError(error)) return response(error.response?.status ?? 500, error.response?.data);
    return response(500, { error: "Internal server error" });
  }
};

function response(statusCode: number, body: unknown) {
  return { statusCode, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) };
}
