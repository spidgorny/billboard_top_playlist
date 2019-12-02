import * as fs from "fs";
import {Song} from "./src/Billboard";
import {SpotifyAPI} from "./src/SpotifyAPI";

require('dotenv').config();

(async (year: number) => {
	try {
		const sapi = new SpotifyAPI();
		await sapi.login();

		const playlist: Song[] = JSON.parse(fs.readFileSync('playlist/playlist' + year + '.json').toString());

		const results = [];
		for (const song of playlist) {
			results.push(await sapi.findOneSong(song));
		}
		fs.writeFileSync('spotify/spotify' + year + '.json', JSON.stringify(results, null, '\t'));
	} catch (e) {
		console.error(e);
	}
})(1994);
