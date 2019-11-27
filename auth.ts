const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public'],
	redirectUri = 'https://example.com/callback',
	state = 'some-state-of-my-choice';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
	redirectUri: redirectUri,
	clientId: process.env['spotify.client'],
});

// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
console.log(authorizeURL);
