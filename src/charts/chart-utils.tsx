import { v4 } from "uuid";

export function getChartId() {
	return "chart-" + v4();
}
