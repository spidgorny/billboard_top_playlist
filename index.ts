import * as fs from "fs";
import * as moment from "moment";
import {Billboard, Chart, Song} from "./src/Billboard";
import {PlaylistGenerator} from "./src/PlaylistGenerator";
import {YearWeeks} from "./src/YearWeeks";

console.log('Starting');

const billboard = new Billboard();

async function downloadAndCache(yearWeeks: moment.Moment[]) {
	for (const date of yearWeeks) {
		console.log(date.format('Y-MM-DD'));
		try {
			const chart: Chart = await billboard.fetchChartFromCache(date.format('Y-MM-DD'));
		} catch (e) {
			// go on to the next one
			break;
		}
	}
}

function dumpChart(chart: Chart) {
	for (const song of chart.songs) {
		console.log(song.rank, "\t", song.artist, ' - ', song.title);
	}
}

(async () => {
	let since = '1990-01-01';
	const yw = new YearWeeks();
	const weeks = yw.generateWeeks(since);
	await downloadAndCache(weeks);
	// const date = moment(since);
	// const chart: any = await fetchChartFromCache(date.format('Y-MM-DD'));
	// dumpChart(chart);
	// console.log(weeks.map(d => d.format('Y-MM-DD')));
	const yearWeeks = yw.splitWeeksByYear(weeks);
	fs.writeFileSync('yearWeeks.json', JSON.stringify(yearWeeks, null, "\t"));
	yw.dumpYearWeek(yearWeeks);

	const generator = new PlaylistGenerator(billboard);
	await generator.constructPlaylists(yearWeeks);
})();
