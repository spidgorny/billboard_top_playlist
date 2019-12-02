import {YearWeeks} from "./src/YearWeeks";
import {PlaylistGenerator} from "./src/PlaylistGenerator";
import {Billboard, Song} from "./src/Billboard";
import {SpotifyAPI} from "./src/SpotifyAPI";
import {Poster} from "./src/Poster";
import * as fs from "fs";

require('dotenv').config();

async function getPlaylist(year: number): Promise<Song[]> {
	let playlistPath = 'playlist/playlist' + year + '.json';
	if (fs.existsSync(playlistPath)) {
		const playlist = JSON.parse(fs.readFileSync(playlistPath).toString());
		return playlist;
	}

	let since = '1990-01-01';
	const yw = new YearWeeks();
	const weeks = yw.generateWeeks(since);

	const yearWeeks = yw.splitWeeksByYear(weeks);
	const thisYear = yearWeeks[year];

	const billboard = new Billboard();
	const generator = new PlaylistGenerator(billboard);
	// will write to the playlistPath inside
	const playlist = await generator.constructYearPlaylist(thisYear);
	return playlist;
}

async function getSpotifySongs(year: number, playlist: Song[]) {
	const spotifyPath = 'spotify/spotify' + year + '.json';
	if (fs.existsSync(spotifyPath)) {
		const results = JSON.parse(fs.readFileSync(spotifyPath).toString());
		return results;
	}

	const sapi = new SpotifyAPI();
	await sapi.login();

	const results = [];
	for (const song of playlist) {
		results.push(await sapi.findOneSong(song));
	}
	fs.writeFileSync(spotifyPath, JSON.stringify(results, null, '\t'));
	return results;
}

async function start(year: number) {
	const playlist = await getPlaylist(year);
	console.log(playlist.length);

	const results = await getSpotifySongs(year, playlist);
	console.log(results.length);

	const poster = new Poster(year, playlist, results);
	const output = poster.render();

	let posterPath = 'poster/' + year + '.html';
	fs.writeFileSync(posterPath,
		output);
	//os.exec('start ' + posterPath);
}

(async () => {
	try {
		const year = parseInt(process.argv[2], 10);
		console.log('#', year);
		if (year) {
			await start(year);
		}
	} catch (e) {
		console.error(e);
	}
})();
