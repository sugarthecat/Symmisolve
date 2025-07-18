import { Link } from "react-router-dom";
import ACCESS_LEVELS from "../logic/accessLevels";

function NavBar({ accessLevel, username }) {
    return (
        <nav>
            <Link to="/">
                <button>Home</button>
            </Link>
            <Link to="/help">
                <button>How To SAT Solve</button>
            </Link>
            {accessLevel === ACCESS_LEVELS.LOGGED_OUT && (
                <Link to="/login">
                    <button>Log In</button>
                </Link>
            )}
            {accessLevel === ACCESS_LEVELS.LOGGED_OUT && (
                <Link to="/signup">
                    <button>Sign Up</button>
                </Link>
            )}
            {(accessLevel === ACCESS_LEVELS.RESEARCHER || accessLevel === ACCESS_LEVELS.ADMIN) && (
                <Link to="/upload">
                    <button>Upload Problem</button>
                </Link>
            )}
            {accessLevel === ACCESS_LEVELS.ADMIN && (
                <Link to={`/admin`}>
                    <button>Admin Panel</button>
                </Link>
            )}
            {accessLevel != ACCESS_LEVELS.LOGGED_OUT && (
                <Link to={`/user/${username}`}>
                    <button>My Profile</button>
                </Link>
            )}
        </nav>
    );
}

export default NavBar;
