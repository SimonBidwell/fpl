import { useQuery } from "react-query";
import { getAllLeagueDetails } from "./api/requests";
import { Standings } from "./components/standings/Standings";

export const App = () => {
    const { isLoading, error, data } = useQuery("leagueDetails", () =>
        getAllLeagueDetails()
    );

    if (isLoading) return "Loading...";
    if (error || data === undefined) {
        return "Error";
    }

    return (
        <main className="h-screen w-screen flex items-center justify-center">
            <div className="w-4/5 h-[90%]">
                <Standings data={data} />
            </div>
        </main>
    );
};
