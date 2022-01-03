import React, { ComponentType, useState } from "react";
import { ColumnChartProps, ColumnDisplayType } from "./charts/chart-common";

type Props = {
	ChartComponent: ComponentType<ColumnChartProps>;
};

export function ColumnChartWrapper({ ChartComponent }: Props) {
	const [columnType, setColumnType] = useState<ColumnDisplayType>();

	return (
		<>
			<select
				onChange={(e) => {
					console.log(e.target.value);
					setColumnType(
						ColumnDisplayType[e.target.value as keyof typeof ColumnDisplayType]
					);
				}}
			>
				{Object.values(ColumnDisplayType).map((v) => (
					<option key={v} value={v}>
						{v}
					</option>
				))}
			</select>
			<ChartComponent columnDisplayType={columnType} />
		</>
	);
}
