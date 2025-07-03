import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { makeGetRequest } from '../logic/requestTemplates';
function SolverPage() {
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
            console.log(data);
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
                <p><Link to={`/problem/${problemId}`}>Return to Problem Page</Link></p>
                <h1>IPSolver</h1>
            </div>
        )
    }
}

export default SolverPage
