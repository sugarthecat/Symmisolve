import { useEffect } from "react";
import { useState } from "react";
import { makeDeleteRequest, makeGetRequest, makePutRequest } from "../logic/requestTemplates";
import { useNavigate } from "react-router";
import ACCESS_LEVELS from "../logic/accessLevels";
import ConfirmWindow from "../components/ConfirmWindow";

function AdminPanelPage({ updateUser }) {
    const [user, setUser] = useState(null);
    const accessLevels = ["Regular User", "Researcher", "Admin"];
    const [error, setError] = useState("");
    const [popUp, setPopUp] = useState(<></>);
    const [usernameInput, setUsernameInput] = useState("");
    const navigate = useNavigate();

    async function fetchUser(username) {
        const res = await makeGetRequest(`user/${username}`);
        const data = await res.json();
        if (res.status === 200) {
            setUser(data);
            setError("");
        } else {
            setUser(null);
            setError(error);
        }
    }
    async function setAccessLevel(username, level) {
        const res = await makePutRequest(`user/${username}`, { newAccessLevel: level });
        const data = await res.json();
        if (res.status === 200) {
            setUser(data);
        } else {
            setError(data);
        }
    }

    function onUsernameInputChange(event) {
        setUsernameInput(event.target.value);
    }

    const checkWhoIAm = async () => {
        const res = await makeGetRequest("whoami");
        let failed = false;
        if (res.status === 200) {
            const data = await res.json();
            if (data.accessLevel !== ACCESS_LEVELS.ADMIN) {
                failed = true;
            }
        } else {
            failed = true;
        }
        if (failed) {
            updateUser("", -1);
            navigate(`/`);
        }
    };
    const clearPopUp = () => {
        setPopUp(<></>);
    };
    const deleteSelectedUser = async () => {
        const res = await makeDeleteRequest(`user/${user.username}`);
        if (res.status === 200) {
            setUser(null);
        } else {
            setError("Delete Request Failed");
        }
        clearPopUp();
    };
    useEffect(() => {
        checkWhoIAm();
    }, []);
    return (
        <div>
            <h1>Admin Panel</h1>
            <h2>User Access Level Editor</h2>
            <p>
                Search For user: {"  "}
                <input
                    value={usernameInput}
                    onChange={onUsernameInputChange}
                    onKeyDown={(event) => {
                        if (event.key == "Enter") {
                            fetchUser(usernameInput);
                            event.preventDefault();
                        }
                    }}
                />
                <button
                    onClick={() => {
                        fetchUser(usernameInput);
                    }}
                >
                    Search
                </button>
            </p>
            <div>
                {user !== null && (
                    <>
                        <h3>{user.username}</h3>
                        <p>Access Level: {accessLevels[user.accessLevel]} </p>
                        <p>Total Contribution: {user.sizeReduction} </p>
                    </>
                )}
                {user !== null && user.accessLevel === ACCESS_LEVELS.USER && (
                    <button onClick={() => setAccessLevel(user.username, 1)}>
                        Grant Researcher Status
                    </button>
                )}
                {user !== null && user.accessLevel === ACCESS_LEVELS.RESEARCHER && (
                    <button onClick={() => setAccessLevel(user.username, 0)}>
                        Remove Researcher Status
                    </button>
                )}
                {user !== null &&
                    (user.accessLevel === ACCESS_LEVELS.RESEARCHER ||
                        user.accessLevel === ACCESS_LEVELS.USER) && (
                        <button
                            onClick={() =>
                                setPopUp(
                                    <ConfirmWindow
                                        message={`Are you sure you want to permanently delete ${user.username}?`}
                                        action={deleteSelectedUser}
                                        deleteSelf={clearPopUp}
                                    />
                                )
                            }
                        >
                            Delete User
                        </button>
                    )}
            </div>
            <p className="error">{error}</p>
            {popUp}
        </div>
    );
}

export default AdminPanelPage;
