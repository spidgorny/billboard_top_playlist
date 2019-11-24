import * as fs from "fs";
import {Billboard, Song} from "./Billboard";
import * as moment from "moment";
import {IYearWeeks} from "./YearWeeks";

export class PlaylistGenerator {

	constructor(protected billboard: Billboard) {}

	async constructPlaylists(yearWeeks: IYearWeeks) {
		for (const year of Object.keys(yearWeeks)) {
			console.log('Year: ' + year);
			const playlist = await this.constructYearPlaylist(yearWeeks[year]);
			this.dumpPlaylist(playlist);
			fs.writeFileSync('playlist' + year + '.json', JSON.stringify(playlist, null, 4));
		}
	}

	playlistIncludes(playlist: Song[], song: Song): boolean {
		return playlist.filter((el) => {
			return el.title == song.title && el.artist == song.artist;
		}).length > 0;
	}

	async constructYearPlaylist(weeks: moment.Moment[]) {
		const playlist = [];
		for (const week of weeks) {
			let ymd = week.format('Y-MM-DD');
			const top100 = await this.billboard.fetchChartFromCache(ymd);
			for (const i in top100.songs) {
				const song = top100.songs[i];
				if (!this.playlistIncludes(playlist, song)) {
					song.from = {
						date: ymd,
						week: week.week(),
						pos: i
					};
					playlist.push(song);
					break;	// one top song only
				}
			}
		}
		return playlist;
	}

	dumpPlaylist(playlist: Song[]) {
		for (const song of playlist) {
			console.log(song.from.week + ': ' + song.rank, "\t", song.artist, '-', song.title);
		}
	}

}
