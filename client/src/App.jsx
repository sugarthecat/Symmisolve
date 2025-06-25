import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import ProblemPage from './pages/ProblemPage'
import AccountPage from './pages/AccountPage'
import ProblemUpload from './pages/ProblemUpload'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <div className="app">
          <div className='upper-container'>
            <header>
              <h1>Symmisolve</h1>
              <p>Meta University - Engineering</p>
              <p>A Community Based SAT Solver</p>
            </header>
            <Routes>
              <Route exact path="/" element = {<HomePage/>}/>
              <Route path="/problem/:problemId"  element = {<ProblemPage/>}/>
              <Route path="/user/:userId" element={<AccountPage/>} />
              <Route path="/upload" element={<ProblemUpload/>}/>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/signup" element={<SignupPage/>}/>
            </Routes>
          </div>
          <footer>
            <p>By Timothy James Nickerson, through Meta University</p>
          </footer>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
