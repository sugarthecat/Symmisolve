import { Link, } from 'react-router-dom'
import ACCESS_LEVELS from '../logic/accessLevels'


function NavBar({ accessLevel, username }) {
    return (
        <nav>
            <Link to='/'>
                <button>
                    Home
                </button>
            </Link>
            {
                accessLevel == ACCESS_LEVELS.LOGGED_OUT &&
                <Link to='/login'>
                    <button>
                        Log In
                    </button>
                </Link>
            }
            {
                accessLevel == ACCESS_LEVELS.LOGGED_OUT &&
                <Link to='/signup'>
                    <button>
                        Sign Up
                    </button>
                </Link>
            }
            {
                accessLevel >= ACCESS_LEVELS.RESEARCHER &&
                <Link to='/upload'>
                    <button>
                        Upload Problem
                    </button>
                </Link>
            }
            {
                accessLevel >= ACCESS_LEVELS.USER &&
                <Link to={`/user/${username}`}>
                    <button>
                        My Profile
                    </button>
                </Link>
            }
        </nav>
    )
}

export default NavBar
