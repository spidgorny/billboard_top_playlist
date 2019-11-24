import * as moment from "moment";

export interface IYearWeeks {
	[key: number]: moment.Moment[]
}

export class YearWeeks {

	generateWeeks(since: string): moment.Moment[] {
		const dates = [];
		let date = moment(since);
		do {
			dates.push(date.clone());
			date = date.add(1, 'week');
		} while (date.isBefore(moment()));
		return dates;
	}

	splitWeeksByYear(weeks: any[]): IYearWeeks {
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

	dumpYearWeek(yearWeeks: IYearWeeks) {
		const yearWeeksNice = Object.values(yearWeeks).map((group: moment.Moment[]) => {
			return group.map(d => d.format('Y-MM-DD'));
		});
		const keys = Object.keys(yearWeeks);
		const yearWeeksWithKeys = Object.assign({}, ...keys.map((k, i) => {
			return {[k]: yearWeeksNice[i]};
		}));
		console.log(yearWeeksWithKeys);
	}

}
