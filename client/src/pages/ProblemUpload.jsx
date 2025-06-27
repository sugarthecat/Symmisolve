import { useState } from "react"
import "./ProblemUpload.css"
import { makePostRequest } from "../logic/requestTemplates"
function ProblemUpload() {
    const [cnfContent, setCNFContent] = useState(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const updateSelectedFile = (event) => {

        const fileReader = new FileReader()
        fileReader.onload = (event) => {
            setCNFContent(fileReader.result)
        }
        fileReader.readAsText(event.target.files[0])
    }
    const updateTitle = (event) => {
        setTitle(event.target.value)
    }
    const updateDescription = (event) => {
        setDescription(event.target.value)
    }
    const publishProblem = async () => {
        //read file

        const res = await makePostRequest("upload", {
            title: title,
            description: description,
            formula: cnfContent
        })
    }
    return (
        <div>
            <h1>Problem Upload</h1>
            <p>Upload a problem to the database.</p>
            <p><input placeholder="Title..." value={title} onChange={updateTitle}/></p>
            <p><textarea placeholder="Description..." className="description" value={description} onChange={updateDescription}/></p>
            <p>
                <input accept=".cnf" id="problem-file-upload" type="file" onChange={updateSelectedFile} />
                <button onClick={publishProblem}>Publish</button>
            </p>
        </div>
    )
}

export default ProblemUpload
