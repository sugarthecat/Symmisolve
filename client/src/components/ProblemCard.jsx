import { Link } from "react-router-dom";
import "./ProblemCard.css";

function ProblemCard({ problem }) {
    return (
        <Link className="no-decor" to={`problem/${problem.id}`}>
            <div className="problem-card">
                <h3>
                    {problem.name} {!problem.is_active && `[SOLVED]`}
                </h3>
                <p>
                    <b>Created By {problem.user.username}</b>
                </p>
                <p>Size: {problem.current_size}</p>
                <p>
                    {problem.description.length > 100
                        ? problem.description.substring(0, 100) + "..."
                        : problem.description}
                </p>
            </div>
        </Link>
    );
}

export default ProblemCard;
