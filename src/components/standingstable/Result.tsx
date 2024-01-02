export interface Props {
    result: "win" | "loss" | "draw" | undefined;
}

//TODO extract this out to be it's own thing independent of standings table
export const Result = ({ result }: Props) => {
    const bg =
        result === "win"
            ? "bg-success-500"
            : result === "draw"
            ? "bg-default-500"
            : "bg-danger-500";
    const text =
        result === "win"
            ? "W"
            : result === "draw"
            ? "D"
            : result === "loss"
            ? "L"
            : "?";
    return (
        <div
            className={`rounded text-xs flex items-center justify-center text-white h-4 w-4 ${bg}`}
        >
            {text}
        </div>
    );
};
