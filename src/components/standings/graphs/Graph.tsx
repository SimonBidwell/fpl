import { CSSProperties } from "react";

export interface Props {
    title: string;
    //TODO improve the typing here
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    xAxis?: React.ReactNode;
    yAxis?: React.ReactNode;
    body: React.ReactNode;
    labels?: React.ReactNode;
}

export const Graph = ({
    title,
    margins = { top: 5, right: 10, bottom: 40, left: 40 },
    xAxis,
    yAxis,
    body,
    labels,
}: Props) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className={`h-[30rem]`}>
                <div
                    className="relative h-full w-full overflow-hidden"
                    style={
                        {
                            "--marginTop": `${margins.top}px`,
                            "--marginRight": `${margins.right}px`,
                            "--marginBottom": `${margins.bottom}px`,
                            "--marginLeft": `${margins.left}px`,
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
                        {xAxis}
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
                        {yAxis}
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
                            {body}
                        </svg>
                        {labels}
                    </svg>
                </div>
            </div>
        </div>
    );
};
