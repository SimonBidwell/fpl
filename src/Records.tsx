import { Record } from "./domain"
import { Tooltip } from "@nextui-org/react"

export interface Props {
    records: Record[]
}
export const Records = ({records}: Props) => 
    <>{records.map(record => <Record record={record}/>)}</>

const Record = ({record}: {record: Record}) => {
    const { season, position } = record
    const content = position === 1 ? "👑" : position === 12 ? "🍔" : undefined
    if (content) {
        //TODO make this message better
        return <Tooltip content={`Finished in position ${position} in ${season}`}>
           <span>{content}</span>
       </Tooltip>
    } else {
        return null;
    }
}