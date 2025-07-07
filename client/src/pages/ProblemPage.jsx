import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { makeGetRequest } from '../logic/requestTemplates';
function ProblemPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const [isLoaded, setIsLoaded] = useState(false);
    const [problem, setProblem] = useState({});

    const getProblem = async () => {
        const res = await makeGetRequest(`problem/${problemId}`);
        if (res.status === 200) {
            const data = await res.json();
            setProblem(data.problem);
            setIsLoaded(true);
        } else {
            navigate('/');
        }
    }
    useEffect(() => { getProblem(); }, [problemId])

    if (!isLoaded) {
        return (
            <div>
                <p>
                    Loading...
                </p>
            </div>
        )
    } else {
        return (
            <div>
                <Link to="/"> <p>Return Home</p></Link>
                <h1>{problem.name}</h1>
                <h3>By {problem.user.username}</h3>
                <p>{problem.description}</p>
            </div>
        )
    }
}

export default ProblemPage
