import { useState } from "react";
import api from "../services/api";

function Upload() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState("");

    const uploadVideo = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/upload-video", formData);

        setResult(res.data.output_video);
    };

    return (
        <div>
            <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <button onClick={uploadVideo}>
                Upload Video
            </button>

            <p>{result}</p>
        </div>
    );
}

export default Upload;