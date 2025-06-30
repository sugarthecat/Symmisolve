import { useEffect, useState } from "react";
import { Link } from "react-router";
import { makeGetRequest } from "../logic/requestTemplates";

function HomePage({updateUser}) {
  const [accessLevel, setAccessLevel] = useState(-1);
  const [username, setUsername] = useState("")
  const [problems, setProblems] = useState([]);
  async function getUserStatus(){
    const res = await makeGetRequest("whoami");
    if(res.status === 200) {
      const resUserData = await res.json();
      setAccessLevel(resUserData.accessLevel);
      setUsername(resUserData.username);
      updateUser(resUserData.username, resUserData.accessLevel);
      const resProblems = await makeGetRequest("problems");
    }else{
      setAccessLevel(-1);
    }
  }
  useEffect(() => {
    getUserStatus();
  }, [])
  if(accessLevel === -1) {
    return <div>
      <h2>Home</h2>
      <p>Please <Link to="./login">Log In</Link> or <Link to="./signup">Sign Up</Link> to view open problems.</p>
    </div>
  }else{
    return <div>
      <h2>Home</h2>
      Welcome, {username}
      </div>
  }
}

export default HomePage
