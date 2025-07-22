import { Link } from "react-router";
import "./HowToSatSolvePage.css"
import VariableComponent from "../components/VariableComponent"
import ClauseComponent from "../components/ClauseComponent";
function HowToSatSolvePage() {
  return (
    <div>
      <p>
        <Link className="return-link" to={"/.."}>
          Return Home
        </Link>
      </p>
      <section className="content-body-article">
        <h1>What is boolean satisfiability?</h1>
        <h2>Video Introduction</h2>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/uAdVzz1hKYY?si=njIuBZqZEZkLE-6Z"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
        <p>By Udacity</p>
        <h2>Conjunctive Normal Form</h2>
        <p>
          In Symmisolve, we use a specific format of Boolean SAT, that being CNF
          (Conjunctive Normal Form). Each formula consists of clauses, and each clause
          consists of variables.
        </p>
        <p className="spaced">
          Each literal is a single variable, or the opposite of a single variable.
          <VariableComponent assignment={1} />,
          <VariableComponent assignment={-1} />
          are both literals. Note that 1 isn't a number in this case, but the name for a
          variable that could be either true or false.
          <VariableComponent assignment={-1} />
          is the opposite of 1, and is also a literal. The opposite is denoted by a line
          over the variable.
        </p>
        <p className="spaced">
          Each clause is a collection of literals, joined by OR.
          <ClauseComponent clause={[1, -2]} />
          , and
          <ClauseComponent clause={[1]} />
          are both valid clauses. We can even have the empty clause,
          <ClauseComponent clause={[]} />, which is always false.
        </p>
        <p>
          A formula is a collection of clauses, joined by AND. For a formula to be true, there needs to be some assignment of variables, such that every single clause can be true.
        </p>
        <h2>Your Solving Tools</h2>
        <p className="spaced">
          In Symmisolve, we use a specific format of Boolean SAT, that being CNF
          (Conjunctive Normal Form). Your goal is to determine if a formula is always
          false. For example, the formula consisting of
          <VariableComponent assignment={1} /> and
          <VariableComponent assignment={-1} />
          is always false, since the formula is false if 1 is false, and also false if 1
          is true. If the formula is not always false, you can submit an assignment of
          variables such that it is true.
        </p>
        <h3>Resolution</h3>
        <p>
          Resolution involves combining two different clauses that contain literals of the
          same variable, (like the literals <VariableComponent assignment={1} /> and <VariableComponent assignment={-1} />
          ) to produce a new clause.{" "}
        </p>
        <p>
          Suppose you have the formula consisting of
          <ClauseComponent clause={[1, 2]} />and
          <ClauseComponent clause={[-1, 2]} />
        </p>
        <p>
          A resolution step would be{" "}
          <ClauseComponent clause={[1, 2]} />,
          <ClauseComponent clause={[-1, 2]} /> &rarr; <ClauseComponent clause={[2]} />
        </p>
        <p>In order to solve based on a resolution step, click on </p>
        <h3>Partial Solving</h3>
        <p>
          If you can find some assignment of variables that satisfies every clause
          involving an assigned variable, you can denote that as a possible assignment of
          those variables
        </p>
        <p>For example:</p>
        <p>
          Suppose you have the formula consisting of
          <ClauseComponent clause={[1, -2]} /> and
          <ClauseComponent clause={[-1, 3]} />
        </p>
        <p>
          A valid partial solution would be <VariableComponent assignment={3} />, since
          by setting 3 true, you satisfy all clauses involving 3.
        </p>
      </section>
    </div>
  );
}

export default HowToSatSolvePage;
