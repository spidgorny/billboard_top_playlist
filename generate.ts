import {PlaylistGenerator} from "./src/PlaylistGenerator";
import {YearWeeks} from "./src/YearWeeks";
import {Billboard} from "./src/Billboard";
const billboard = new Billboard();

(async () => {
	let since = '1990-01-01';
	const yw = new YearWeeks();
	const weeks = yw.generateWeeks(since);

	const yearWeeks = yw.splitWeeksByYear(weeks);
	// fs.writeFileSync('yearWeeks.json', JSON.stringify(yearWeeks, null, "\t"));
	// yw.dumpYearWeek(yearWeeks);

	const generator = new PlaylistGenerator(billboard);
	await generator.constructPlaylists(yearWeeks);
})();
