import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import ProblemPage from './pages/ProblemPage'
import AccountPage from './pages/AccountPage'
import ProblemUpload from './pages/ProblemUpload'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HowToSatSolvePage from './pages/HowToSatSolvePage'
import { useState } from 'react'

function App() {
  const [accessLevel, setAccessLevel] = useState(-1);
  const [username, setUsername] = useState("");
  return (
    <>
      <BrowserRouter>
        <div id="app">
          <div id='upper-container'>
            <header id="doc-header">
              <h1>Symmisolve</h1>
              <p>Meta University - Engineering</p>
              <p>A Community Based SAT Solver</p>
              <nav>
                <Link to='/'>
                  <button>
                    Home
                  </button>
                </Link>
                {
                  accessLevel < 0 ?
                  <Link to='/signup'>
                    <button>
                      Log In
                    </button>
                  </Link> : ""
                }
                {
                  accessLevel < 0 ?
                  <Link to='/signup'>
                    <button>
                      Sign Up
                    </button>
                  </Link> : ""
                }
              </nav>
            </header>
            <div id='content'>
              <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route path="/problem/:problemId" element={<ProblemPage />} />
                <Route path="/user/:username" element={<AccountPage />} />
                <Route path="/upload" element={<ProblemUpload />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
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
