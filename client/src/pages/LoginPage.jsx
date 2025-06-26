import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { makePostRequest } from '../logic/requestTemplates.jsx';
function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const sendLoginRequest = async () => {
        const res = await makePostRequest('login', { username, password })
        if (res.status === 200) {
            //Succesful
            const json = await res.json()
            const loggedUsername = json.username;
            setMessage(json.message)
            navigate(`/user/${loggedUsername}`)
            //TODO: On succesful login, rediirect to account page.
        } else {
            setError(await res.json())
            setMessage('')
        }
    }
    return (
        <div>
            <h1>Log in</h1>
            <div>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <br />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <br />
                <button onClick={sendLoginRequest} >Log in</button>
            </div>
            <p> If you don't have an account, you can <Link to="../signup">Sign Up here</Link>.</p>
            <br />
            <p className='error'>
                {error}
            </p>
            <p>
                {message}
            </p>
        </div>
    )
}

export default LoginPage
