import {Poster} from "./src/Poster";
import * as fs from "fs";
const marked = require('marked');

const fastify = require('fastify')({logger: true});

// Declare a route
fastify.get('/', async (request, reply) => {
	const md = fs.readFileSync('README.md').toString();
	const html = marked(md);
	reply.type('text/html').send(html);
});

fastify.get('/hello', async (request, reply) => {
	return {hello: 'world'}
});

fastify.get('/year/:year', async (request, reply) => {
	const year = parseInt(request.params.year, 10);
	const poster = new Poster(year);
	const output = poster.render();
	reply.type('text/html').send(output);
});

// Run the server!
const start = async () => {
	try {
		await fastify.listen(3000);
		fastify.log.info(`server listening on ${fastify.server.address().port}`)
	} catch (err) {
		fastify.log.error(err);
		process.exit(1)
	}
};
start();
