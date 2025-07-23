import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeGetRequest, makePostRequest } from "../logic/requestTemplates.jsx";
import { useEffect } from "react";
function SignupPage({ updateUser }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const sendSignupRequest = async () => {
        const res = await makePostRequest("signup", { username, password });
        if (res.status === 200) {
            const json = await res.json();
            //Succesful
            updateUser(json.username, json.accessLevel);
            navigate("/");
            setError("");
            //TODO: On succesful signup, redirect to login page
        } else {
            setError(await res.json());
            setMessage("");
        }
    };
    const checkWhoIAm = async () => {
        const res = await makeGetRequest("whoami");
        if (res.status !== 404) {
            updateUser("", -1);
            navigate(`/`);
        }
    };

    useEffect(() => {
        checkWhoIAm();
    }, []);

    return (
        <div>
            <script src="https://accounts.google.com/gsi/client" async></script>

            <h1>Sign up</h1>
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
                <button onClick={sendSignupRequest}>Sign Up</button>
            </div>
            <p>
                {" "}
                If you already have an account, you can{" "}
                <Link className="return-link" to="../login">
                    Log In
                </Link>
                .
            </p>
            <p className="error"> {error} </p>
            <p> {message}</p>
        </div>
    );
}

export default SignupPage;
