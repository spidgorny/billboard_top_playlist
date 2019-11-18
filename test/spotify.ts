const SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
const spotifyApi = new SpotifyWebApi({
	clientId: 'ca66779885554f48a7a698173bae65be',
	clientSecret: '68329a9c7c48474fa60d6132beb2c008',
});

(async () => {
	try {
		const grant = await spotifyApi.clientCredentialsGrant();
		// console.log(grant);
		spotifyApi.setAccessToken(grant.body['access_token']);

		const song = await spotifyApi.searchTracks('track:Alright artist:Kendrick Lamar');
		console.log(song.body.tracks.items);
	} catch (e) {
		console.error(e);
	}
})();
