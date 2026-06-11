export type TimeZoneOptionDefinition = {
  timeZone: string;
  city: string;
  country: string;
  countryCode?: string;
  region?: string;
  name?: string;
  keywords?: string[];
};

export const timeZoneOptionDefinitions: TimeZoneOptionDefinition[] = [
  { timeZone: "Pacific/Pago_Pago", city: "Pago Pago", country: "American Samoa", countryCode: "AS" },
  { timeZone: "Pacific/Honolulu", city: "Honolulu", country: "United States", countryCode: "US", region: "Hawaii" },
  { timeZone: "America/Anchorage", city: "Anchorage", country: "United States", countryCode: "US", region: "Alaska" },
  {
    timeZone: "America/Los_Angeles",
    city: "Los Angeles",
    country: "United States",
    name: "Pacific Time",
    keywords: ["Seattle", "San Francisco", "San Jose", "Las Vegas", "Portland", "Vancouver"]
  },
  {
    timeZone: "America/Denver",
    city: "Denver",
    country: "United States",
    name: "Mountain Time",
    keywords: ["Phoenix", "Salt Lake City", "Calgary", "Edmonton"]
  },
  {
    timeZone: "America/Chicago",
    city: "Chicago",
    country: "United States",
    name: "Central Time",
    keywords: ["Austin", "Dallas", "Houston", "Minneapolis", "Winnipeg", "Mexico City"]
  },
  {
    timeZone: "America/New_York",
    city: "New York",
    country: "United States",
    name: "Eastern Time",
    keywords: ["Atlanta", "Boston", "Miami", "Philadelphia", "Washington", "Toronto", "Montreal"]
  },
  { timeZone: "America/Halifax", city: "Halifax", country: "Canada", name: "Atlantic Time" },
  { timeZone: "America/St_Johns", city: "St. John's", country: "Canada", name: "Newfoundland Time" },
  { timeZone: "America/Mexico_City", city: "Mexico City", country: "Mexico" },
  { timeZone: "America/Tijuana", city: "Tijuana", country: "Mexico" },
  { timeZone: "America/Cancun", city: "Cancun", country: "Mexico" },
  { timeZone: "America/Guatemala", city: "Guatemala City", country: "Guatemala" },
  { timeZone: "America/Costa_Rica", city: "San Jose", country: "Costa Rica" },
  { timeZone: "America/Panama", city: "Panama City", country: "Panama" },
  { timeZone: "America/Bogota", city: "Bogota", country: "Colombia" },
  { timeZone: "America/Lima", city: "Lima", country: "Peru" },
  { timeZone: "America/Caracas", city: "Caracas", country: "Venezuela" },
  { timeZone: "America/Santiago", city: "Santiago", country: "Chile" },
  { timeZone: "America/Argentina/Buenos_Aires", city: "Buenos Aires", country: "Argentina" },
  { timeZone: "America/Montevideo", city: "Montevideo", country: "Uruguay" },
  { timeZone: "America/Sao_Paulo", city: "Sao Paulo", country: "Brazil", keywords: ["Rio de Janeiro"] },
  { timeZone: "America/Manaus", city: "Manaus", country: "Brazil" },
  { timeZone: "America/Rio_Branco", city: "Rio Branco", country: "Brazil" },
  { timeZone: "Atlantic/Reykjavik", city: "Reykjavik", country: "Iceland" },
  { timeZone: "Europe/London", city: "London", country: "United Kingdom", keywords: ["Manchester", "Edinburgh", "Dublin"] },
  { timeZone: "Europe/Lisbon", city: "Lisbon", country: "Portugal" },
  {
    timeZone: "Europe/Berlin",
    city: "Berlin",
    country: "Germany",
    name: "Central European Time",
    keywords: ["Amsterdam", "Brussels", "Copenhagen", "Madrid", "Paris", "Rome", "Stockholm", "Vienna", "Warsaw", "Zurich"]
  },
  { timeZone: "Europe/Helsinki", city: "Helsinki", country: "Finland", keywords: ["Riga", "Tallinn", "Vilnius"] },
  { timeZone: "Europe/Athens", city: "Athens", country: "Greece" },
  { timeZone: "Europe/Bucharest", city: "Bucharest", country: "Romania" },
  { timeZone: "Europe/Kyiv", city: "Kyiv", country: "Ukraine", keywords: ["Kiev"] },
  { timeZone: "Europe/Istanbul", city: "Istanbul", country: "Turkey" },
  { timeZone: "Europe/Minsk", city: "Minsk", country: "Belarus", keywords: ["Brest"] },
  { timeZone: "Europe/Moscow", city: "Moscow", country: "Russia" },
  { timeZone: "Europe/Kaliningrad", city: "Kaliningrad", country: "Russia" },
  { timeZone: "Asia/Yekaterinburg", city: "Yekaterinburg", country: "Russia" },
  { timeZone: "Asia/Novosibirsk", city: "Novosibirsk", country: "Russia" },
  { timeZone: "Asia/Irkutsk", city: "Irkutsk", country: "Russia" },
  { timeZone: "Asia/Vladivostok", city: "Vladivostok", country: "Russia" },
  { timeZone: "Asia/Tbilisi", city: "Tbilisi", country: "Georgia" },
  { timeZone: "Asia/Yerevan", city: "Yerevan", country: "Armenia" },
  { timeZone: "Asia/Baku", city: "Baku", country: "Azerbaijan" },
  { timeZone: "Asia/Dubai", city: "Dubai", country: "United Arab Emirates", keywords: ["Abu Dhabi"] },
  { timeZone: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia" },
  { timeZone: "Asia/Jerusalem", city: "Jerusalem", country: "Israel", keywords: ["Tel Aviv"] },
  { timeZone: "Asia/Tehran", city: "Tehran", country: "Iran" },
  { timeZone: "Asia/Kabul", city: "Kabul", country: "Afghanistan" },
  { timeZone: "Asia/Karachi", city: "Karachi", country: "Pakistan" },
  { timeZone: "Asia/Kolkata", city: "Mumbai", country: "India", keywords: ["Delhi", "Bangalore", "Bengaluru", "Kolkata", "Chennai", "Hyderabad"] },
  { timeZone: "Asia/Kathmandu", city: "Kathmandu", country: "Nepal" },
  { timeZone: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh" },
  { timeZone: "Asia/Bangkok", city: "Bangkok", country: "Thailand", keywords: ["Hanoi", "Jakarta"] },
  { timeZone: "Asia/Singapore", city: "Singapore", country: "Singapore", keywords: ["Kuala Lumpur"] },
  { timeZone: "Asia/Hong_Kong", city: "Hong Kong", country: "China" },
  { timeZone: "Asia/Shanghai", city: "Shanghai", country: "China", keywords: ["Beijing"] },
  { timeZone: "Asia/Taipei", city: "Taipei", country: "Taiwan" },
  { timeZone: "Asia/Seoul", city: "Seoul", country: "South Korea" },
  { timeZone: "Asia/Tokyo", city: "Tokyo", country: "Japan" },
  { timeZone: "Australia/Perth", city: "Perth", country: "Australia" },
  { timeZone: "Australia/Darwin", city: "Darwin", country: "Australia" },
  { timeZone: "Australia/Adelaide", city: "Adelaide", country: "Australia" },
  { timeZone: "Australia/Brisbane", city: "Brisbane", country: "Australia" },
  { timeZone: "Australia/Sydney", city: "Sydney", country: "Australia", keywords: ["Melbourne", "Canberra"] },
  { timeZone: "Pacific/Auckland", city: "Auckland", country: "New Zealand", keywords: ["Wellington"] },
  { timeZone: "Pacific/Fiji", city: "Suva", country: "Fiji" }
];
