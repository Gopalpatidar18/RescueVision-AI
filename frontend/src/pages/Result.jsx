function Result() {

  const video = localStorage.getItem("outputVideo");

  return (
    <div className="result-page">

      <h1>Detection Result</h1>

      {video && (
        <video width="800" controls>
          <source
            src={`http://127.0.0.1:8000/${video}`}
            type="video/mp4"
          />
        </video>
      )}

    </div>
  );
}

export default Result;