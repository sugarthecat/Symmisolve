import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { makeGetRequest, makePutRequest } from "../logic/requestTemplates";
import "./SolverPage.css";
import { getSizeCNF, isEqual, isSubclause, resolve } from "../logic/boolsat";
import PartialSolveMenu from "../components/PartialSolveMenu";
import ClauseComponent from "../components/ClauseComponent";
const SOLVER_PAGE = {
    STEPS: 1,
    PARTIAL_SOLVE: 2,
};
function SolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();

    const [isLoaded, setIsLoaded] = useState(false);
    const [problem, setProblem] = useState({});
    const [problemSize, setProblemSize] = useState(0);

    const [selectedClause, setSelectedClause] = useState(null);
    const [clauses, setClauses] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [solutionSteps, setSolutionSteps] = useState([]);
    const [error, setError] = useState("");
    const [sidePage, setSidePage] = useState(SOLVER_PAGE.STEPS);

    const getProblem = async () => {
        const res = await makeGetRequest(`problem/${problemId}/file`);
        if (res.status === 200) {
            const data = await res.json();
            if (data.problem.is_active) {
                setProblem(data.problem);
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

    useEffect(() => {
        getProblem();
    }, [problemId]);

    const stringifyClause = (clause) => {
        return `[${clause.join(", ")}]`;
    };

    const formatClause = (step) => {
        return stringifyClause(step);
        //TODO: Actually make JSX elements for the clause
    };

    const formatStep = (step) => {
        if (step.type === "resolution") {
            return (
                <div>
                    <p>
                        Resolving {formatClause(step.old[0])} and {formatClause(step.old[1])} yields{" "}
                        {formatClause(step.new)}
                    </p>
                </div>
            );
        } else if (step.type === "partial-solve") {
            return (
                <div>
                    <p>Partial Solve (Assignments: {step.assignments.join(", ")})</p>
                </div>
            );
        } else if (step.type === "conflict") {
            return (
                <div>
                    <p>Conflict Found (Driven By: {step.assignments.join(", ")})</p>
                </div>
            );
        } else {
            return (
                <div>
                    <p className="error">{step.type} isn't a valid step type</p>
                </div>
            );
        }
    };
    const resolveClauses = (clause1, clause2) => {
        let newClause = resolve(clause1, clause2);
        let newSolutionSteps = solutionSteps;
        newSolutionSteps.push({ type: "resolution", old: [clause1, clause2], new: newClause });
        setSolutionSteps(newSolutionSteps);
        addClauses([newClause]);
    };
    const submitPartialSolve = (assignments) => {
        let newSolutionSteps = solutionSteps;
        newSolutionSteps.push({ type: "partial-solve", assignments });
        setSolutionSteps(newSolutionSteps);
        let assignmentClauses = assignments.map((assignment) => {
            return [assignment];
        });
        addClauses(assignmentClauses);
        setSidePage(SOLVER_PAGE.STEPS);
    };
    const submitConflict = (assignments) => {
        let conflict = [];
        let newSolutionSteps = solutionSteps;
        for (const literal of assignments) {
            conflict.push(-literal);
        }
        newSolutionSteps.push({ type: "conflict", assignments });
        setSolutionSteps(newSolutionSteps);
        addClauses([conflict]);
    };
    const addClauses = (newClauses) => {
        let toAdd = newClauses;
        let newClausesList = clauses; //slice to make a copy, triggering re-render;
        let newSolutionSteps = solutionSteps;
        while (toAdd.length > 0) {
            //format clause by sorting
            let newClause = toAdd.pop().sort((a, b) => Math.abs(a) - Math.abs(b));
            let add = true;
            for (let i = 0; i < newClausesList.length; i++) {
                if (
                    isEqual(newClausesList[i], newClause) ||
                    isSubclause(newClause, newClausesList[i])
                ) {
                    //new clause is redundant
                    //Subsume step (not nessecary in proof, will not include for that reason)
                    //solutionSteps.push({ type: "subsume", old: newClause, new: newClausesList[i] });
                    add = false;
                    break;
                } else if (isSubclause(newClausesList[i], newClause)) {
                    //old clause is redundant
                    //Subsume step (not nessecary in proof, will not include for that reason)
                    //solutionSteps.push({ type: "subsume", old: newClausesList[i], new: newClause });
                    newClausesList.splice(i, 1);
                    i--;
                    continue;
                }
                let resolution = resolve(newClause, newClausesList[i]);
                if (resolution !== null) {
                    if (isSubclause(newClause, resolution)) {
                        //new clause is redundant
                        //Subsume step (not nessecary in proof, will not include for that reason)
                        //RR step is encapsulated by backend reduction anyways, disincluded
                        //solutionSteps.push({ type: "subsume", old: newClause, new: resolution });
                        add = false;
                        toAdd.push(resolution);
                        break;
                    } else if (isSubclause(newClausesList[i], resolution)) {
                        //old clause is redundant
                        //RR step is encapsulated by backend reduction anyways, disincluded
                        //Subsume step (not nessecary in proof, will not include for that reason)
                        //solutionSteps.push({ type: "subsume", old: newClausesList[i], new: resolution });
                        toAdd.push(resolution);
                        newClausesList.splice(i, 1);
                        i--;
                        continue;
                    }
                }
            }
            if (add) {
                newClausesList.push(newClause);
            }
        }
        setClauses(newClausesList.slice());
        setSolutionSteps(newSolutionSteps);
        setStartIndex(Math.floor(newClausesList.filter((clause) => clause.length > 1).length / 100));
    };

    const sendReduction = async () => {
        const res = await makePutRequest(`problem/${problemId}/reduce`, {
            solution: solutionSteps,
        });
        const data = await res.json();
        if (res.status === 200) {
            window.location.reload();
        } else {
            setError(JSON.stringify(data));
        }
    };
    if (!isLoaded) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    } else {
        //loaded
        const hasSelectedClause = selectedClause !== null;

        let resultCount = 0;
        let clauseList = [];
        let specialClause = <></>;
        //set clause list
        if (hasSelectedClause) {
            specialClause = (
                <p key={stringifyClause(selectedClause)}>
                    {stringifyClause(selectedClause)}{" "}
                    <button
                        onClick={() => {
                            setSelectedClause(null);
                        }}
                    >
                        Deselect
                    </button>
                </p>
            );
            for (let i = 0; i < clauses.length; i++) {
                if (clauses[i] === selectedClause) {
                    continue;
                }
                let resolution = resolve(selectedClause, clauses[i]);
                if (resolution === null) {
                    continue;
                }
                clauseList.push(
                    <div key={stringifyClause(clauses[i])}>
                        {stringifyClause(clauses[i])}{" "}
                        <button
                            onClick={() => {
                                resolveClauses(selectedClause, clauses[i]);
                                setSelectedClause(null);
                            }}
                        >
                            Resolve
                        </button>
                    </div>
                );
            }
        } else {
            //length 1 clauses are useful for data, but not for solving. They can be handled automatically!
            clauseList = clauses.filter((clause) => {
                return clause.length !== 1;
            }); //filter out unit clauses
            clauseList = clauseList
                .slice(startIndex * 100, startIndex * 100 + 100)
                .map((clause, index) => {
                    return (
                        <ClauseComponent key={stringifyClause(clause)} clickFunc={() => {
                            setSelectedClause(clause)
                        }} clause={clause}>
                        </ClauseComponent>
                    );
                });
            resultCount = clauses.length;
        }
        if (startIndex * 100 >= clauses.length) {
            setStartIndex(0);
        }

        return (
            <div>
                <p>
                    <Link className="return-link" to={`/problem/${problemId}`}>
                        Return to Problem Page
                    </Link>
                </p>
                <div id="solver-pages">
                    <div className="solver-side-page">
                        <h1>{problem.name}</h1>
                        {specialClause}
                        <div className="clauses">{clauseList}</div>
                        <div>
                            {startIndex != 0 && (
                                <button
                                    onClick={() => {
                                        setStartIndex(startIndex - 1);
                                    }}
                                >
                                    Previous
                                </button>
                            )}
                            {startIndex < Math.floor(resultCount / 100) && (
                                <button
                                    onClick={() => {
                                        setStartIndex(startIndex + 1);
                                    }}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="solver-side-page">
                        <div>
                            <button
                                onClick={() => {
                                    setSidePage(SOLVER_PAGE.STEPS);
                                }}
                            >
                                Solution Steps
                            </button>
                            <button
                                onClick={() => {
                                    setSidePage(SOLVER_PAGE.PARTIAL_SOLVE);
                                }}
                            >
                                Partial Solve
                            </button>
                        </div>
                        {sidePage === SOLVER_PAGE.STEPS && (
                            <>
                                <b>
                                    Steps {`(${problemSize} Size -> ${getSizeCNF(clauses)} Size)`}
                                </b>
                                <div>
                                    {problemSize > getSizeCNF(clauses) && (
                                        <button onClick={sendReduction}>Send Reduction</button>
                                    )}
                                </div>
                                <div className="solution-steps">
                                    {solutionSteps.map((step, index) => {
                                        return <div>{formatStep(step)} </div>;
                                    })}
                                </div>
                                <p className="error">{error}</p>
                            </>
                        )}
                        {sidePage === SOLVER_PAGE.PARTIAL_SOLVE && (
                            <PartialSolveMenu

                                clauses={clauses}
                                submitPartialSolve={submitPartialSolve}
                                submitConflict={submitConflict}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default SolverPage;
