import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { makeGetRequest } from "../logic/requestTemplates";
import { getSizeCNF } from "../logic/boolsat";
import ACCESS_LEVELS from "../logic/accessLevels";
import Solver from "../components/Solver";
function SolverPage({ updateUser }) {
    const navigate = useNavigate();
    const { problemId } = useParams();

    const [isLoaded, setIsLoaded] = useState(false);
    const [problemName, setProblemName] = useState("");
    const [problemSize, setProblemSize] = useState(0);

    const [clauses, setClauses] = useState([]);

    const getProblem = async () => {
        const res = await makeGetRequest(`problem/${problemId}/file`);
        if (res.status === 200) {
            const data = await res.json();
            if (data.problem.is_active) {
                setProblemName(data.problem.name);
                setIsLoaded(true);
                setClauses(data.problem.file.problem_file);
                setProblemSize(getSizeCNF(data.problem.file.problem_file));
            } else {
                navigate("/");
            }
        } else {
            navigate("/");
        }
    };

    const checkWhoIAm = async () => {
        const res = await makeGetRequest("whoami");
        let failed = false;
        if (res.status === 200) {
            const data = await res.json();
            if (data.accessLevel === ACCESS_LEVELS.LOGGED_OUT) {
                failed = true;
            }
        } else {
            failed = true;
        }
        if (failed) {
            updateUser("", -1);
            navigate(`/`);
        }
    };

    useEffect(() => {
        getProblem();
        checkWhoIAm();
    }, [problemId]);


    if (!isLoaded) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div>
            <p>
                <Link className="return-link" to={`/problem/${problemId}`}>
                    Return to Problem Page
                </Link>
            </p>
            <Solver
                clauses={clauses}
                setClauses={setClauses}
                problemSize={problemSize}
                problemId={problemId}
                problemName={problemName}
            />
        </div>
    );
}

export default SolverPage;
