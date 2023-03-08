import React, { Component } from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="upload-div">
        <div className="heading">
          <h1>Upload</h1>
        </div>
        <div className="upload-btns content">
          <button className="upload">Select audio file</button>
          <p>No file selected</p>
          <button className="upload">Upload</button>
        </div>
      </div>
      <div className="text-div">
        <div className="transcript-div">
          <div className="heading">
            <h3>Transcript</h3>
          </div>
          <div className="transcript-text content">
            <p>hello hello</p>
          </div>
        </div>
        <div className="summary-div">
          <div className="heading">
            <h3>Summary</h3>
          </div>
          <div className="summary-text content">
            <p>hello hello</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
