import React, { useEffect, useState, useRef, useCallback } from "react";
import "./Terminal.css";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import config from "../config";
const Terminal = ({ reloadKey }) => {
  const [data, setData] = useState("");
  const [runningNodes, setRunningNodes] = useState(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [streamingActive, setStreamingActive] = useState(true);
  const [newDataAdded, setNewDataAdded] = useState(false);

  const terminalContentRef = useRef(null);
  const shouldScrollRef = useRef(true);

  // Improved auto-scrolling logic
  const scrollToBottom = useCallback(() => {
    if (terminalContentRef.current && shouldScrollRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, []);

  // Handle user scroll interaction
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // User is near the bottom, allow auto-scroll
    shouldScrollRef.current = 
      scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  useEffect(() => {
    if (!streamingActive) return;

    const eventSource = new EventSource(`${config.backendAPI}/services/events`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        const { node_id, status_code, error } = parsedData;

        setData((prevData) => {
          const newData = prevData + JSON.stringify(parsedData, null, 2) + "\n";
          setNewDataAdded(true);
          return newData;
        });
        

        if (status_code !== 201) {
          console.warn(`Issue detected with node: ${node_id}`);
        } else {
          setRunningNodes((prevNodes) => new Set(prevNodes).add(node_id));
        }
      } catch (err) {
        console.error("Failed to parse event data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [reloadKey, streamingActive]);

  // Scroll to bottom when new data is added
  useEffect(() => {
    scrollToBottom();
  }, [data, scrollToBottom]);

  const stopRequests = async () => {
    try {
      const response = await fetch(`${config.backendAPI}/services/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: Array.from(runningNodes) }),
      });

      if (!response.ok) {
        throw new Error("Failed to stop the requests.");
      }

      console.log("All running nodes have been stopped.");
      setRunningNodes(new Set());
    } catch (error) {
      console.error("Error stopping requests:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const accessToken = sessionStorage.getItem("access_token");
      const response = await fetch(`${config.backendAPI}/logger/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from logger.");
      }
  
      const loggerData = await response.text();
      const file = new Blob([loggerData], { type: "text/plain" });
  
      const link = document.createElement("a");
      const url = URL.createObjectURL(file);
  
      link.href = url;
      link.download = "logger_data.txt";
  
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading data:", error);
    }
  };
  
  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const toggleStream = () => {
    setStreamingActive((prevState) => !prevState);
  };

  const handleClear = () => {
    setData("");
    setNewDataAdded(false);
    shouldScrollRef.current = true;
  };

  return (
    <div className="streaming-data-container">
      <div>
        <h2 className="terminal-title">Console</h2>
      </div>

      <div className="terminal-controls">
        <button onClick={toggleStream} className="stream-toggle-button">
          <FontAwesomeIcon 
            icon={streamingActive ? faPause : faPlay} 
            className="stream-icon" 
          />
        </button>
        <button onClick={handleClear}>Clear Terminal</button>
        <button className="download-button" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} className="download-icon" />
        </button>

        <button className="collapse-button" onClick={toggleCollapse}>
          <FontAwesomeIcon 
            icon={isCollapsed ? faChevronDown : faChevronUp} 
            className="collapse-icon" 
          />
        </button>
      </div>

      <div 
        className={`terminal-content ${newDataAdded ? "highlight-new" : ""}`} 
        ref={terminalContentRef}
        onScroll={handleScroll}
      >
        {!isCollapsed && <pre>{data}</pre>}
      </div>


    </div>
  );
};

export default Terminal;