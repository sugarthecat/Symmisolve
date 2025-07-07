import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { makeGetRequest } from '../logic/requestTemplates';
import "./SolverPage.css";
import { resolve } from '../logic/boolsat';
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
        if (hasSelectedClause) {
            clauseList.push(
                <p>{selectedClause.join("\t")}  <button onClick={() => { setSelectedClause(null) }}>Deselect</button></p>
            );
            for (let i = 0; i < clauses.length; i++) {
                if (clauses[i] === selectedClause) {
                    continue;
                }
                let resolution = resolve(selectedClause, clauses[i]);
                if (resolution === null) {
                    continue
                }
                clauseList.push(
                    <div >{clauses[i].join("\t")} <button onClick={() => { console.error("Unimplemented ") }}>Resolve</button></div>
                );
            }
        } else {
            clauseList = clauses.slice(startIndex * 100, startIndex * 100 + 100).map((clause, index) => {
                return <div >{clause.join("\t")} <button onClick={() => { setSelectedClause(clause) }}>Select</button></div>
            })
        }
        if (startIndex * 100 >= clauses.length) {
            setStartIndex(0)
        }
        return (
            <div>
                <p><Link to={`/problem/${problemId}`}>Return to Problem Page</Link></p>
                <h1>{problem.name}</h1>
                <div className='clauses'>
                    {clauseList}
                </div>
                <div>
                    {startIndex != 0 && <button onClick={() => { setStartIndex(startIndex - 1) }}>Previous</button>}
                    {startIndex < Math.floor(clauseList.length / 100) && <button onClick={() => { setStartIndex(startIndex + 1) }}>Next</button>}
                </div>
            </div>
        )

    }
}

export default SolverPage
