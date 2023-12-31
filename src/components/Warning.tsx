export const Warning = ({ warnings }: { warnings: string[] }) => (
    <div className="bg-yellow-50 p-2 rounded-medium shadow-sm text-tiny flex max-h-[2.25rem] max-w-[2.25rem] group hover:max-w-full hover:max-h-full transition-[max-width,max-height] duration-1000 items-start" 
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5 text-yellow-400"
        >
            <path
                fill-rule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
            ></path>
        </svg>
        <div
            className="text-no-wrap text-yellow-700 inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-full transition-[max-width] duration-1000"
        >
            <ul className="list-disc pl-5">
                {warnings.map(warning => <li>{warning}</li>)}
            </ul>
        </div>
    </div>
);