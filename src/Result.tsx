export interface Props {
    result: "win" | "loss" | "draw"
}

export const Result = ({ result }: Props) => {
    const bg = result === "win"
        ? "bg-success-500"
        : result === "draw"
        ? "bg-default-500"
        : "bg-danger-500";
    const text = result === "win" ? "W" : result === "draw" ? "D" : "L";
    return (
        <div
            className={`rounded text-xs flex items-center justify-center text-white h-4 w-4 ${bg}`}
        >
            {text}
        </div>
    );
};
