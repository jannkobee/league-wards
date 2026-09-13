export interface RiotAccountDto {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface SummonerDto {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface LeagueEntryDto {
  leagueId: string;
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | string;
  tier: string;
  rank: string;
  summonerId: string;
  puuid: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface PerkStyleSelectionDto {
  perk: number;
  var1?: number;
  var2?: number;
  var3?: number;
}

export interface PerkStyleDto {
  description: string;
  selections: PerkStyleSelectionDto[];
  style: number;
}

export interface PerksDto {
  statPerks?: {
    defense: number;
    flex: number;
    offense: number;
  };
  styles: PerkStyleDto[];
}

export interface ObjectiveDto {
  first: boolean;
  kills: number;
}

export interface ObjectivesDto {
  baron?: ObjectiveDto;
  champion?: ObjectiveDto;
  dragon?: ObjectiveDto;
  horde?: ObjectiveDto;
  inhibitor?: ObjectiveDto;
  riftHerald?: ObjectiveDto;
  tower?: ObjectiveDto;
}

export interface TeamDto {
  bans: { championId: number; pickTurn: number }[];
  objectives?: ObjectivesDto;
  teamId: number;
  win: boolean;
}

export interface ParticipantDto {
  assists: number;
  baronKills?: number;
  bountyLevel?: number;
  champExperience?: number;
  champLevel: number;
  championId: number;
  championName: string;
  deaths: number;
  doubleKills?: number;
  dragonKills?: number;
  firstBloodKill?: boolean;
  gameEndedInEarlySurrender?: boolean;
  gameEndedInSurrender?: boolean;
  goldEarned: number;
  individualPosition?: string;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number; // Trinket
  kills: number;
  lane?: string;
  neutralMinionsKilled: number;
  perks: PerksDto;
  profileIcon?: number;
  puuid: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  role?: string;
  summoner1Id: number;
  summoner2Id: number;
  summonerId?: string;
  summonerLevel?: number;
  summonerName?: string;
  teamEarlySurrendered?: boolean;
  teamId: number;
  teamPosition?: string;
  timePlayed?: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  visionScore: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
}

export interface MatchInfoDto {
  endOfGameResult?: string;
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp?: number;
  gameId: number;
  gameMode: string;
  gameName?: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: ParticipantDto[];
  platformId: string;
  queueId: number;
  teams: TeamDto[];
  tournamentCode?: string;
}

export interface MatchMetadataDto {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

export interface MatchDto {
  metadata: MatchMetadataDto;
  info: MatchInfoDto;
}

export interface ChampionSummaryStats {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
}

export interface MatchSummaryStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kdaRatio: number;
  avgVisionScore: number;
  avgWardsPlaced: number;
  avgControlWards: number;
  avgWardsKilled: number;
  avgCs: number;
  topChampions: ChampionSummaryStats[];
}

export interface ChampionOverviewDto {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: {
    full: string;
    sprite: string;
  };
  tags: string[];
  partype: string;
  stats: Record<string, number>;
}

export interface ChampionSpellDto {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  cooldownBurn: string;
  costBurn: string;
  costType?: string;
  image: {
    full: string;
  };
}

export interface ChampionPassiveDto {
  name: string;
  description: string;
  image: {
    full: string;
  };
}

export interface ChampionSkinDto {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

export interface ChampionDetailDto {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
  lore: string;
  blurb: string;
  spells: ChampionSpellDto[];
  passive: ChampionPassiveDto;
  skins: ChampionSkinDto[];
  tags: string[];
  partype: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
}

export interface ItemGoldDto {
  base: number;
  total: number;
  sell: number;
  purchasable: boolean;
}

export interface ItemDto {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  colloq?: string;
  into?: string[];
  from?: string[];
  image: {
    full: string;
  };
  gold: ItemGoldDto;
  tags: string[];
  stats: Record<string, number>;
  depth?: number;
}
