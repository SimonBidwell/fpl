import { ReactNode } from "react"
import { Redirect, useParams } from "wouter"

export interface Props {
    defaultGameWeek: number
    isValidGameWeek: (gameWeek: number, defaultGameWeek: number) => boolean
    children: ReactNode
}

export const WithDefaultGameWeek = ({defaultGameWeek, children, isValidGameWeek}: Props) => {
    const { gameWeek } = useParams();
    if (gameWeek !== undefined && isValidGameWeek(Number(gameWeek), defaultGameWeek)) {
        return children
    } else {
        return <Redirect to={`/${defaultGameWeek}`} replace/>
    }
}