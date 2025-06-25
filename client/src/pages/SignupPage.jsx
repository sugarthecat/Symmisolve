import { useState } from 'react';
import { Link } from 'react-router-dom'
function SignupPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');
    return (
        <div>
            <h1>Sign up</h1>
            <div>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <br/>
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <p> If you already have an account, you can <Link to="../login">Log In</Link>.</p>
        </div>
    )
}

export default SignupPage
