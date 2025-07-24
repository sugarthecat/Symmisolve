import { useState } from "react";
import { Link } from "react-router";
import Solver from "../components/Solver";
import { getSizeCNF } from "../logic/boolsat";

const problemList = [
    {
        name: "Simple Resolution",
        clauses: [
            [-1, 2],
            [-1, -2],
            [1, 3],
            [1, -3],
        ],
    },
    {
        name: "Pigeonhole Principle (3 pigeons, 2 holes)",
        clauses: [
            [1, 2],
            [3, 4],
            [5, 6],
            [-1, -3],
            [-1, -5],
            [-3, -5],
            [-2, -4],
            [-2, -6],
            [-4, -6],
        ],
    },
    {
        name: "Pigeonhole Principle (3 pigeons, 3 holes)",
        clauses: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [-1, -4],
            [-1, -7],
            [-4, -7],
            [-2, -5],
            [-2, -8],
            [-5, -8],
            [-3, -6],
            [-3, -9],
            [-6, -9],
        ],
    },
];
function DemoSolverPage() {
    const [problemName, setProblemName] = useState("Select A Problem");
    const [problemSize, setProblemSize] = useState(0);
    const [demoProblemId, setDemoProblemId] = useState(0);
    const [clauses, setClauses] = useState([]);

    return (
        <div>
            <p>
                <Link className="return-link" to="./help">
                    Return to Docs
                </Link>
            </p>
            <h2>Problem Selection</h2>
            <div>
                {problemList.map((problem, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setProblemName(problem.name);
                            setClauses(problem.clauses.slice());
                            setProblemSize(getSizeCNF(problem.clauses));
                            setDemoProblemId(index + 1);
                        }}
                    >
                        {problem.name}
                    </button>
                ))}
            </div>
            <h1>Demo Solver</h1>
            {demoProblemId !== 0 &&
                <Solver
                    clauses={clauses}
                    setClauses={setClauses}
                    problemName={problemName}
                    problemSize={problemSize}
                    problemId={demoProblemId}
                    demo={true}
                />
            }
            {demoProblemId === 0 && <p>Select a problem to begin...</p>}
        </div>
    );
}

export default DemoSolverPage;
