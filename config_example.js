module.exports = {
	domain: "example.com",
	proxyDomain: "example.your.website",
	proxyIP: "123.123.12.34", // Should be the IP of the server this is running on
	port: 3000,
	host: "0.0.0.0",
	name: "Example", // The name of the service you're reverse proxying. This is converted to uppercase and used to make subdomains into paths (e.g. api.example.com/abc -> example.your.website/EXAMPLEapi/abc)
	subdomains: [
		"www",
		"cdn",
		"api",
		"assets"
	],
	optionalCustomDomainExpression: "(?<!some)example\\.com", // Optional. Useful if some files have text containing the domain (e.g. "someexample.com") that you don't want to be converted. This is a regex expression.
	manualResponseReplacements: [
		{
			find: "z:\\(\\)=>h\\.concat\\(\"example\\.com\"\\);", // Sometimes the client will do funny things in JS that have to be manually fixed up like this.
			replace: "z:()=>\"your.website/EXAMPLE\".concat(h);" // If the original expression returned "abc.example.com", this will return "your.website/EXAMPLEabc" as it should.
		}
	],
	manualRequestReplacements: [
		{
			find: "(something){3}", // These are applied to the request headers.
			replace: "something elsesomething elsesomething else"
		}
	]
};
