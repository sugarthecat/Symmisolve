import { useEffect, useState } from "react";
import { Link } from "react-router";
import { makeGetRequest } from "../logic/requestTemplates";

function HomePage() {
  const [accessLevel, setAccessLevel] = useState(-1);
  const [username, setUsername] = useState("")
  async function fetchData(){
    const res = await makeGetRequest("whoami");
    if(res.status === 200) {
      const resData = await res.json();
      setAccessLevel(resData.accessLevel);
      setUsername(resData.username);
    }else{
      setAccessLevel(-1);
    }
  }
  useEffect(() => {
    fetchData();
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
