const {getChart} = require('billboard-top-100');
const cacheManager = require('cache-manager');
const fsStore = require('cache-manager-fs');
const memoryCache = cacheManager.caching({
	store: fsStore.create({
		path: 'cache',
		ttl: 60*60*24*365,
		maxsize: 1024*1024*1024,
	}),
	path: 'cache',
	ttl: 60*60*24*365,
	maxsize: 1024*1024*1024,
});
const prettyMilliseconds = require('pretty-ms');
console.log('Starting');

// date format YYYY-MM-DD
function fetchChartFor(dateYMD: string): Promise<any> {
	console.log('fetchChartFor', dateYMD);
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

async function fetchChartFromCache(dateYMD: string) {
	console.log('fetchChartFromCache', dateYMD);
	return await memoryCache.wrap(dateYMD, async () => {
		return await fetchChartFor(dateYMD);
	}, {ttl: 60*60*24*365});
}

(async () => {
	const start = new Date();
	const done0 = new Date().getTime() - start.getTime();
	console.log(prettyMilliseconds(done0));

	const chart: any = await fetchChartFromCache('2001-08-27');
	const done1 = new Date().getTime() - start.getTime();
	console.log(prettyMilliseconds(done1));

	const chart2: any = await fetchChartFromCache('2001-08-27');
	const done2 = new Date().getTime() - start.getTime();
	console.log(prettyMilliseconds(done2));

	// console.log(chart);
	for (const song of chart.songs) {
		// console.log(song.rank, "\t", song.artist, ' - ', song.title);
	}
	// console.log(song);
})();
