import React, { useState, useEffect } from "react";
import "./Historystatus.css"; // Ensure your styles are maintained
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Modal from "../Terminal/Modal"; // Import the Modal component
import config from "../config";
const Historystatus = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false); 
  const [selectedParameters, setSelectedParameters] = useState(null); 

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
  
        const response = await fetch(`${config.backendAPI}/simulations/`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setSimulations(data);
        } else {
          throw new Error("Received non-JSON response");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSimulations();
  }, []);

  const parseParameters = (parameters) => {
    try {
      if (!parameters) return []; 
      const formattedParams = parameters
        .replace(/Parameter\(/g, "{")
        .replace(/\)/g, "}")
        .replace(/name='/g, '"name":"')
        .replace(/', min=/g, '", "min":')
        .replace(/, max=/g, ', "max":')
        .replace(/'/g, '"');
      const parsedParams = JSON.parse(`[${formattedParams}]`);
      return parsedParams;
    } catch (error) {
      console.error("Error parsing parameters:", error);
      return []; 
    }
  };

  const renderNodeIds = (node_ids) => {
    if (Array.isArray(node_ids)) {
      return node_ids.map((nodeId, index) => (
        <div key={index}>
          {index + 1}. {nodeId}
        </div>
      ));
    } else {
      return <div>Invalid Node IDs</div>;
    }
  };

  const handleDownload = async (timestamp) => {
    try {
      const unixTimestamp = String(timestamp);
      const payload = { timestamp: unixTimestamp };
      const accessToken = localStorage.getItem("access_token");
  
      const response = await fetch(`${config.backendAPI}/logger/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download: ${response.statusText} - ${errorText}`);
      }
  
      const rawText = await response.text();
      const cleanedText = rawText
        .trim()
        .replace(/},\s*{/g, "},{")
        .replace(/,\s*$/, "");
      const fixedJson = `[${cleanedText}]`;
      const data = JSON.parse(fixedJson);
  
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `download_${unixTimestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error during download:", error);
    }
  };
  const handleParameterClick = (parameters) => {
    setSelectedParameters(parseParameters(parameters));
    setModalOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="historystatus-homepage">
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} parameters={selectedParameters} />
      <div className="historystatus-content">
        <h2>Simulations Data</h2>
        <table className="historystatus-table">
          <thead>
            <tr>
              <th>Node IDs</th>
              <th>Timestamp</th>
              <th>Platform</th>
              <th>Parameters</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {simulations.map((simulation, index) => (
              <tr key={index}>
                <td>{renderNodeIds(simulation.node_ids)}</td>
                <td>{simulation.timestamp}</td>
                <td>{simulation.platform}</td>
                <td>
                  <div
                    className="historystatus-parameters"
                    onClick={() => handleParameterClick(simulation.parameter)}
                  >
                    {simulation.parameter}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleDownload(simulation.timestamp)}
                    className="historystatus-download-button"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Historystatus;
