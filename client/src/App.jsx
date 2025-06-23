import { useState } from 'react'
import './App.css'

function App() {

  return (
    <Router>
      <div className="app">
        <div className='upper-container'>
          <header>
            <h1>Symmisolve</h1>
            <p>Meta University - Engineering</p>
            <p>A Community Based SAT Solver</p>
          </header>
          <Switch>
            <Router exact path="/"> <p>Home</p></Router>
            <Router path="/problem/:problemId"> <p>Problem</p></Router>
            <Router path="/user/:userId"> <p>User</p></Router>
            <Router path="/problem/upload"> <p>Home</p></Router>
          </Switch>
        </div>
        <footer>
          <p>By Timothy James Nickerson, through Meta University</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
