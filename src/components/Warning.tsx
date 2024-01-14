import { WarningIcon } from "./WarningIcon"

export const Warning = ({ warnings }: { warnings: string[] }) => (
    <div className="bg-yellow-50 p-2 rounded-medium shadow-sm text-tiny flex max-h-[2.25rem] max-w-[2.25rem] group hover:max-w-full hover:max-h-full transition-[max-width,max-height] duration-1000 items-start" 
    >
        <WarningIcon level="elevated"/>
        <div
            className="text-no-wrap text-yellow-700 inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-full transition-[max-width] duration-1000"
        >
            <ul className="list-disc pl-5">
                {warnings.map(warning => <li>{warning}</li>)}
            </ul>
        </div>
    </div>
);