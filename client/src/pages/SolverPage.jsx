import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { makeGetRequest } from '../logic/requestTemplates';
import "./SolverPage.css";
function SolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const [isLoaded, setIsLoaded] = useState(false);
    const [problem, setProblem] = useState({});

    const [selectedClause, setSelectedClause] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
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
        const clauses = problem.file.problem_file;
        const hasSelectedClause = selectedClause !== null;

        let clauseList = []
        if(hasSelectedClause){
            clauseList.push(
                <p>{selectedClause}</p>
            );
            return (
                <div>
                    <p><Link to={`/problem/${problemId}`}>Return to Problem Page</Link></p>
                    <h1>{problem.name}</h1>
                    <div className='clauses'>
                        {clauseList}
                    </div>
                </div>
            )
        }else{

            return (
                <div>
                    <p><Link to={`/problem/${problemId}`}>Return to Problem Page</Link></p>
                    <h1>{problem.name}</h1>
                    <div className='clauses'>
                        {clauses.slice(startIndex*100,startIndex*100+100).map((clause, index) => {
                            return <div>{clause.join(" ")}</div>
                        })}
                    </div>
                    <div>
                    {startIndex != 0 && <button onClick={() => {setStartIndex(startIndex-1)}}>Previous</button>}
                    {startIndex < Math.floor(clauses.length/100)&& <button onClick={() => {setStartIndex(startIndex+1)}}>Next</button>}
                    </div>
                </div>
            )
        }

    }
}

export default SolverPage
