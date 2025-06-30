import { Link, } from 'react-router-dom'
import "./ProblemCard.css"

function ProblemCard({ problem}) {
    return (
        <div className='problem-card'>
            <h3><Link to={`problem/${problem.id}`}>{problem.name}</Link></h3>
            <p>
                <b>Created By {problem.user.username}</b>
            </p>
            <p>
                {problem.description}
            </p>
        </div>
    )
}

export default ProblemCard
