import {SpotifySong} from "./playlist";
import * as fs from "fs";

const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const spotifyApi = new SpotifyWebApi({
	clientId: process.env['spotify.client'],
	clientSecret: process.env['spotify.secret'],
	redirectUri: process.env['spotify.redirect'],
});

if (!process.env['spotify.access_token']) {
	throw new Error('Run auth.ts and generate "spotify.access_token" in .env');
}
spotifyApi.setAccessToken(process.env['spotify.access_token']);
spotifyApi.setRefreshToken(process.env['spotify.refresh_token']);

async function findPlaylist(playlistName: string) {
	const lists = await spotifyApi.getUserPlaylists();
	// console.log(lists);
	const found = lists.body.items.filter((el) => {
		// console.log(el);
		return el.name === playlistName;
	});
	return found.length ? found[0] : null;
}

async function createPlaylist(playlistName: string) {
	const user = await spotifyApi.getMe();
	console.log(user);

	const playlistID = await spotifyApi.createPlaylist(user.body.id, playlistName, {
		public: true,
		description: 'Best song for every week of the year which is not already in the playlist. https://github.com/spidgorny/billboard_top_playlist',
	});
	return playlistID;
}

interface LocalPlaylistItem {
	artist: string;
	title: string;
	spotify: {
		id: string;
		artist: string;
		title: string;
		album: string;
	};
}

const year = 1990;

(async () => {
	try {
		let playlistName = 'Billboard Top ' + year;
		let playlistID = await findPlaylist(playlistName);
		if (!playlistID) {
			playlistID = await createPlaylist(playlistName);
		}
		console.log(playlistID.id, playlistID.name);

		let jsonBuffer = fs.readFileSync('spotify/spotify' + year + '.json');
		const playlist: LocalPlaylistItem[] = JSON.parse(jsonBuffer.toString());
		const onlyWithID = playlist.filter((el: LocalPlaylistItem) => {
			return el.spotify.id;
		});
		const tracks = onlyWithID.map((el: LocalPlaylistItem) => {
			return 'spotify:track:' + el.spotify.id;
		});
		console.log(tracks);
		const added = await spotifyApi.addTracksToPlaylist(playlistID.id, tracks);
		console.log(added);
	} catch (e) {
		console.error(e);
		// console.error(e.stack);
		console.trace()
	}
})();
