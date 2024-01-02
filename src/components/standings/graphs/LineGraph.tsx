import { useState } from "react";
import * as d3 from "d3";
import { Graph } from "./Graph";
import { StandingsRow } from "../../standingstable/StandingsTable";
import { Entry, MANAGERS } from "../../../domain";
import { range } from "../../../helpers";
import { Manager } from "../../Manager";

export interface Point {
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
    standings: Map<number, Map<number, StandingsRow>>;
    gameweek: number;
    entries: Entry[];
    getY: (row: StandingsRow) => number;
    initialPoint?: Point;
    xConfig: AxisConfig;
    yConfig: AxisConfig;
    title: string;
}

const buildData = (
    standings: Map<number, Map<number, StandingsRow>>,
    gameweek: number,
    entries: number[],
    getY: (row: StandingsRow) => number,
    initialPoint?: Point,
    color?: string
): Data[] => {
    const gameweeks = range(gameweek + 1);

    //TODO rename foo
    const foo: Record<number, { x: number; y: number }[]> = {};
    gameweeks.map((gameweek) => {
        const standingsForWeek = standings.get(gameweek) ?? new Map();
        for (const [teamId, standing] of standingsForWeek) {
            if (entries.includes(teamId)) {
                const point = { x: gameweek, y: getY(standing) };
                const existingPoints = foo[teamId];
                if (existingPoints) {
                    existingPoints.push(point);
                } else {
                    foo[teamId] = initialPoint
                        ? [initialPoint, point]
                        : [point];
                }
            }
        }
    });

    return Object.entries(foo).map(([id, points], idx) => ({
        //TODO generate a proper index
        id: "foo",
        color:
            color ??
            MANAGERS.find((m) => Object.values(m.teams).includes(+id))?.color ??
            "#000",
        points,
    }));
};

const calculateXMax = (points: Point[]): number =>
    Math.max(...points.map((p) => p.x));
const calculateYMax = (points: Point[]): number =>
    Math.max(...points.map((p) => p.y));

const calculateYMin = (points: Point[]): number =>
    Math.min(...points.map((p) => p.y));

export const LineGraph = ({
    standings,
    gameweek,
    entries,
    xConfig,
    yConfig,
    title,
    getY,
    initialPoint,
}: Props) => {
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [hovered, setHovered] = useState<number | undefined>(undefined);

    const data = [
        ...buildData(
            standings,
            gameweek,
            entries.map((e) => e.id),
            getY,
            initialPoint,
            "#e5e7eb" //this is gray-200
        ),
        ...buildData(
            standings,
            gameweek,
            selectedEntries.concat(hovered !== undefined ? [hovered] : []),
            getY,
            initialPoint
        ),
    ];

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
        <>
            <Graph
                title={title}
                margins={{ top: 5, right: 10, bottom: 40, left: 40 }}
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
                        <text
                            x="50%"
                            y="100%"
                            textAnchor="middle"
                            className="text-gray-600 text-xs"
                            fill="currentColor"
                        >
                            {xConfig.title}
                        </text>
                    </>
                }
                yAxis={
                    <>
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
                    </>
                }
                body={
                    <>
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
                    </>
                }
            />
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap p-2 bg-default/20 rounded-medium">
                {entries.map((entry) => (
                    <div
                        className="cursor-pointer"
                        onClick={() =>
                            setSelectedEntries((entries) => {
                                if (entries.includes(entry.id)) {
                                    return entries.filter(
                                        (e) => e !== entry.id
                                    );
                                } else {
                                    return [...entries, entry.id];
                                }
                            })
                        }
                        onMouseEnter={() => setHovered(entry.id)}
                        onMouseLeave={() => setHovered(undefined)}
                    >
                        <Manager
                            manager={entry.manager}
                            teamName={entry.name}
                            border={
                                selectedEntries.includes(entry.id) ||
                                hovered === entry.id
                                    ? entry.manager.color
                                    : undefined
                            }
                        />
                    </div>
                ))}
            </div>
        </>
    );
};
