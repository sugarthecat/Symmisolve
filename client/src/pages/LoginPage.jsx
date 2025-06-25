import { useState } from 'react'
import { Link } from 'react-router-dom'
function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');
    return (
        <div>
            <h1>Log in</h1>
            <div>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <br/>
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <p> If you don't have an account, you can <Link to="../signup">Sign Up here</Link>.</p>
            <br/>
            <p className='error'>
                {error}
            </p>
        </div>
    )
}

export default LoginPage
