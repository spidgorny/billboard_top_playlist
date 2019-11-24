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
			if (!playlist.length) {
				break;
			}
			this.dumpPlaylist(playlist);
			fs.writeFileSync('playlist/playlist' + year + '.json', JSON.stringify(playlist, null, '\t'));
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
			try {
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
			} catch (e) {
				console.log('Billboard data not found in cache. And Billboard rate limit reached. Try again in 2 minutes.');
				break;
			}
		}
		return playlist;
	}

	dumpPlaylist(playlist: Song[]) {
		for (const song of playlist) {
			const year = moment(song.from.date).year();
			console.log(
				year + '-W'+song.from.week + ':',
				'#' + song.rank.toString().padStart(2, '0'),
				"\t", song.artist, '-', song.title
			);
		}
	}

}
