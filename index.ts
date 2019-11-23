import * as fs from "fs";

const {getChart} = require('billboard-top-100');
const cache = require('cacache');
const prettyMilliseconds = require('pretty-ms');
import * as moment from "moment";

console.log('Starting');

interface Song {
	rank: number;
	title: string;
	artist: string;
	cover: string;
	position: {
		'Last Week': number;
		'Peak Position': string;
		'Wks on Chart': string;
	},
	from: {
		date: string;
		week: number;
		pos: string;
	};
}

interface Chart {
	songs: Song[],
	week: string,
	previousWeek: {
		date: string;
		url: string;
	},
	nextWeek: {
		date: string;
		url: string;
	},
}

interface YearWeeks {
	[key: string]: moment.Moment[]
}

async function cacheGetSet(key: string, callback: Function) {
	const cachePath = 'cache';
	try {
		const stored = await cache.get(cachePath, key);
		if (stored.data) {
			return JSON.parse(stored.data);
		}
	} catch (e) {
		// continue down
	}
	const value = await callback();
	await cache.put(cachePath, key, JSON.stringify(value));
	return value;
}

// date format YYYY-MM-DD
function fetchChartFor(dateYMD: string): Promise<Chart> {
	return new Promise((resolve, reject) => {
		getChart('hot-100', dateYMD, (err, chart) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve(chart);
		});
	});
}

async function fetchChartFromCache(dateYMD: string): Promise<Chart> {
	return await cacheGetSet(dateYMD, async () => {
		return await fetchChartFor(dateYMD);
	});
}

function generateWeeks(since: string) {
	const dates = [];
	let date = moment(since);
	do {
		dates.push(date.clone());
		date = date.add(1, 'week');
	} while (date.isBefore(moment()));
	return dates;
}

async function downloadAndCache(since: string) {
	for (const date of generateWeeks(since)) {
		console.log(date.format('Y-MM-DD'));
		try {
			const chart: Chart = await fetchChartFromCache(date.format('Y-MM-DD'));
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

function splitWeeksByYear(weeks: any[]) {
	const groups = {};
	weeks.map((date: moment.Moment) => {
		const year = date.year();
		if (!(year in groups)) {
			groups[year] = [];
		}
		groups[year].push(date);
	});
	return groups;
}

function dumpYearWeek(yearWeeks: YearWeeks) {
	const yearWeeksNice = Object.values(yearWeeks).map((group: moment.Moment[]) => {
		return group.map(d => d.format('Y-MM-DD'));
	});
	console.log(yearWeeksNice);
}

async function constructPlaylists(yearWeeks: YearWeeks) {
	for (const year in Object.keys(yearWeeks)) {
		console.log(year);
		const playlist = await constructYearPlaylist(yearWeeks[year]);
		dumpPlaylist(playlist);
		fs.writeFileSync('playlist' + year + '.json', JSON.stringify(playlist, null, 4));
	}
}

function playlistIncludes(playlist: Song[], song: Song): boolean {
	return playlist.filter((el) => {
		return el.title == song.title && el.artist == song.artist;
	}).length > 0;
}

async function constructYearPlaylist(weeks: moment.Moment[]) {
	const playlist = [];
	for (const week of weeks) {
		let ymd = week.format('Y-MM-DD');
		const top100 = await fetchChartFromCache(ymd);
		for (const i in top100.songs) {
			const song = top100.songs[i];
			if (!playlistIncludes(playlist, song)) {
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

function dumpPlaylist(playlist: Song[]) {
	for (const song of playlist) {
		console.log(song.from.week + ': ' + song.rank, "\t", song.artist, '-', song.title);
	}
}

(async () => {
	let since = '1990-01-01';
	await downloadAndCache(since);
	const date = moment(since);
	// const chart: any = await fetchChartFromCache(date.format('Y-MM-DD'));
	// dumpChart(chart);
	const weeks = generateWeeks(since);
	// console.log(weeks.map(d => d.format('Y-MM-DD')));
	const yearWeeks = splitWeeksByYear(weeks);
	// fs.writeFileSync('yearWeeks.json', JSON.stringify(yearWeeks, null, 4));

	// dumpYearWeek(yearWeeks);
	await constructPlaylists(yearWeeks);
})();
