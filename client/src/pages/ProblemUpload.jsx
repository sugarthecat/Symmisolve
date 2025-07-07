import { useState } from "react"
import "./ProblemUpload.css"
import { makePostRequestWithBodyData } from "../logic/requestTemplates"
function ProblemUpload() {
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState("")
    const updateSelectedFile = (event) => {
        setFile(event.target.files[0])
    }
    const updateTitle = (event) => {
        setTitle(event.target.value)
    }
    const updateDescription = (event) => {
        setDescription(event.target.value)
    }
    const publishProblem = async () => {
        //read file
        const data = new FormData()
        data.append('file', file)
        data.append('title', title)
        data.append('description', description)
        const res = await makePostRequestWithBodyData("upload", data)
        if (res.status === 200) {
            //TODO: Provide feedback
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
        </div>
    )
}

export default ProblemUpload
