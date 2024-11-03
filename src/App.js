import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

const { speechSynthesis, SpeechSynthesisUtterance } = window;

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [prevDetectedObjects, setPrevDetectedObjects] = useState([]);

  const convertObjectsToText = (objects) => {
    if (objects.length === 0) {
      return "No objects detected.";
    }
    const objectList = objects.map((obj) => obj.class).join(", ");
    return `Detected objects: ${objectList}.`;
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  const detect = async (net) => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const objects = await net.detect(video);

      if (objectsChanged(objects, prevDetectedObjects)) {
        const text = convertObjectsToText(objects);
        speak(text);
        setPrevDetectedObjects(objects);
      } else {
        // If no new objects detected, reset prevDetectedObjects
        setPrevDetectedObjects([]);
      }

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, videoWidth, videoHeight);
      drawRect(objects, ctx, videoWidth, videoHeight);
    }

    // Use setTimeout to call the next detection after 5 seconds
    setTimeout(() => detect(net), 5000);
  };

  const objectsChanged = (newObjects, oldObjects) => {
    if (newObjects.length !== oldObjects.length) {
      return true;
    }
    for (let i = 0; i < newObjects.length; i++) {
      if (newObjects[i].class !== oldObjects[i].class) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const runCoco = async () => {
      const net = await cocoSsd.load({ score: 0.3 }); // Adjust confidence threshold
      // Initial detection starts after 5 seconds
      setTimeout(() => detect(net), 400);
    };
    runCoco();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;