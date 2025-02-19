const fastify = require('fastify')();
const request = require('request');
const zlib = require('zlib');
const path = require("path");

const index = process.argv.lastIndexOf('--config-file');
const configPath = index > -1 ? process.argv[index + 1] : './config.js';
const normalizedPath = path.isAbsolute(configPath) ? configPath : path.join(__dirname, configPath);
const config = require(normalizedPath);

Error.stackTraceLimit = 200;

function fixup(body) {
    if (!body.replace || !body.replaceAll) {
        return body;
    }

	if (config.manualResponseReplacements) {
		config.manualResponseReplacements.forEach(replacement => {
			const find = new RegExp(replacement.find, 'g');
			body = body.replace(find, replacement.replace);
		});
	}
	config.subdomains.forEach(subdomain => {
		body = body.replaceAll(`${subdomain}.${config.domain}`, `${config.proxyDomain}/${config.name.toUpperCase()}${subdomain}`);
	});
	if (config.optionalCustomDomainExpression) {
		const regex = new RegExp(config.optionalCustomDomainExpression, 'g');
		body = body.replace(regex, `${config.proxyDomain}`);
	} else {
		body = body.replaceAll(config.domain, config.proxyDomain);
	}

	return body;
}

function unfixup(header) {
    if (!header.replace || !header.replaceAll) {
        return header;
    }

	if (config.manualRequestReplacements) {
		config.manualRequestReplacements.forEach(replacement => {
			const find = new RegExp(replacement.find, 'g');
			header = header.replace(find, replacement.replace);
		});
	}
	config.subdomains.forEach(subdomain => {
		header = header.replaceAll(`${config.proxyDomain}/${config.name.toUpperCase()}${subdomain}`, `${subdomain}.${config.domain}`);
	});
	header = header.replaceAll(config.proxyDomain, config.domain);

	return header;
}

function forward(req, reply, domain, subdomain) {
	let theUrl;
	if (subdomain) {
		theUrl = `https://${domain}${req.raw.url.replace(`/${subdomain}`, '')}`;
	} else {
		theUrl = `https://${domain}${req.raw.url}`;
	}

	const options = {
		url: theUrl,
		encoding: null,
		method: req.method,
		json: req.body,
	};

	Object.keys(req.headers).forEach(header => {
		options.headers = options.headers || {};
		options.headers[header] = unfixup(req.headers[header]);
		if (header.toLowerCase() === 'x-forwarded-for' || header.toLowerCase() === 'cf-connecting-ip') {
			options.headers[header] = config.proxyIP;
		}
		if (header.toLowerCase() === 'host') {
			options.headers[header] = `${domain}`;
		}
	});
	
	options.headers['cache-control'] = 'no-cache';
	options.headers['pragma'] = 'no-cache';
	options.headers['if-modified-since'] = '';
	options.headers['if-none-match'] = '';

	request(options, (error, response, body) => {
		if (error) {
			return reply.send(error);
		}

		// Copy all headers from the original response
		Object.keys(response.headers).forEach(header => {
			let resheader = response.headers[header];
			resheader = fixup(resheader);
			reply.header(header, resheader);
		});

		let decompressedBody = body;
		if (response.headers['content-encoding'] === 'gzip') {
			decompressedBody = zlib.gunzipSync(body);
		} else if (response.headers['content-encoding'] === 'br') {
			decompressedBody = zlib.brotliDecompressSync(body);
		} else if (response.headers['content-encoding'] === 'deflate') {
			decompressedBody = zlib.inflateSync(body);
		}

		let modifiedBody = decompressedBody;
		let shouldFixUp = false;
		if (!response.headers['content-type']) {
			shouldFixUp = options.url.endsWith('html') || options.url.endsWith('js');
		} else {
			shouldFixUp = response.headers['content-type'].includes('text');
		}
		if (shouldFixUp) {
			decompressedBody = decompressedBody.toString();
			modifiedBody = fixup(decompressedBody);
		}

		if (response.headers['content-encoding'] === 'gzip') {
			modifiedBody = zlib.gzipSync(Buffer.from(modifiedBody));
		} else if (response.headers['content-encoding'] === 'br') {
			modifiedBody = zlib.brotliCompressSync(Buffer.from(modifiedBody));
		} else if (response.headers['content-encoding'] === 'deflate') {
			modifiedBody = zlib.deflateSync(Buffer.from(modifiedBody));
		}
		
		reply.status(response.statusCode).send(modifiedBody);
	});
}

config.subdomains.forEach(subdomain => {
	const path = config.name.toUpperCase() + subdomain;
	fastify.all(`/${path}/*`, (req, reply) => {
		forward(req, reply, subdomain + '.' + config.domain, path);
	});
});

fastify.all('/*', (req, reply) => {
	forward(req, reply, config.domain);
});

fastify.listen({ port: config.port, host: config.host }, (err, address) => {
	if (err) throw err;
	console.log(`Server listening at ${address}`);
});