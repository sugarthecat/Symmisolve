import { useState } from "react"

function ProblemUpload() {
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState(null)
    const [description, setDescription] = useState(null)
    const updateSelectedFile = (event) => {
        setFile(event.target.files[0])
    }
    const updateTitle = (event) => {
        setTitle(event.target.value)
    }
    return (
        <div>
            <h1>Problem Upload</h1>
            <p>Upload a problem to the database.</p>
            <p><input  placeholder="Title..." value={title} onChange={updateTitle}/></p>

            <p>
                <input id="problemFileUpload" type="file" onChange={updateSelectedFile} />
                <label for="problemFileUpload"><button>Select File</button></label>
                <button>Publish</button>
            </p>
        </div>
    )
}

export default ProblemUpload
