import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import ProblemPage from './pages/ProblemPage'
import AccountPage from './pages/AccountPage'
import ProblemUpload from './pages/ProblemUpload'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HowToSatSolvePage from './pages/HowToSatSolvePage'
import { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import { makeGetRequest } from './logic/requestTemplates'
import ACCESS_LEVELS from './logic/accessLevels'
import SolverPage from './pages/SolverPage'


function App() {
  const [accessLevel, setAccessLevel] = useState(-1);
  const [username, setUsername] = useState("");
  const updateUser = (username, accessLevel) => {
    setAccessLevel(accessLevel);
    setUsername(username);
  }
  const checkIdentity = async () => {
    const response = await makeGetRequest("whoami");
    if (response.status === 200) {
      const data = await response.json();
      updateUser(data.username, data.accessLevel);
    }else{
      updateUser("", ACCESS_LEVELS.LOGGED_OUT);
    }
  }
  useEffect(() => {
    checkIdentity();
  }, [])
  return (
    <>
      <BrowserRouter>
        <div id="app">
          <div id='upper-container'>
            <header id="doc-header">
              <h1>Symmisolve</h1>
              <p>Meta University - Engineering</p>
              <p>A Community Based SAT Solver</p>
              <NavBar accessLevel={accessLevel} username={username}></NavBar>
            </header>
            <div id='content'>
              <Routes>
                <Route exact path="/" element={<HomePage updateUser={updateUser} />} />
                <Route path="/problem/:problemId" element={<ProblemPage />} />
                <Route path="/problem/:problemId/solver" element={<SolverPage />} />
                <Route path="/user/:username" element={<AccountPage />} />
                <Route path="/upload" element={<ProblemUpload />} />
                <Route path="/login" element={<LoginPage updateUser={updateUser} />} />
                <Route path="/signup" element={<SignupPage updateUser={updateUser} />} />
                <Route path="/help" element={<HowToSatSolvePage />} />
              </Routes>
            </div>
          </div>
          <footer id="doc-footer">
            <p>By Timothy James Nickerson, through Meta University</p>
          </footer>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
