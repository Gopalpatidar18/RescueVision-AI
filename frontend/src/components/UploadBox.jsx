import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function UploadBox() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const uploadVideo = async () => {
    if (!video) {
      alert("Select a video first");
      return;
    }

    const formData = new FormData();
    formData.append("file", video);

    setLoading(true);

    try {
      const res = await api.post("/upload-video", formData);

      localStorage.setItem(
        "outputVideo",
        res.data.output_video
      );

      navigate("/result");

    } catch (err) {
      alert("Upload Failed");
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="upload-box">

      <h2>Upload Drone Video</h2>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideo(e.target.files[0])}
      />

      <button onClick={uploadVideo}>
        {loading ? "Processing..." : "Analyze Video"}
      </button>

    </div>
  );
}

export default UploadBox;