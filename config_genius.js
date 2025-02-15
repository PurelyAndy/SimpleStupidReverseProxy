module.exports = {
	domain: "genius.com",
	proxyDomain: "genius.your.website",
	proxyIP: "123.123.12.34",
	port: 3000,
	host: "0.0.0.0",
	name: "Genius",
	subdomains: [
		"t2",
		"assets",
		"images",
		"so",
		"promote",
		"shop"
	],
	// For some reason, some images are served from rapgenius.com.
	// Without this, those would end up being served from rapgenius.your.website,
	// which wouldn't work unless you made another reverse proxy for rapgenius.com and a DNS record for rapgenius.your.website.
	optionalCustomDomainExpression: "(?<!rap)genius\\.com"
};