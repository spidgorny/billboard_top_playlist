import * as os from "os";

const SpotifyWebApiA = require('spotify-web-api-node');
require('dotenv').config();
const updateDotenv = require('update-dotenv');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public'];

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApiA = new SpotifyWebApiA({
	redirectUri: process.env['spotify.redirect'],
	clientId: process.env['spotify.client'],
	clientSecret: process.env['spotify.secret'],
});

async function updateCode() {
	// Create the authorization URL
	const authorizeURL = spotifyApiA.createAuthorizeURL(scopes, 'some-state-of-my-choice');

	// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
	console.log(authorizeURL);

	await exec('start ' + authorizeURL);
	console.log('Authorize and paste the ?code= into .env');
	process.exit();
}

(async () => {
	const code = process.env['spotify.code'];
	console.log('code', code);

	if (!code) {
		await updateCode();
	}

	if (!process.env['spotify.access_token']) {
		try {
			const grant = await spotifyApiA.authorizationCodeGrant(code);
			console.log(grant);

			await updateDotenv({
				'spotify.access_token': grant.body['access_token'],
				'spotify.refresh_token': grant.body['refresh_token'],
			});
		} catch (e) {
			console.error(e);
			await updateCode();
		}
	}
})();
