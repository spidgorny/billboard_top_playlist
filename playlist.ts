import * as fs from "fs";
import {Song} from "./src/Billboard";

const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

// credentials are optional
const spotifyApi = new SpotifyWebApi({
	clientId: process.env['spotify.client'],
	clientSecret: process.env['spotify.secret'],
});

(async (year: number) => {
	try {
		const grant = await spotifyApi.clientCredentialsGrant();
		// console.log(grant);
		spotifyApi.setAccessToken(grant.body['access_token']);

		const playlist: Song[] = JSON.parse(fs.readFileSync('playlist/playlist' + year + '.json').toString());

		const results = [];
		for (const song of playlist) {
			const track = song.title;
			const artist = song.artist;
			console.log(song.from.week, artist, '-', track);
			let q = `track:${track} artist:${artist}`;
			console.log(q);
			const spotifySong = await spotifyApi.searchTracks(q, {
				limit: 1,
			});
			if (spotifySong.body.tracks.items.length) {
				let item0 = spotifySong.body.tracks.items[0];
				console.log('    ', item0.id, item0.artists[0].name, '-', item0.name, '(', item0.album.name, ')');
				results.push({
					artist,
					track,
					spotify: {
						id: item0.id,
						artist: item0.artists[0].name,
						title: item0.name,
						album: item0.album.name,
					},
				});
			} else {
				console.error('    Not on Spotify');
				results.push({
					artist,
					track,
				});
			}
			console.log();

			fs.writeFileSync('spotify' + year + '.json', JSON.stringify(results, null, '\t'));
		}
	} catch (e) {
		console.error(e);
	}
})(1990);
