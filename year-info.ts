import {Poster} from "./src/Poster";

const fastify = require('fastify')({logger: true});

// Declare a route
fastify.get('/', async (request, reply) => {
	return {hello: 'world'}
});

fastify.get('/year/:year', async (request, reply) => {
	const year = request.params.year;
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
