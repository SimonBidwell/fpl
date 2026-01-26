"use client";

import { Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "../icons/Search";

//TODO this can definitely be done better
export const DebouncedSearch = ({
    className = "w-full md:max-w-[44%]",
    onValueChange,
    onClear,
}: {
    className?: string
    onValueChange: (s: string) => void;
    onClear: () => void;
}) => {
    const [filterValue, setFilterValue] = useState("");

    useEffect(() => {
        const debounced = setTimeout(() => {
            onValueChange(filterValue);
        }, 200);

        return () => clearTimeout(debounced);
    }, [filterValue]);

    return (
        <Input
            isClearable
            className={className}
            classNames={{
                inputWrapper: "bg-default/40",
            }}
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => {
                setFilterValue("");
                onClear();
            }}
            onValueChange={setFilterValue}
        />
    );
};