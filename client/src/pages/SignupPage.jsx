import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { makePostRequest } from '../logic/requestTemplates.jsx';
function SignupPage({updateUser}) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const sendSignupRequest = async () => {
        const res = await makePostRequest('signup', { username, password })
        if (res.status === 200) {
            //Succesful
            updateUser(json.username,json.accessLevel)
            navigate('/')
            setError('')
            //TODO: On succesful signup, redirect to login page
        } else {
            setError(await res.json())
            setMessage('')
        }
    }
    return (
        <div>
            <h1>Sign up</h1>
            <div>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <br />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <br />
                <button onClick={sendSignupRequest} >Sign Up</button>
            </div>
            <p> If you already have an account, you can <Link to="../login">Log In</Link>.</p>
            <p className='error'> {error} </p>
            <p> {message}</p>

        </div>
    )
}

export default SignupPage
