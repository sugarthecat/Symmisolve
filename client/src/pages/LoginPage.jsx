import { useState } from 'react'
import { Link } from 'react-router-dom'
function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const sendLoginRequest = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_SRC}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        })
        if (res.status === 200) {
            //Succesful
            setMessage('Succesfully logged in!')
            setError('')
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
