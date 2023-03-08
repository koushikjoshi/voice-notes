import React, { useState } from "react";
import "./App.css";

const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const HELLO = "hello";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleGenerateSummary = async () => {
    if (!selectedFile) {
      alert("Please select a file to generate summary");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("model", "whisper-1");

    try {
      const response = await fetch(WHISPER_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
        },
        body: formData,
      });
      const result = await response.json();
      setTranscript(result.text);
      setSummary("Summary shows here");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App">
      <div className="upload-div">
        <div className="heading">
          <h1>Upload</h1>
        </div>
        <div className="upload-btns content">
          <label className="upload">
            Select audio file
            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </label>
          <p>{selectedFile ? selectedFile.name : "No file selected"}</p>
          <button className="upload-2" onClick={handleGenerateSummary}>
            Generate Transcript
          </button>
        </div>
      </div>
      <div className="text-div">
        <div className="transcript-div">
          <div className="heading">
            <h3>Transcript</h3>
          </div>
          <div className="transcript-text content">
            <p>{transcript}</p>
          </div>
        </div>
        <div className="summary-div">
          <div className="heading">
            <h3>Summary</h3>
          </div>
          <div className="summary-text content">
            <p>{summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
