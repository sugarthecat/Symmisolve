import { useState } from 'react'
import { Link } from 'react-router'

function HowToSatSolvePage() {
  return (
    <div >
      <p><Link to={"/.."}>Return Home</Link></p>
      <h1>What is boolean satisfiability?</h1>
      <h2>Video Introduction</h2>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/uAdVzz1hKYY?si=njIuBZqZEZkLE-6Z"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen>
      </iframe>
      <p>By Udacity</p>
      <h2>Conjunctive Normal Form</h2>
      <p>In Symmisolve, we use a specific format of Boolean SAT, that being CNF (Conjunctive Normal Form). Each formula consists of clauses, and each clause consists of variables.</p>
      <p>Each literal is a single variable, or the opposite of a single variable. <span className='code-segment'>1</span>, <span className='code-segment'> <span className='overline'>1</span></span> are both literals. Note that 1 isn't a number in this case, but the name for a value that could be either true or false.</p>
      <p>Each clause is a collection of literals, joined by OR (denoted +). <span className='code-segment'>(1 + <span className='overline'>2</span>)</span>, <span className='code-segment'> (<span className='overline'>1</span>)</span> are both clauses. We can even have the empty clause, <span className='code-segment'>()</span>, which is also false.</p>
      <p>For example, the formula  <span class="code-segment">(A OR B) AND (NOT C)</span> is in CNF, because it is a conjunction of clauses, and each clause is a disjunction of variables.</p>
      <h2>Your Solving Tools</h2>
      <p>In Symmisolve, we use a specific format of Boolean SAT, that being CNF (Conjunctive Normal Form). </p>
    </div>
  )
}

export default HowToSatSolvePage
