import { useState } from 'react'
import { useParams } from 'react-router-dom'
function ProblemPage() {
    const { problemId } = useParams();
    return (
        <div>
            <p>
            Problem {problemId}
            </p>
        </div>
    )
}

export default ProblemPage
