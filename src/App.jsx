import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { MdContentCopy } from "react-icons/md";

const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const recorderRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setProgress((prevProgress) => prevProgress + 1.67);
      }, 1000);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

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

  const startRecording = async () => {
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
  };

  const stopRecording = () => {
    recorderRef.current.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    let timeoutId;

    if (isRecording) {
      timeoutId = setTimeout(() => {
        stopRecording();
      }, 60000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isRecording]);

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
              <p>Record your random thoughts, and receive a concise summary</p>
            )}
          </div>
          <div className="upload-logic">
            <div
              className={`record-btn ${isRecording ? "red" : ""}`}
              onClick={handleRecord}
            >
              <p>{isRecording ? "Stop Recording" : "Start Recording"}</p>
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
          <div className="madewithlove">
            <p>
              made with ❤️ by{" "}
              <a
                href="https://twitter.com/koushikjoshi"
                style={{ textDecorationColor: "none", color: "#000000" }}
                target="_blank"
              >
                koushik
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
