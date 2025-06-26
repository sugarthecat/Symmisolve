import { Link, } from 'react-router-dom'


function NavBar( {accessLevel, username}) {
    return (
        <nav>
            <Link to='/'>
                <button>
                    Home
                </button>
            </Link>
            {
                accessLevel < 0 ?
                    <Link to='/login'>
                        <button>
                            Log In
                        </button>
                    </Link> : ""
            }
            {
                accessLevel < 0 ?
                    <Link to='/signup'>
                        <button>
                            Sign Up
                        </button>
                    </Link> : ""
            }
            {
                accessLevel > 0 ?
                    <Link to='/upload'>
                        <button>
                            Upload Problem
                        </button>
                    </Link> : ""
            }
            {
                accessLevel >= 0 ?
                    <Link to={`/user/${username}`}>
                        <button>
                            My Profile
                        </button>
                    </Link> : ""
            }
        </nav>
    )
}

export default NavBar
