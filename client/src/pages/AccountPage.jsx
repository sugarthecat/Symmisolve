import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { makeGetRequest, makePostRequest } from '../logic/requestTemplates';
function AccountPage() {
    const navigate = useNavigate();
    const { username } = useParams();
    const [displayUsername, setDisplayUsername] = useState(username);
    const [accessLevel, setAccessLevel] = useState("Access Level");
    const [sizeReduced, setSizeReduced] = useState(0);
    const [isMe, setIsMe] = useState(false);
    const updateData = async () => {
        const res = await makeGetRequest(`user/${username}`);
        if (res.status === 200) {
            const data = await res.json()
            setDisplayUsername(data.username);
            switch (data.accessLevel) {
                case 1:
                    setAccessLevel("Researcher");
                    break;
                case 2:
                    setAccessLevel("Admin");
                    break;
                default:
                    setAccessLevel("User");
                    break;
            }
            setIsMe(data.isMe);
            setSizeReduced(data.sizeReduction);
        } else if (res.status == 404) {
            navigate('../../')
        }
    }
    useState(() => {
        updateData();
    },[username]);

    const signOut = async () => {
        const res = await makePostRequest(`logout`);
        if(res.status === 200) {
            navigate('../../login')
        }
    }
    return (
        <div>
            <h1>{displayUsername}</h1>
            <h2>{accessLevel}</h2>
            <p>
                Date Joined: Today
            </p>
            <p>
                Total Size Reduction: {sizeReduced}
            </p>
            {isMe ? <p><button onClick={signOut}>Sign Out</button></p> : ""}
        </div>
    )
}

export default AccountPage
