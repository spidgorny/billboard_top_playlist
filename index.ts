import * as fs from "fs";
import * as moment from "moment";
import {Billboard, Chart, Song} from "./src/Billboard";
import {PlaylistGenerator} from "./src/PlaylistGenerator";
import {YearWeeks} from "./src/YearWeeks";

console.log('Starting');

const billboard = new Billboard();

async function downloadAndCache(yearWeeks: moment.Moment[]) {
	for (const date of yearWeeks) {
		// console.log(date.format('Y-MM-DD'));
		try {
			const chart: Chart = await billboard.fetchChartFromCache(date.format('Y-MM-DD'));
		} catch (e) {
			// Rate limit reached
			break;
		}
	}
}

function dumpChart(chart: Chart) {
	for (const song of chart.songs) {
		console.log(song.rank, "\t", song.artist, ' - ', song.title);
	}
}

async function downloadAndShowOneWeekChart(since: string) {
	const chart: any = await billboard.fetchChartFromCache(since);
	dumpChart(chart);
}

(async () => {
	let since = '1990-01-01';
	const yw = new YearWeeks();
	const weeks = yw.generateWeeks(since);
	// console.log(weeks.map(d => d.format('Y-MM-DD')));

	// this is just caching the data in advance
	// await downloadAndCache(weeks);

	const yearWeeks = yw.splitWeeksByYear(weeks);
	// fs.writeFileSync('yearWeeks.json', JSON.stringify(yearWeeks, null, "\t"));
	// yw.dumpYearWeek(yearWeeks);

	const generator = new PlaylistGenerator(billboard);
	await generator.constructPlaylists(yearWeeks);
})();
