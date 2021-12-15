import { v4 } from "uuid";

export function generateChartId() {
	return "chart-" + v4();
}
