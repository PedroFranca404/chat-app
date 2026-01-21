import { useEffect } from "react";
import { handleGetFriends, Friend } from "../../../services/Friends";

export const useInitialFriends = (
    setFriends: React.Dispatch<React.SetStateAction<Friend[]>>
) => {
    useEffect(() => {
        handleGetFriends().then(setFriends).catch(console.error);
    }, [setFriends]);
};
