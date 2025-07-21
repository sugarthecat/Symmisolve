import { useEffect } from "react";
import { useState } from "react";
import { makeGetRequest, makePutRequest } from "../logic/requestTemplates";

function AdminPanelPage({ updateUser }) {
    const [user, setUser] = useState(null);
    const accessLevels = ["Regular User", "Researcher", "Admin"];
    const [error, setError] = useState("");
    const [usernameInput, setUsernameInput] = useState("");

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
        const res = await makePutRequest(`user/${username}`, { accessLevel: level });
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
                {user !== null && user.accessLevel == 0 && (
                    <button onClick={() => setAccessLevel(user.username, 1)}>
                        Grant Researcher Status
                    </button>
                )}
                {user !== null && user.accessLevel == 1 && (
                    <button onClick={() => setAccessLevel(user.username, 0)}>
                        Remove Researcher Status
                    </button>
                )}
            </div>
            <p className="error">{error}</p>
        </div>
    );
}

export default AdminPanelPage;
