module.exports = {
	domain: "imgur.com",
	proxyDomain: "imgur.your.website",
	proxyIP: "123.123.12.34",
	port: 3000,
	host: "0.0.0.0",
	name: "Imgur",
	subdomains: [
		"api",
		"i",
		"help",
		"s",
		"mp",
		"rt",
		"p",
	],
	optionalCustomDomainExpression: String.raw`(?<!oembed.\w+?\?url=.*?)imgur\.com`,
	manualResponseReplacements: [
		// Imgur has lots of funny JS that assumes the domain is imgur.com. These two regexes fix that.
		{
			find: String.raw`"https:\/\/api\.".concat\(h\)`,
			replace: `("https://".concat(h.startsWith("imgur.your")?"":"api.")).concat(h.startsWith("imgur.your")?(h.includes("/") ? h.replace("/", "/IMGURapi/") : h.concat("/IMGURapi")):h)`
		},
		{
			find: String.raw`"https:\/\/rt\."\.concat\(h\)`,
			replace: `("https://".concat(h.startsWith("imgur.your")?"":"rt.")).concat(h.startsWith("imgur.your")?(h.includes("/") ? h.replace("/", "/IMGURrt/") : h.concat("/IMGURrt")):h)`
		},
		{
			find: String.raw`"https:\/\/mp\.".concat\(f\)`,
			replace: `("https://".concat(f.startsWith("imgur.your")?"":"mp.")).concat(f.startsWith("imgur.your")?(f.includes("/") ? f.replace("/", "/IMGURmp/") : f.concat("/IMGURmp")):h)`
		},
		{
			find: String.raw`"https:\/\/p\."\.concat\(f\)`,
			replace: `("https://".concat(f.startsWith("imgur.your")?"":"p.")).concat(f.startsWith("imgur.your")?(f.includes("/") ? f.replace("/", "/IMGURp/") : f.concat("/IMGURp")):f)`
		},
		{
			find: String.raw`"https:\/\/"\.concat\(b,"\."\)\.concat\(h\)`,
			replace: `"https://".concat(h.startsWith("imgur.your") ? "" : "".concat(b,".")).concat(h.startsWith("imgur.your")?(h.includes("/") ? h.replace("/", "/IMGURi/") : h.concat("/IMGURi")):h)`
		},
		// For some reason, "i".concat("mgur.com") is in some script tags that redirect you to imgur.com if the domain is something else.
		{
			find: String.raw`"mgur\.com"`,
			replace: `"mgur.your.website"`
		}
	],
	manualRequestReplacements: [
		// This probably doesn't do anything, but I don't feel like testing it.
		{
			find: String.raw`"mgur\.your\.website"`,
			replace: `"mgur.com"`
		}
	]
};
