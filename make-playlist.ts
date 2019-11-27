const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const spotifyApi = new SpotifyWebApi({
	clientId: process.env['spotify.client'],
	clientSecret: process.env['spotify.secret'],
	redirectUri: 'http://redirect.url/',
});

(async () => {
	const code = process.env['spotify.code'];
	console.log('code', code);
	if (!code) {
		throw new Error('Please run auth.ts first and put the code from URL into .env');
	}

	try {
		const grant = await spotifyApi.authorizationCodeGrant(code);
		console.log(grant);

		spotifyApi.setAccessToken(grant.body['access_token']);
		spotifyApi.setRefreshToken(grant.body['refresh_token']);

		const playlist = spotifyApi.createPlaylist('My Cool Playlist', {'public': true});
		console.log(playlist);

		const added = spotifyApi.addTracksToPlaylist(playlist, ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"]);
		console.log(added);
	} catch (e) {
		console.error(e);
	}
})();
