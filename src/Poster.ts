import * as fs from "fs";
import {Song} from "./Billboard";
import {SpotifySong} from "./SpotifyAPI";
const Tangular = require('tangular');

export class Poster {

	year: number;
	billboard: Song[];
	spotifyList: SpotifySong[];

	constructor(year: number, billboard?: Song[], spotifyList?: SpotifySong[]) {
		this.year = year;

		if (!billboard) {
			const billboardJson = fs.readFileSync('playlist/playlist' + this.year + '.json').toString();
			billboard = JSON.parse(billboardJson);
		}
		this.billboard = billboard;

		if (!spotifyList) {
			const playlistJson = fs.readFileSync('spotify/spotify' + this.year + '.json').toString();
			spotifyList = JSON.parse(playlistJson);
		}
		this.spotifyList = spotifyList;
	}

	public render() {
		// console.log(request.params);
		const html = fs.readFileSync('template/top54.html');
		const template = Tangular.compile(html.toString());

		const combined = this.spotifyList.map((pl, i) => {
			return {...pl, ...this.billboard[i]};
		});

		const output = template({
			year: this.year,
			playlist: combined,
		});
		return output;
	}

}
