import { CSSProperties, Fragment } from "react";
import * as d3 from "d3";

interface Point {
    x: number;
    y: number;
}

export interface Data {
    id: React.Key;
    color: string;
    points: Point[];
}

interface AxisConfig {
    title: string;
    direction?: "ASC" | "DESC";
    min?: number;
    max?: number;
    ticks?: number;
}

export interface Props {
    data: Data[];
    xConfig: AxisConfig;
    yConfig: AxisConfig;
    title: string;
}

const calculateXMax = (points: Point[]): number =>
    Math.max(...points.map((p) => p.x));
const calculateYMax = (points: Point[]): number =>
    Math.max(...points.map((p) => p.y));

const calculateYMin = (points: Point[]): number => 
    Math.min(...points.map((p) => p.y))

export const LineGraph = ({ data, xConfig, yConfig, title }: Props) => {
    const allPoints = data.flatMap((d) => d.points);

    const xMax = xConfig?.max ?? calculateXMax(allPoints);
    const xScale = d3
        .scaleLinear()
        .domain([xConfig?.min ?? 0, xMax])
        .range(xConfig?.direction === "DESC" ? [100, 0] : [0, 100]);
    const xTicks = xScale.ticks(xConfig?.ticks ?? xMax);

    const yMax = yConfig?.max ?? calculateYMax(allPoints);
    const yMin = yConfig?.min ?? calculateYMin(allPoints);
    const yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range(yConfig?.direction === "DESC" ? [0, 100] : [100, 0]);
    const yTicks = yScale.ticks(yConfig?.ticks ?? yMax);

    const line = d3
        .line<Point>()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y));

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="h-[30rem]">
                <div
                    className="relative h-full w-full overflow-hidden"
                    style={
                        {
                            "--marginTop": "5px",
                            "--marginRight": "10px",
                            "--marginBottom": "40px",
                            "--marginLeft": "40px",
                        } as CSSProperties
                    }
                >
                    {/* X axis */}
                    <svg
                        className="absolute inset-0 
                top-[calc(100%-var(--marginBottom))]
                left-[var(--marginLeft)]
                h-[var(--marginBottom)]
                w-[calc(100%-var(--marginLeft)-var(--marginRight))]
                overflow-visible
                "
                    >
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
                        <text
                            x="50%"
                            y="100%"
                            textAnchor="middle"
                            className="text-gray-600 text-xs"
                            fill="currentColor"
                        >
                            {xConfig.title}
                        </text>
                    </svg>
                    {/* Y axis */}
                    <svg
                        className="absolute inset-0
                h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                w-[var(--marginLeft)]
                translate-y-[var(--marginTop)]
                overflow-visible
                "
                    >
                        {yTicks.map((tick, i) => (
                            <text
                                key={i}
                                x="100%"
                                y={`${yScale(tick)}%`}
                                alignmentBaseline="middle"
                                textAnchor="middle"
                                className="text-gray-600 text-xs tabular-nums -translate-x-4"
                                fill="currentColor"
                            >
                                {tick}
                            </text>
                        ))}
                        <text
                            x="0"
                            y="48%"
                            transform="rotate(270)"
                            textAnchor="start"
                            className="text-gray-600 text-xs origin-center"
                            fill="currentColor"
                        >
                            {yConfig.title}
                        </text>
                    </svg>
                    {/* Chart area */}
                    <svg
                        className="absolute inset-0
                h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                w-[calc(100%-var(--marginLeft)-var(--marginRight))]
                translate-x-[var(--marginLeft)]
                translate-y-[var(--marginTop)]
                overflow-visible 
                "
                    >
                        <svg
                            viewBox="0 0 100 100"
                            className="overflow-visible"
                            preserveAspectRatio="none"
                        >
                            {/* Grid lines */}
                            {yTicks.map((tick, i) => (
                                <g
                                    transform={`translate(0,${yScale(tick)})`}
                                    className="text-gray-300"
                                    key={i}
                                >
                                    <line
                                        x1={0}
                                        x2={100}
                                        stroke="currentColor"
                                        strokeDasharray="6,5"
                                        strokeWidth={0.5}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </g>
                            ))}

                            {/* Lines */}
                            {data.map(({ points, color }) => {
                                const toDraw = line(points);
                                if (toDraw) {
                                    return (
                                        <g>
                                            {/* Line */}
                                            <path
                                                d={toDraw}
                                                fill="none"
                                                style={{ color }}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                vectorEffect="non-scaling-stroke"
                                            />
                                            {/* Point Markers */}
                                            {points.map(({ x, y }) => (
                                                <path
                                                    d={`M ${xScale(x)} ${yScale(
                                                        y
                                                    )} l 0.0001 0`}
                                                    vectorEffect="non-scaling-stroke"
                                                    strokeWidth="6"
                                                    strokeLinecap="round"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    style={{ color }}
                                                />
                                            ))}
                                        </g>
                                    );
                                }
                            })}
                        </svg>
                    </svg>
                </div>
            </div>
        </div>
    );
};
