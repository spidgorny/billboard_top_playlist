import * as fs from "fs";
const Tangular = require('tangular');

export class Poster {

	year: string;

	constructor(year: string) {
		this.year = year;
	}

	public render() {
		// console.log(request.params);
		const html = fs.readFileSync('template/top54.html');
		const template = Tangular.compile(html.toString());

		const playlistJson = fs.readFileSync('spotify/spotify' + this.year + '.json').toString();
		const playlist = JSON.parse(playlistJson);

		const billboardJson = fs.readFileSync('playlist/playlist' + this.year + '.json').toString();
		const billboard = JSON.parse(billboardJson);

		const combined = playlist.map((pl, i) => {
			return {...pl, ...billboard[i]};
		});

		const output = template({
			year: this.year,
			playlist: combined,
		});
		return output;
	}

}
