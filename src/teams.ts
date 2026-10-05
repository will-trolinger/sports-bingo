// Team names (as shown on the board) mapped to the code ESPN's logo CDN uses
// for each league. Carried over unchanged from the original single-file app,
// so boards saved in a browser before the rewrite still resolve.
export type Sport = "baseball" | "football" | "college";

export const SPORTS: { id: Sport; label: string }[] = [
  { id: "baseball", label: "Baseball" },
  { id: "football", label: "Football" },
  { id: "college", label: "College" },
];

export const TEAMS: Record<Sport, Record<string, string>> = {
  baseball: {
    Yankees: "nyy", RedSox: "bos", BlueJays: "tor", Rays: "tb", Orioles: "bal",
    WhiteSox: "cws", Guardians: "cle", Tigers: "det", Royals: "kc", Twins: "min",
    Astros: "hou", Mariners: "sea", Angels: "laa", Rangers: "tex", Athletics: "oak",
    Braves: "atl", Mets: "nym", Phillies: "phi", Marlins: "mia", Nationals: "wsh",
    Cardinals: "stl", Brewers: "mil", Cubs: "chc", Pirates: "pit", Reds: "cin",
    Dodgers: "lad", Padres: "sd", Giants: "sf", Rockies: "col", "D-Backs": "ari",
  },
  football: {
    Patriots: "ne", Chiefs: "kc", Packers: "gb", Cowboys: "dal", Eagles: "phi",
    Giants: "nyg", Jets: "nyj", "49ers": "sf", Rams: "lar", Seahawks: "sea",
    Ravens: "bal", Bears: "chi", Steelers: "pit", Saints: "no", Vikings: "min",
    Lions: "det", Dolphins: "mia", Bills: "buf", Texans: "hou", Titans: "ten",
    Chargers: "lac", Colts: "ind", Bengals: "cin", Broncos: "den", Panthers: "car",
    Jaguars: "jax", Raiders: "lv", Commanders: "wsh", Browns: "cle", Buccaneers: "tb",
    Cardinals: "ari",
  },
  college: {
    // ACC
    "Boston College": "103", California: "25", Clemson: "228", Duke: "150",
    "Florida State": "52", "Georgia Tech": "59", Louisville: "97", Miami: "2390",
    "NC State": "152", "North Carolina": "153", Pittsburgh: "221", SMU: "2567", Stanford: "24",
    Syracuse: "183", Virginia: "258", "Virginia Tech": "259", "Wake Forest": "154",
    // Big Ten
    Illinois: "356", Indiana: "84", Iowa: "2294", Maryland: "120", Michigan: "130",
    "Michigan State": "127", Minnesota: "135", Nebraska: "158", Northwestern: "77",
    "Ohio State": "194", Oregon: "2483", "Penn State": "213", Purdue: "2509", Rutgers: "164",
    UCLA: "26", USC: "30", Washington: "264", Wisconsin: "275",
    // Big 12
    Arizona: "12", "Arizona State": "9", BYU: "252", Baylor: "239", Cincinnati: "2132",
    Colorado: "38", Houston: "248", "Iowa State": "66", Kansas: "2305", "Kansas State": "2306",
    "Oklahoma State": "197", TCU: "2628", "Texas Tech": "2641", UCF: "2116", Utah: "254",
    "West Virginia": "277",
    // SEC
    Alabama: "333", Arkansas: "8", Auburn: "2", Florida: "57", Georgia: "61", Kentucky: "96",
    LSU: "99", "Mississippi State": "344", Missouri: "142", Oklahoma: "201", "Ole Miss": "145",
    "South Carolina": "2579", Tennessee: "2633", Texas: "251", "Texas A&M": "245",
    Vanderbilt: "238",
  },
};

// ESPN's league path for each sport.
const ESPN_LEAGUE: Record<Sport, string> = {
  baseball: "mlb",
  football: "nfl",
  college: "ncaa",
};

export function logoUrl(sport: Sport, team: string): string {
  return `https://a.espncdn.com/i/teamlogos/${ESPN_LEAGUE[sport]}/500/${TEAMS[sport][team]}.png`;
}

export function isSport(value: string | null): value is Sport {
  return value === "baseball" || value === "football" || value === "college";
}
