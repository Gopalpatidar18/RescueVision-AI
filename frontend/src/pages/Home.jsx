import UploadBox from "../components/UploadBox";

function Home() {
  return (
    <div className="home">

      <div className="hero">
        <h1>AI Powered Search & Rescue</h1>

        <p>
          Upload drone footage and detect missing people
          using YOLO + UNet.
        </p>

        <UploadBox />
      </div>

    </div>
  );
}

export default Home;