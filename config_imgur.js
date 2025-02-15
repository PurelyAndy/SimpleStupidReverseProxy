module.exports = {
	domain: "imgur.com",
	proxyDomain: "imgur.your.website",
	proxyIP: "123.123.12.34",
	port: 3000,
	host: "0.0.0.0",
	name: "Imgur",
	subdomains: [
		"i",
		"help",
		"api",
		"s"
	],
	manualResponseReplacements: [
		// Imgur has lots of funny JS that assumes the domain is imgur.com. These two regexes fix that.
		{
			find: "\"https:\\/\\/api\\.\".concat\\(h\\)",
			replace: "(\"https://\".concat(h.startsWith(\"imgur.your\")?\"\":\"api.\")).concat(h.startsWith(\"imgur.your\")?(h.includes(\"/\") ? h.replace(\"/\", \"/IMGURapi/\") : h.concat(\"/IMGURapi\")):h)"
		},
		{
			find: "L=\"https:\\/\\/\"\\.concat\\(b,\"\\.\"\\)\\.concat\\(h\\)",
			replace: "L=\"https://\".concat(h.startsWith(\"imgur.your\") ? \"\" : \"\".concat(b,\".\")).concat(h.startsWith(\"imgur.your\")?(h.includes(\"/\") ? h.replace(\"/\", \"/IMGURi/\") : h.concat(\"/IMGURi\")):h)"
		},
		// For some reason, "i".concat("mgur.com") is in some script tags that redirect you to imgur.com if the domain is something else.
		{
			find: "\"mgur\\.com\"",
			replace: "\"mgur.your.website\""
		}
	],
	manualRequestReplacements: [
		// This probably doesn't do anything, but I don't feel like testing it.
		{
			find: "\"mgur\\.your\\.website\"",
			replace: "\"mgur.com\""
		}
	]
};