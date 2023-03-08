import React, { useState } from "react";
import "./App.css";
import { MdContentCopy } from "react-icons/md";

const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const HELLO = "hello";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

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
  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <div className="App">
      <div className="upload-div">
        <div>
          <img className="head-img" src={require("./logo.png")} alt="" />
        </div>
        <div className="heading-1">
          <h1>AutoBrainstorm</h1>
        </div>
        <div className="upload-content">
          <div className="upload-text">
            <p>Record your random thoughts, and get a point-by-point summary</p>
          </div>
          <div className="upload-logic">
            <div className="record-btn">Start recording</div>
            {/* <div className="upload">
              <label>
                OR <u style={{ cursor: "pointer" }}>Upload Audio</u>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </label>
            </div> */}
          </div>
        </div>
      </div>
      <div className="text-div">
        <div className="transcript-div">
          <div className="heading">
            <p>Transcript</p>
          </div>
          <div className="transcript-text content">
            <div className="final-transcript">
              <p>{transcript}</p>
            </div>
          </div>
        </div>
        <div className="summary-div">
          <div className="heading summary-heading">
            <p className="summary-p">Summary</p>
            <MdContentCopy className="copy-icon" size={15} />
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
