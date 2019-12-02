const {getChart} = require('billboard-top-100');
const cache = require('cacache');

async function sleep(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}

export interface Song {
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

export interface Chart {
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

export class Billboard {

	async cacheGetSet(key: string, callback: Function) {
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
	fetchChartFor(dateYMD: string): Promise<Chart> {
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

	async fetchChartFromCache(dateYMD: string): Promise<Chart> {
		return await this.cacheGetSet(dateYMD, async () => {
			console.log(dateYMD);
			let chartData = await this.fetchChartFor(dateYMD);
			await sleep(1000 * 30);
			return chartData;
		});
	}

}
