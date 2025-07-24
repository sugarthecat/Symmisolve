import { useState } from "react";
import { makePutRequest } from "../logic/requestTemplates";
import "./Solver.css";
import { getSizeCNF, isEqual, isSubclause, resolve } from "../logic/boolsat";
import PartialSolveMenu from "../components/PartialSolveMenu";
import ClauseComponent from "../components/ClauseComponent";
import LiteralComponent from "../components/LiteralComponent";
import { useEffect } from "react";
const SOLVER_PAGE = {
    STEPS: 1,
    PARTIAL_SOLVE: 2,
};
function Solver({ clauses, setClauses, problemName, problemSize, problemId, demo = false }) {
    const [selectedClause, setSelectedClause] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [solutionSteps, setSolutionSteps] = useState([]);
    const [error, setError] = useState("");
    const [sidePage, setSidePage] = useState(SOLVER_PAGE.STEPS);

    const stringifyClause = (clause) => {
        return `[${clause.join(", ")}]`;
    };
    useEffect(() => {
        setSolutionSteps([]);
        setStartIndex(0);
        setSelectedClause(null);
    }, [problemId]);

    const formatStep = (step) => {
        if (step.type === "resolution") {
            return (
                <div>
                    <p>
                        Resolving <ClauseComponent clause={step.old[0]} /> and{" "}
                        <ClauseComponent clause={step.old[1]} /> yields{" "}
                        <ClauseComponent clause={step.new} />
                    </p>
                </div>
            );
        } else if (step.type === "partial-solve") {
            return (
                <div>
                    <p>
                        Partial Solve (
                        {step.assignments.map((x) => (
                            <LiteralComponent assignment={x} />
                        ))}
                        )
                    </p>
                </div>
            );
        } else if (step.type === "conflict") {
            return (
                <div>
                    <p>
                        Conflict Found (Driven By:{" "}
                        {step.assignments.map((x) => (
                            <LiteralComponent assignment={x} />
                        ))}
                        )
                    </p>
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
        let hasDuplicate = false;
        for (const clause of clauses) {
            if (isEqual(clause, newClause) || isSubclause(newClause, clause)) {
                hasDuplicate = true;
                break;
            }
        }
        if (!hasDuplicate) {
            newSolutionSteps.push({ type: "resolution", old: [clause1, clause2], new: newClause });
            setSolutionSteps(newSolutionSteps);
            addClauses([newClause]);
        }
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
                if (isEqual(newClause, newClausesList[i])) {
                    add = false;
                    break;
                }
                if (isSubclause(newClause, newClausesList[i])) {
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

                if (demo) {
                    continue; //skip automated resolution
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
    };

    const sendReduction = async () => {
        const res = await makePutRequest(`problem/${problemId}/reduce`, {
            solution: solutionSteps,
        });
        const data = await res.json();
        if (res.status === 200) {
            window.location.reload();
        } else {
            setError(data);
        }
    };
    //loaded
    const hasSelectedClause = selectedClause !== null;

    let resultCount = 0;
    let clauseList = [];
    let specialClause = <></>;
    //set clause list
    if (hasSelectedClause) {
        specialClause = (
            <p key={stringifyClause(selectedClause)}>
                <ClauseComponent
                    clause={selectedClause}
                    clickFunc={() => {
                        setSelectedClause(null);
                    }}
                />
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
                    <ClauseComponent
                        clause={clauses[i]}
                        clickFunc={() => {
                            resolveClauses(selectedClause, clauses[i]);
                            setSelectedClause(null);
                        }}
                    />
                </div>
            );
            resultCount++;
        }
    } else {
        //length 1 clauses are useful for data, but not for solving. They can be handled automatically!

        let filteredClauses; //filter out unit clauses
        if (!demo) {
            filteredClauses = clauses.filter((clause) => {
                return clause.length !== 1;
            });
        } else {
            filteredClauses = clauses;
        }
        clauseList = filteredClauses
            .slice(startIndex * 100, startIndex * 100 + 100)
            .map((clause, index) => {
                return (
                    <ClauseComponent
                        key={stringifyClause(clause)}
                        clickFunc={() => {
                            setSelectedClause(clause);
                        }}
                        clause={clause}
                    ></ClauseComponent>
                );
            });
        resultCount = filteredClauses.length;
    }
    if (startIndex * 100 >= clauses.length && startIndex !== 0) {
        setStartIndex(0);
    }

    return (
        <div>
            <div id="solver-pages">
                <div className="solver-side-page">
                    <h1>{problemName}</h1>
                    {specialClause}
                    <div className="clause-container">
                        <div className="clauses">{clauseList}</div>
                    </div>
                    {resultCount > 100 &&
                        <div>
                            <button
                                onClick={() => {
                                    setStartIndex(0);
                                }}
                            >
                                To Beginning
                            </button>
                            {startIndex != 0 && (
                                <button
                                    onClick={() => {
                                        setStartIndex(startIndex - 1);
                                    }}
                                >
                                    Previous
                                </button>
                            )}
                            ({startIndex + 1}/{Math.floor(resultCount / 100) + 1})
                            {startIndex < Math.floor(resultCount / 100) && (
                                <button
                                    onClick={() => {
                                        setStartIndex(startIndex + 1);
                                    }}
                                >
                                    Next
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setStartIndex(Math.floor((resultCount - 1) / 100));
                                }}
                            >
                                To End
                            </button>
                        </div>
                    }
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
                            Partial Solve / Conflicts
                        </button>
                    </div>
                    {sidePage === SOLVER_PAGE.STEPS && (
                        <>
                            <b>Steps {`(${problemSize} Size -> ${getSizeCNF(clauses)} Size)`}</b>
                            <div>
                                {problemSize > getSizeCNF(clauses) && !demo && (
                                    <button onClick={sendReduction}>Send Reduction</button>
                                )}
                            </div>
                            <div className="solution-steps">
                                {solutionSteps.length > 8 && <p>(Previous steps hidden)</p>}
                                {solutionSteps
                                    .slice(Math.max(0, solutionSteps.length - 8))
                                    .map((step, index) => {
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

export default Solver;
