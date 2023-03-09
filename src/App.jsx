import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { MdContentCopy } from "react-icons/md";
import { CopyToClipboard } from "react-copy-to-clipboard";

const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const recorderRef = useRef(null);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index === summary.length) {
        clearInterval(intervalId);
      } else {
        setTypedText(summary.slice(0, index + 1));
        index++;
      }
    }, 30); // typing speed in milliseconds
    return () => clearInterval(intervalId);
  }, [summary]);

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

  const handleCopy = () => {
    navigator.clipboard.write(summary);
  };

  const handleGenerateSummary = async (transcript) => {
    console.log(transcript);
    try {
      console.log("generating summary");
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: `Give me a consise summary of this text:\n A neutron star is the collapsed core of a massive supergiant star, which had a total mass of between 10 and 25 solar masses, possibly more if the star was especially metal-rich.[1] Neutron stars are the smallest and densest stellar objects, excluding black holes and hypothetical white holes, quark stars, and strange stars.[2] Neutron stars have a radius on the order of 10 kilometres (6.2 mi) and a mass of about 1.4 solar masses.[3] They result from the supernova explosion of a massive star, combined with gravitational collapse, that compresses the core past white dwarf star density to that of atomic nuclei.\n the summary is:\n Neutron stars are the collapsed cores of massive supergiant stars, with a radius of around 10 kilometres and a mass of 1.4 solar masses. They are formed from the supernova explosion of a massive star combined with gravitational collapse, compressing the core beyond white dwarf star density.\n Give me a consise summary of this text:\n Marlon Brando was an American actor considered one of the most influential actors of the 20th century. He received numerous accolades throughout his career which spanned six decades including two Academy Awards, two Golden Globe Awards, one Cannes Film Festival Award and three British Academy Film Awards. Brando was also a civil rights activist and various Native American movements. Having studied the Stella Adler in 1940s, he is credited with being one of the first actors to bring the Stanislavski system of acting and method acting to mainstream audiences.
\n the summary is:\n Marlon Brando was an American actor considered one of the most influential actors of the 20th century. He received numerous accolades throughout his career which spanned six decades including two Academy Awards, two Golden Globe Awards, one Cannes Film Festival Award and three British Academy Film Awards. Brando was also a civil rights activist and various Native American movements.\n Give me a consise summary of this text:\n Musk was born in Pretoria, South Africa and briefly attended the University of Pretoria before moving to Canada at age 18, acquiring citizenship through his Canadian-born mother. Two years later, he matriculated at Queen's University and transferred to the University of Pennsylvania, where he received bachelor's degrees in economics and physics. He moved to California in 1995 to attend Stanford University. After two days, he dropped out with his brother, Kimbal, and co-founded the online city guide software company Zip2. In 1999, Zip2 was acquired by Compaq for $307 million and Musk co-founded X.com, a direct bank. X.com merged with Confinity in 2000 to form PayPal, which eBay acquired for $1.5 billion in 2002.\n the summary is:\n Musk was born in Pretoria, South Africa and briefly attended the University of Pretoria before moving to Canada at age 18, acquiring citizenship through his Canadian-born mother. He moved to California in 1995 to attend Stanford University. In 1999, Zip2 was acquired by Compaq for $307 million and Musk co-founded X.com, a direct bank.\n Give me a consise summary of this text:\n ${transcript}\n\n the summary is:`,
          temperature: 0.7,
          max_tokens: 60,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 1,
        }),
      });
      const result = await response.json();
      setSummary(result.choices[0].text.trim());
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGenerateTranscript = async (audioFile) => {
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
      handleGenerateSummary(result.text);
      // setSummary("Summary shows here");
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
      handleGenerateTranscript(audioFile);
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
            <CopyToClipboard text={summary}>
              <MdContentCopy className="copy-icon" size={15} />
            </CopyToClipboard>
          </div>
          <div className="summary-text content">
            <p>{typedText}</p>
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
