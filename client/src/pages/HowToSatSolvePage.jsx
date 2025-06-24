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
      <p>
        In Symmisolve, we use a specific format of Boolean SAT, that being CNF (Conjunctive Normal Form).
        Each formula consists of clauses, and each clause consists of variables.
      </p>
      <p>
        Each literal is a single variable, or the opposite of a single variable.
        <span className='code-segment'>1</span>,
        <span className='code-segment'><span className='overline'>1</span></span>
        are both literals. Note that 1 isn't a number in this case, but the name for a variable that could be either true or false.
        <span className='code-segment'><span className='overline'>1</span></span> is the opposite of 1, and is also a literal.
        The opposite is denoted by a line over the variable.
      </p>
      <p>
        Each clause is a collection of literals, joined by OR (denoted +).
        <span className='code-segment'>(1 + <span className='overline'>2</span>)</span>,
        <span className='code-segment'>(<span className='overline'>1</span>)</span>
        are both valid clauses. We can even have the empty clause,
        <span className='code-segment'>()</span>, which is always false.
      </p>
      <p>
        A formula is a collection of clauses, joined by AND (denoted &times;).
        <span className='code-segment'>(1 + <span className='overline'>2</span>) &times; (<span className='overline'>1</span>)</span>,
        <span className='code-segment'>(<span className='overline'>1</span>) &times; (1)</span> are both valid formulas. We can even have the formula containing only the empty clause,
        <span className='code-segment'>(())</span>, which is always false.</p>
      <p>For example, the formula  <span class="code-segment">(<span className='overline'>1</span>) &times; (2 + <span className='overline'>3</span>)</span> is a valid CNF formula, because it is a joining by "AND" of clauses, and each clause is a joining by "OR" of variables.</p>
      <h2>Your Solving Tools</h2>
      <p>In Symmisolve, we use a specific format of Boolean SAT, that being CNF (Conjunctive Normal Form). Your goal is to determine if a formula is always false. For example, the formula <span className='code-segment'>(1) &times; (<span className='overline'>1</span>)</span> is always false, since the formula is false if 1 is false, and also false if 1 is true. If the formula is not always false, you can submit an assignment of variables such that it is true.</p>
      <h3>Resolution</h3>
      <p>Resolution involves combining two different clauses that contain literals of the same variable, (like the literals <span className='code-segment'>1</span> and <span className='code-segment'><span className='overline'>1</span></span>) to produce a new clause. </p>
      <p>Suppose you have the formula <span className='code-segment'>(1 + <span className='overline'>2</span>) &times; (<span className='overline'>1</span> + 2)</span></p>
      <p>A resolution step would be <span className='code-segment'>(1 + 2) &times; (<span className='overline'>1</span> + 2) &rarr; (2)</span></p>
      <h3>Partial Solving</h3>
      <p>If you can find some assignment of variables that satisfies every clause involving an assigned variable, you can denote that as a possible assignment of those variables</p>
      <p>For example:</p>
      <p>Suppose you have the formula <span className='code-segment'>(1 + <span className='overline'>2</span>) &times; (<span className='overline'>1</span> + 3)</span></p>
      <p>A valid partial solution would be <span className='code-segment'>3</span>, since by setting 3 true, you satisfy all clauses involving 3.</p>
    </div>
  )
}

export default HowToSatSolvePage
