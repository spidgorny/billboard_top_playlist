import {Song} from "./Billboard";

const SpotifyWebApi = require('spotify-web-api-node');

export interface SpotifySong {
	id: string;
	name: string;
	artists: {
		name: string;
	}[];
	album: {
		name: string;
	}
}

export interface SpotifySongResults {
	tracks: {
		items: SpotifySong[];
	};
}

export class SpotifyAPI {

	spotifyApi: typeof SpotifyWebApi;

	constructor() {
		// credentials are optional
		this.spotifyApi = new SpotifyWebApi({
			clientId: process.env['spotify.client'],
			clientSecret: process.env['spotify.secret'],
		});
	}

	public async login() {
		const grant = await this.spotifyApi.clientCredentialsGrant();
		// console.log(grant);
		this.spotifyApi.setAccessToken(grant.body['access_token']);
	}

	/**
	 * Try as is and if failed
	 * 	- remove word "Featuring"
	 * 	- otherwise remove text in brackets ()
	 * @param song
	 */
	async findSpotifySong(song: Song): Promise<SpotifySongResults> {
		let track = song.title;
		let artist = song.artist;
		console.log(song.from.week, artist, '-', track);
		let q = `track:${track} artist:${artist}`;
		console.log(q);
		let spotifySong = await this.spotifyApi.searchTracks(q, {
			limit: 1,
		});
		if (!spotifySong.body.tracks.items.length) {
			if (artist.includes('Featuring')) {
				artist = artist.replace('Featuring', '');
				let q = `track:${track} artist:${artist}`;
				console.log(q);
				spotifySong = await this.spotifyApi.searchTracks(q, {
					limit: 1,
				});
				if (!spotifySong.body.tracks.items.length) {
					if (track.includes('(')) {
						// https://stackoverflow.com/questions/4292468/javascript-regex-remove-text-between-parentheses
						artist = artist.replace(/ *\([^)]*\) */g, '');
						track = track.replace(/ *\([^)]*\) */g, '');
						let q = `track:${track} artist:${artist}`;
						console.log(q);
						spotifySong = await this.spotifyApi.searchTracks(q, {
							limit: 1,
						});
					}
				}
			}
		}
		return spotifySong.body;
	}

	async findOneSong(song: Song) {
		let result = {
			artist: song.artist,
			title: song.title,
			spotify: {},
		};
		const spotifySong = await this.findSpotifySong(song);
		if (spotifySong.tracks.items.length) {
			let item0 = spotifySong.tracks.items[0];
			console.log('    ', item0.id, item0.artists[0].name, '-', item0.name, '(', item0.album.name, ')');
			result = {
				artist: song.artist,
				title: song.title,
				spotify: {
					id: item0.id,
					artist: item0.artists[0].name,
					title: item0.name,
					album: item0.album.name,
				},
			};
		} else {
			console.error('    Not on Spotify');
		}
		console.log();
		return result;
	}

}
