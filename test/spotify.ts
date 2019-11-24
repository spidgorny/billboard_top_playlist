const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

// credentials are optional
const spotifyApi = new SpotifyWebApi({
	clientId: process.env['spotify.client'],
	clientSecret: process.env['spotify.secret'],
});

async function searchFor(q: string) {
	return await spotifyApi.searchTracks(q, {
		limit: 1,
	});
}

function dumpResult(results: any) {
	if (results.body.tracks.items.length) {
		let item0 = results.body.tracks.items[0];
		console.log('-', results.body.tracks.items.length, item0.id, item0.artists[0].name, '-', item0.name, '(', item0.album.name, ')');
	} else {
		console.log(results.body.tracks);
	}
}

(async () => {
	try {
		const grant = await spotifyApi.clientCredentialsGrant();
		// console.log(grant);
		spotifyApi.setAccessToken(grant.body['access_token']);

		const working = await searchFor('track:Alright artist:Kendrick Lamar');
		dumpResult(working);

		const tomsDiner = await searchFor('track:Tom\'s Diner artist:DNA Featuring Suzanne Vega');
		dumpResult(tomsDiner);

		const tomsDinerPlain = await searchFor('Toms Diner DNA Suzanne Vega');
		dumpResult(tomsDinerPlain);

		const nelson = await searchFor('(Can\'t Live Without Your) Love And Affection Nelson');
		dumpResult(nelson);

		const nelsonWithTrack = await searchFor('track:(Can\'t Live Without Your) Love And Affection artist:Nelson');
		dumpResult(nelson);
	} catch (e) {
		console.error(e);
	}
})();
