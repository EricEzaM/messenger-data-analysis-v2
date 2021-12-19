export enum ColumnDisplayType {
	Normal = "Normal",
	Stacked = "Stacked",
	StackedNormalised = "StackedNormalised",
}

export type GroupAndStackConfigurationType =
	| {
			groups?: string[][];
			stack?: { normalize?: boolean };
	  }
	| undefined;

export type ColumnChartProps = {
	columnDisplayType?: ColumnDisplayType;
};

export function getStackConfiguration(
	columnDefinitions: [string, ...number[]][],
	displayType: ColumnDisplayType = ColumnDisplayType.Normal
): GroupAndStackConfigurationType {
	switch (displayType) {
		case ColumnDisplayType.Normal:
			return undefined;
		case ColumnDisplayType.Stacked:
			return { groups: [[...columnDefinitions.map((v) => v[0])]] };
		case ColumnDisplayType.StackedNormalised:
			return {
				groups: [[...columnDefinitions.map((v) => v[0])]],
				stack: { normalize: true },
			};
		default:
			return undefined;
	}
}

export function compareFnColumns(a: [string, ...any[]], b: [string, ...any[]]) {
	return a[0].localeCompare(b[0]);
}
