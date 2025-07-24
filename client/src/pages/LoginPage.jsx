import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeGetRequest, makePostRequest } from "../logic/requestTemplates.jsx";
import "./LoginPage.css"
function LoginPage({ updateUser }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const sendLoginRequest = async () => {
        const res = await makePostRequest("login", { username, password });
        if (res.status === 200) {
            //Succesful
            const json = await res.json();
            updateUser(json.username, json.accessLevel);
            navigate(`/user/${json.username}`);
            //TODO: On succesful login, rediirect to account page.
        } else {
            setError(await res.json());
            setMessage("");
        }
    };
    const checkWhoIAm = async () => {
        const res = await makeGetRequest("whoami");
        if (res.status === 200) {
            const data = await res.json();
            updateUser(data.username, data.accessLevel);
            navigate(`/user/${data.username}`);
        } else {
            updateUser("", -1);
        }
    };
    useEffect(() => {
        checkWhoIAm();
    }, []);
    return (
        <div>
            <script src="https://accounts.google.com/gsi/client" async></script>
            <h1>Log in</h1>
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                <button onClick={sendLoginRequest}>Log in</button>
                <br />
                <br />
                <div>
                    <div id="siwg">
                        <div id="g_id_onload"
                            data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                            data-login_uri={import.meta.env.VITE_API_SRC + "/api/siwg"}
                            data-auto_prompt="false">
                        </div>
                        <div className="g_id_signin"
                            data-type="standard"
                            data-size="large"
                            data-theme="filled_blue"
                            data-text="sign_in_with"
                            data-shape="rectangular"
                            data-width="200"
                            data-logo_alignment="left">
                        </div>
                    </div>
                </div>
            </div>
            <p>
                {" "}
                If you don't have an account, you can{" "}
                <Link className="return-link" to="../signup">
                    Sign Up here
                </Link>
                .
            </p>
            <br />
            <p className="error">{error}</p>
            <p>{message}</p>
        </div>
    );
}

export default LoginPage;
