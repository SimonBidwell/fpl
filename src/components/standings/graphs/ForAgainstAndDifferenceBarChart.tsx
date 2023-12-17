import * as d3 from "d3";
import { Graph } from "./Graph";
import { Entry } from "../../../domain";

export interface Point {
    scoreFor: number;
    scoreAgainst: number;
    difference: number;
    entry: Entry;
}

export interface Props {
    title: string;
    data: Point[];
}

const calculateXDomain = (points: Point[]): [number, number] => {
    const max = Math.max(...points.flatMap((p) => [p.scoreFor, p.scoreAgainst]));
    const roundedUpToNearest = max < 100 ? 25 : 100
    const rounded = Math.ceil(max / roundedUpToNearest) * roundedUpToNearest;
    return [-rounded, rounded]
};

export const ForAgainstAndDifferenceBarChart = ({ title, data }: Props) => {
    const sortedData = data.toSorted((a, b) => b.difference - a.difference);

    const xScale = d3
        .scaleLinear()
        .domain(calculateXDomain(sortedData))
        .range([0, 100]);
    const xTicks = xScale.ticks(20);

    const yScale = d3
        .scaleBand()
        .domain(sortedData.map((d) => d.entry.name))
        .range([0, 100])
        .padding(0.1);

    return (
        <Graph
            title={title}
            margins={{ top: 0, bottom: 0, right: 0, left: 150 }}
            xAxis={
                <>
                    {xTicks.map((tick, i) => (
                        <text
                            key={i}
                            x={`${xScale(tick)}%`}
                            y="0"
                            textAnchor="middle"
                            alignmentBaseline="hanging"
                            fill="currentColor"
                            className="text-gray-600 text-xs tabular-nums translate-y-3"
                        >
                            {tick}
                        </text>
                    ))}
                </>
            }
            yAxis={
                <>
                    {data.map((d) => (
                        <text
                            y={`${yScale(d.entry.name)}%`}
                            className="text-xs text-gray-500"
                        >
                            <tspan
                                x={"100%"}
                                dy="1.2em"
                                textAnchor="end"
                                className="font-bold"
                            >
                                {d.entry.name}
                            </tspan>
                            <tspan x={"100%"} dy="1.2em" textAnchor="end">
                                {d.entry.manager.name}
                            </tspan>
                        </text>
                    ))}
                </>
            }
            body={
                <>
                    {data.map((d, i) => {
                        return (
                            <>
                                <rect
                                    key={`${d.entry.id}-score-for-bar`}
                                    x={xScale(0)}
                                    y={yScale(d.entry.name)}
                                    width={xScale(d.scoreFor) - xScale(0)}
                                    height={yScale.bandwidth()}
                                    className="fill-gray-200"
                                />
                                <rect
                                    key={`${d.entry.id}-score-against-bar`}
                                    x={xScale(-d.scoreAgainst)}
                                    y={yScale(d.entry.name)}
                                    width={xScale(d.scoreAgainst) - xScale(0)}
                                    height={yScale.bandwidth()}
                                    className="fill-gray-200"
                                    
                                />
                                <rect
                                    key={`${d.entry.id}-difference-bar`}
                                    x={
                                        d.difference >= 0
                                            ? xScale(0)
                                            : xScale(d.difference)
                                    }
                                    y={yScale(d.entry.name)}
                                    width={
                                        xScale(Math.abs(d.difference)) -
                                        xScale(0)
                                    }
                                    height={yScale.bandwidth()}
                                    className={
                                        d.difference >= 0
                                            ? "fill-green-500"
                                            : "fill-red-500"
                                    }
                                />
                            </>
                        );
                    })}
                </>
            }
            labels={
                <>
                    {data.map((d, i) => {
                        return (
                            <>
                                <text
                                    fill="currentColor"
                                    x={`${xScale(d.scoreFor) - 0.5}%`}
                                    y={`${
                                        (yScale(d.entry.name) ?? 0) +
                                        yScale.bandwidth() / 2
                                    }%`}
                                    className="text-xs text-gray-500"
                                    dominantBaseline="middle"
                                    textAnchor="end"
                                >
                                    +{d.scoreFor.toFixed(0)}
                                </text>
                                <text
                                    fill="currentColor"
                                    x={`${xScale(-d.scoreAgainst) + 0.5}%`}
                                    y={`${
                                        (yScale(d.entry.name) ?? 0) +
                                        yScale.bandwidth() / 2
                                    }%`}
                                    className="text-xs text-gray-500"
                                    dominantBaseline="middle"
                                    textAnchor="start"
                                >
                                    -{d.scoreAgainst.toFixed(0)}
                                </text>
                                <text
                                    fill="currentColor"
                                    x={`${
                                        xScale(0) +
                                        (d.difference == 0
                                            ? 0
                                            : d.difference > 0
                                            ? 0.5
                                            : -0.5)
                                    }%`}
                                    y={`${
                                        (yScale(d.entry.name) ?? 0) +
                                        yScale.bandwidth() / 2
                                    }%`}
                                    className="text-xs text-black"
                                    dominantBaseline="middle"
                                    textAnchor={
                                        d.difference == 0
                                            ? "middle"
                                            : d.difference > 0
                                            ? "start"
                                            : "end"
                                    }
                                >
                                    {d.difference > 0 ? "+" : ""}
                                    {d.difference.toFixed(0)}
                                </text>
                            </>
                        );
                    })}
                </>
            }
        />
    );
};
