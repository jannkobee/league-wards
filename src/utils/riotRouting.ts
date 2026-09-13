/**
 * Resolves the platform routing code (e.g., 'euw1', 'na1', 'sg2') to the regional routing code
 * for Riot Account-V1 ('americas', 'asia', 'europe').
 * Note: 'sea' is NOT a valid Account-V1 host and returns 403 Forbidden.
 * SEA accounts must use 'asia'.
 */
export function getAccountRegionalRouting(platformCode: string): string {
  const p = (platformCode || "").toLowerCase().trim();

  // Americas
  if (["na1", "br1", "la1", "la2", "na", "br", "lan", "las", "americas"].includes(p)) {
    return "americas";
  }

  // Europe
  if (["euw1", "eun1", "tr1", "ru", "euw", "eune", "tr", "europe"].includes(p)) {
    return "europe";
  }

  // Asia (including South East Asia & Oceania for Account-V1)
  if (
    ["kr", "jp1", "jp", "sg2", "ph2", "th2", "vn2", "tw2", "oc1", "oce", "sea", "asia"].includes(p)
  ) {
    return "asia";
  }

  return "asia";
}

/**
 * Resolves the platform routing code to regional routing code
 * for Match-V5 ('americas', 'asia', 'europe', 'sea').
 */
export function getMatchRegionalRouting(platformCode: string): string {
  const p = (platformCode || "").toLowerCase().trim();

  // Americas
  if (["na1", "br1", "la1", "la2", "na", "br", "lan", "las", "americas"].includes(p)) {
    return "americas";
  }

  // Europe
  if (["euw1", "eun1", "tr1", "ru", "euw", "eune", "tr", "europe"].includes(p)) {
    return "europe";
  }

  // South East Asia & Oceania for Match-V5
  if (["sg2", "ph2", "th2", "vn2", "tw2", "oc1", "oce", "sea"].includes(p)) {
    return "sea";
  }

  // Asia (KR, JP)
  if (["kr", "jp1", "jp", "asia"].includes(p)) {
    return "asia";
  }

  return "europe";
}

// Backward-compatible alias for match routing
export const getRegionalRouting = getMatchRegionalRouting;

/**
 * Maps queue IDs to human-readable names
 */
export function getQueueName(queueId: number): string {
  switch (queueId) {
    case 420:
      return "Ranked Solo";
    case 440:
      return "Ranked Flex";
    case 450:
      return "ARAM";
    case 400:
      return "Normal Draft";
    case 430:
      return "Normal Blind";
    case 490:
      return "Quickplay";
    case 1700:
      return "Arena";
    case 1900:
      return "Pick URF";
    case 900:
      return "ARURF";
    case 700:
      return "Clash";
    case 830:
    case 840:
    case 850:
      return "Co-op vs AI";
    default:
      return "Custom / Other";
  }
}

/**
 * Formats game duration into "Xm Ys"
 */
export function formatGameDuration(durationInSecondsOrMs: number): string {
  let seconds = durationInSecondsOrMs;
  if (seconds > 10000) {
    seconds = Math.floor(seconds / 1000);
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

/**
 * Formats a timestamp into relative time like "2h ago", "Yesterday", etc.
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return "";

  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }
  return `${Math.floor(diffDays / 30)}mo ago`;
}

/**
 * Formats KDA ratio
 */
export function formatKda(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) {
    return "Perfect";
  }
  const ratio = (kills + assists) / deaths;
  return `${ratio.toFixed(2)}:1`;
}
