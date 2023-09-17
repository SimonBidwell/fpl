import { Tooltip } from "@nextui-org/react";

export interface Props {
    lastRank: number;
    currentRank: number;
}
export const MovementIcon = ({ lastRank, currentRank }: Props) => {
    const movedUp = lastRank > currentRank;
    const movedDown = lastRank < currentRank;
    const noMovement = lastRank === currentRank;

    //TODO make tooltip nicer
    return (
        <Tooltip
            content={`Moved from ${lastRank} to ${currentRank}`}
            placement="right"
        >
            <div
                className={`rounded-full flex items-center w-3 h-3 ${
                    noMovement
                        ? "bg-default-500"
                        : movedDown
                        ? "bg-danger-500"
                        : "bg-success-500"
                }`}
            >
                {noMovement ? null : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        className={`fill-white ${
                            movedDown ? "rotate-180" : ""
                        }`}
                    >
                        <path
                            color="currentColor"
                            d="M4.5,6.27851588 L5.1004646,5.63925794 C5.43077928,5.2876031 5.70475818,5 5.70967916,5 C5.71460014,5 6.23194007,5.54639596 6.85921456,6.2144865 L8,7.428973 L9.14078544,6.2144865 C9.76831893,5.5467015 10.2856309,5 10.2903208,5 C10.2952427,5 10.5695007,5.28761055 10.8995354,5.63925794 L11.5,6.27851588 L9.75217699,8.13925794 C8.79080084,9.16274432 8.00246399,10 8.000014,10 C7.99756401,10 7.20894716,9.16281884 6.24785101,8.13925794 L4.5,6.27851588 Z"
                            transform="matrix(1 0 0 -1 0 15)"
                        ></path>
                    </svg>
                )}
            </div>
        </Tooltip>
    );
};
