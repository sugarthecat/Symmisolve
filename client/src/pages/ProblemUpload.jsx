import { useState } from "react"
import "./ProblemUpload.css"
import { makePostRequestWithBodyData } from "../logic/requestTemplates"
import { Link } from "react-router"
function ProblemUpload() {
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [uploaded, setUploaded] = useState(false)

    const updateSelectedFile = (event) => {
        if (!uploaded) {
            setFile(event.target.files[0])
        }
    }
    const updateTitle = (event) => {
        if (!uploaded) {
            setTitle(event.target.value)
        }
    }
    const updateDescription = (event) => {
        if (!uploaded) {
            setDescription(event.target.value)
        }
    }
    const publishProblem = async () => {
        if (uploaded) {
            return
        }
        //read file
        const data = new FormData()
        data.append('file', file)
        data.append('title', title)
        data.append('description', description)
        const res = await makePostRequestWithBodyData("upload", data)
        if (res.status === 200) {
            const resJson = await res.json()
            const reductionData = resJson.reductionData
            setMessage(
                <p class="problem-upload-message">Problem size automatically reduced
                    {` (${reductionData.original_size} -> ${reductionData.reduced_size}, `}
                    {` ${((reductionData.original_size - reductionData.reduced_size) * 100 / Math.max(1, reductionData.original_size)).toFixed(2)}% reduction)`}<br />
                    <Link to={`/problem/${resJson.uploadId}`}>{resJson.message}</Link>
                </p>)
            setUploaded(true)
        } else {
            const resError = await res.json()
            setError(resError)
        }
    }
    return (
        <div>
            <h1>Problem Upload</h1>
            <p>Upload a problem to the database.</p>
            <p><input placeholder="Title..." value={title} onChange={updateTitle} /></p>
            <p><textarea placeholder="Description..." className="description" value={description} onChange={updateDescription} /></p>
            <p>
                <input accept=".cnf" id="problem-file-upload" type="file" onChange={updateSelectedFile} />
                <button onClick={publishProblem}>Publish</button>
            </p>
            <p className="error">{error}</p>
            {message}
            <div>
                <p><input placeholder="Title..." value={title} onChange={updateTitle} /></p>
                <p><textarea placeholder="Description..." className="description" value={description} onChange={updateDescription} /></p>
                <p>
                    <input accept=".cnf" id="problem-file-upload" type="file" onChange={updateSelectedFile} />
                    {!uploaded && <button onClick={publishProblem}>Publish</button>}
                </p>
                <p className="error">{error}</p>
            </div>
        </div>
    )
}

export default ProblemUpload
