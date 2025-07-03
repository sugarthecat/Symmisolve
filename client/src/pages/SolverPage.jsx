import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { makeGetRequest } from '../logic/requestTemplates';
import "./SolverPage.css";
function SolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const [isLoaded, setIsLoaded] = useState(false);
    const [problem, setProblem] = useState({});

    const getProblem = async () => {
        const res = await makeGetRequest(`problem/${problemId}/file`);
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
                <h1>{problem.name}</h1>
                <div className='clauses'>
                    {problem.file.problem_file.map((clause, index) => {
                        return <div key={index}>{clause.join("\t")}</div>
                    })}
                </div>
            </div>
        )
    }
}

export default SolverPage
