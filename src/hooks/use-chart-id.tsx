import { useRef } from "react";
import { v4 } from "uuid";

export function useChartId() {
	return useRef("chart-" + v4());
}
