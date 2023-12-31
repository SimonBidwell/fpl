import { User } from "@nextui-org/react";
import { Records } from "../Records";
import { Manager as ManagerType } from "../domain";
import { CSSProperties, ReactNode } from "react";

export type Props = ManagerProps | DescriptionProps;
interface ManagerProps {
    manager: ManagerType;
    teamName: ReactNode;
    align?: "left" | "right";
    border?: string
}
interface DescriptionProps {
    id: number;
    teamName: ReactNode;
    description: ReactNode;
    align?: "left" | "right";
    border?: string;
}
const isManagerProps = (props: Props): props is ManagerProps =>
    Reflect.has(props, "manager");

export const Manager = (props: Props) => {
    const { teamName, align, border } = props;
    const { id, description } = isManagerProps(props)
        ? {
              id: props.manager.id,
              description: (
                  <>
                      {props.manager.name}{" "}
                      <Records records={props.manager.notablePlacements} />
                  </>
              ),
          }
        : { id: props.id, description: props.description };
    return (
        <User
            avatarProps={{
                radius: "md",
                src: `/${id}.jpg`,
                isBordered: !!border,
                style: border ? {
                    "--tw-ring-color": border
                } as CSSProperties : undefined
            }}
            description={description}
            name={teamName}
            classNames={align === "right" ? {
                "base": "flex-row-reverse",
                "description": "flex-row-reverse",
                "wrapper": "items-end"
            }: undefined}
        />
    );
};
