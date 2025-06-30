import { useEffect, useState } from "react";
import { Link } from "react-router";
import { makeGetRequest } from "../logic/requestTemplates";
import ProblemCard from "../components/ProblemCard";
import "./HomePage.css"

function HomePage({ updateUser }) {
  const [accessLevel, setAccessLevel] = useState(-1);
  const [username, setUsername] = useState("")
  const [problems, setProblems] = useState([]);
  async function getUserStatus() {
    const res = await makeGetRequest("whoami");
    if (res.status === 200) {
      const resUserData = await res.json();
      setAccessLevel(resUserData.accessLevel);
      setUsername(resUserData.username);
      updateUser(resUserData.username, resUserData.accessLevel);
      const resProblems = await makeGetRequest("problems");
      if (resProblems.status === 200) {
        const resProblemsData = await resProblems.json();
        console.log(resProblemsData);
        setProblems(resProblemsData.problems);
      }
    } else {
      setAccessLevel(-1);
    }
  }
  useEffect(() => {
    getUserStatus();
  }, [])
  if (accessLevel === -1) {
    return <div>
      <h2>Home</h2>
      <p>Please <Link to="./login">Log In</Link> or <Link to="./signup">Sign Up</Link> to view open problems.</p>
    </div>
  } else {
    return <div>
      <h1>Home</h1>
      Welcome, {username}
      <h2>Open Problems</h2>
      <div id="problem-grid">
        {problems.map(problem => {
          return <ProblemCard key={problem.id} problem={problem}></ProblemCard>
        })}
      </div>
    </div>
  }
}

export default HomePage
