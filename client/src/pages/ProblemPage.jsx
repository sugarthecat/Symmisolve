import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { makeDeleteRequest, makeGetRequest } from "../logic/requestTemplates";
import { getSizeCNF } from "../logic/boolsat";
import ConfirmWindow from "../components/ConfirmWindow";
function ProblemPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const [isLoaded, setIsLoaded] = useState(false);
    const [problem, setProblem] = useState({});
    const [downloadButton, setDownloadButton] = useState(<></>);
    const [popUp, setPopUp] = useState(<></>);
    const [isAdmin, setIsAdmin] = useState(false);

    const getProblem = async () => {
        const res = await makeGetRequest(`problem/${problemId}`);
        if (res.status === 200) {
            const data = await res.json();
            if (data.isAdmin) {
                setIsAdmin(true);
            }
            setProblem(data.problem);
            if (!data.problem.is_active) {
                await setupDownloadButton();
            }
            setIsLoaded(true);
        } else {
            navigate("/");
        }
    };
    // Modified code from stack overflow
    // https://stackoverflow.com/questions/44656610/download-a-string-as-txt-file-in-react/76922730#76922730
    const setupDownloadButton = async () => {
        const req = await makeGetRequest(`problem/${problemId}/file`);
        if (req.status === 200) {
            const data = (await req.json()).problem;
            let problemFile = data.file.problem_file;
            let fileToDownload = data.file.problem_file;
            let isSolvable = true;
            if (problemFile.substring(0, 9) === "p cnf 0 1") {
                //this means the problem is unsolvable, download the justification
                isSolvable = false;
                fileToDownload = data.file.solution_file;
            }
            const file = new Blob([fileToDownload], { type: "text/plain" });

            setDownloadButton(
                <button variant="outlined">
                    <a
                        download={isSolvable ? "solution.cnf" : "justification.txt"}
                        target="_blank"
                        rel="noreferrer"
                        href={URL.createObjectURL(file)}
                        style={{
                            textDecoration: "inherit",
                            color: "inherit",
                        }}
                    >
                        Download
                    </a>
                </button>
            );
        } else {
            navigate("/");
        }
    };
    const deleteProblem = async () => {
        const res = await makeDeleteRequest(`problem/${problemId}`);
        if (res.status === 200) {
            navigate("/");
        }
    }
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
            <div className="centering">
                <Link className="return-link" to="/">
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
                    <>
                        {downloadButton}
                    </>
                )}
                <button
                    onClick={() => setPopUp(
                        <ConfirmWindow
                            deleteSelf={() => {
                                setPopUp(<></>);
                            }}
                            action={
                                deleteProblem
                            }
                            message={"Permanently delete this problem?"}
                        />
                    )}
                >
                    Delete Problem
                </button>
                {popUp}
            </div>
        );
    }
}

export default ProblemPage;
