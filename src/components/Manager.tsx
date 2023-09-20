import { User } from "@nextui-org/react";
import { Records } from "../Records";
import { Manager as ManagerType } from "../domain";
import { ReactNode } from "react";

export type Props = ManagerProps | DescriptionProps;
interface ManagerProps {
    manager: ManagerType;
    teamName: ReactNode;
}
interface DescriptionProps {
    id: number;
    teamName: ReactNode;
    description: ReactNode;
}
const isManagerProps = (props: Props): props is ManagerProps =>
    Reflect.has(props, "manager");

export const Manager = (props: Props) => {
    const { teamName } = props;
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
                radius: "lg",
                src: `./${id}.jpg`,
            }}
            description={description}
            name={teamName}
        />
    );
};
