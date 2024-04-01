import { Avatar, Card, CardBody } from "@nextui-org/react";
import { Choice } from "../api/domain";
import { useSeasonContext } from "../SeasonContext";
import { MoveRight } from "lucide-react";

const getRotation = (round: number, pick: number, managers: number) => {
    if (round * pick === 15 * managers) {
        return "hidden";
    }
    if (round % 2 === 0) {
        if (pick === managers) {
            return "rotate-90";
        } else {
            return "rotate-180";
        }
    } else {
        if (pick === managers) {
            return "rotate-90";
        } else {
            return "";
        }
    }
};

const DraftPick = ({ choice }: { choice: Choice }) => {
    const { index, pick, element, round } = choice;
    const { getPlayer, getPosition, getTeam } = useSeasonContext();
    const player = getPlayer(element);
    //TODO replace hard coding with number of teams
    const order = round % 2 === 1 ? index : round * 12 + 1 - pick;
    const position = getPosition(player?.element_type ?? -1);
    const team = getTeam(player?.team ?? -1);

    return (
        <Card
            shadow="sm"
            style={{ order }}
            className="text-xs relative"
        >
            <CardBody className="p-2 overflow-hidden h-16">
                <div className="max-w-3/4 w-max-3/4 w-3/4 overflow-hidden">
                    <div className="truncate">{player?.displayName}</div>
                    <div>
                        {position?.singular_name_short} - {team?.short_name}
                    </div>
                </div>
                <div className="absolute top-2 right-2 text-foreground-400">
                    {index}
                </div>
                <img
                    className="absolute h-3/5 bottom-0 right-0"
                    src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player?.code}.png`}
                />
                <MoveRight className={`bottom-1 left-1 h-4 w-3 absolute ${getRotation(
                        round,
                        pick,
                        12
                    )} text-foreground-400`}/>
            </CardBody>
        </Card>
    );
};

export const DraftBoard = () => {
    const { draft: maybeDraft, getEntry } = useSeasonContext();
    const draft = maybeDraft === "Unknown" ? [] : maybeDraft
    const order = draft.slice(0, 12);
    return (
        <div className="p-2 overflow-x-auto">
            <div className="grid grid-cols-[repeat(12,_minmax(8rem,_1fr))] gap-1 pt-4 pb-2 align-start text-center">
                {order.map((x, i) => (<div className="px-2 flex flex-col gap-1 items-center overflow-hidden">
                    <Avatar radius="md" src={`${import.meta.env.BASE_URL}/${getEntry(x.entry)?.manager?.id}.jpg`} />
                    <span className="text-small text-inherit truncate w-full">{getEntry(x.entry)?.name}</span>
                    <span className="text-tiny text-foreground-400 truncate w-full">{getEntry(x.entry)?.manager.name}</span>
                </div>
                ))}
            </div>
            <div className="grid grid-cols-[repeat(12,_minmax(8rem,_1fr))] gap-1 pb-2 align-start">
                {draft.map((d) => (
                    <DraftPick choice={d} />
                ))}
            </div>
        </div>
    );
};
