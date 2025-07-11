import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { makeGetRequest } from "../logic/requestTemplates";
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
            navigate("/");
        }
    };
    // Modified code from stack overflow
    // https://stackoverflow.com/questions/44656610/download-a-string-as-txt-file-in-react
    const downloadTxtFile = (text, filename) => {
        const element = document.createElement("a");
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${filename}.cnf`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }
    const downloadSolution = async () => {
        const req = await makeGetRequest(`problem/${problemId}/file`);
        if (req.status === 200) {
            const data = (await req.json()).problem;
            console.log(data)
            downloadTxtFile(data.file.problem_file, data.name)
        } else {
            navigate("/");
        }
    };

    useEffect(() => {
        getProblem();
    }, [problemId]);

    if (!isLoaded) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    } else {
        return (
            <div>
                <Link to="/">
                    {" "}
                    <p>Return Home</p>
                </Link>
                <h1>{problem.name}</h1>
                <h3>By {problem.user.username}</h3>
                <p>{problem.description}</p>
                {problem.is_active ? (
                    <Link to={`/problem/${problemId}/solver`}>
                        {" "}
                        <button>Solve</button>
                    </Link>
                ) : (
                    <button onClick={downloadSolution}>Download Solution </button>
                )}
            </div>
        );
    }
}

export default ProblemPage;
