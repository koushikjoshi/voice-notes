import React, { useState, useRef } from "react";
import "./App.css";
import { MdContentCopy } from "react-icons/md";

const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);

  const handleGenerateSummary = async (audioFile) => {
    const formData = new FormData();
    formData.append("file", audioFile);
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

  const handleRecord = async () => {
    if (isRecording) {
      // Stop recording
      recorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Start recording
      setIsRecording(true);
      setSelectedFile(null);
      setTranscript("");
      setSummary("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      const audioChunks = [];
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "recording.mp3", {
          type: "audio/mp3",
        });
        setSelectedFile(audioFile);
        handleGenerateSummary(audioFile);
      });

      recorderRef.current = mediaRecorder;
      setTimeout(() => {
        if (isRecording) {
          handleRecord();
        }
      }, 60000);
    }
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
            {isRecording ? (
              <p>Recording...</p>
            ) : (
              <p>
                Record your random thoughts, and get a point-by-point summary
              </p>
            )}
          </div>
          <div className="upload-logic">
            <div
              className={`record-btn ${isRecording ? "red" : ""}`}
              onClick={handleRecord}
            >
              {isRecording ? "Stop recording" : "Start recording"}
            </div>
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
