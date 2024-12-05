import React, { useEffect, useState } from "react";
import config from "../config";

const Status = () => {
  const [nodes, setNodes] = useState([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${config.backendAPI}/nodes/?skip=0&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        setNodes(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Helper function to check if services contain 'start' (case-insensitive)
  const hasStartService = (services) => {
    return services.toLowerCase().includes("start");
  };

  // Count nodes with start service and not start service
  const startCount = nodes.filter((node) => hasStartService(node.services)).length;
  const notStartCount = nodes.length - startCount;

  // Calculate the progress percentage (for the "Start Service" progress)
  const progressPercentage = nodes.length > 0 ? (startCount / nodes.length) * 100 : 0;

  return (
    <div style={{ margin: "20px auto", width: "80%", textAlign: "center"}}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            height: "35px",
            backgroundColor: "#ECEEF8",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Progress Bar */}
          <progress
            id="progress"
            value={progressPercentage}
            max="100"
            style={{
              width: "100%",
              height: "0%",
              appearance: "none",
              border: "none",
              backgroundColor: "transparent",
            }}
          >
            {/* This text will display if the progress bar isn't supported */}
            <span style={{ marginLeft: "10px", fontSize: "16px" }}>{Math.round(progressPercentage)}%</span>
          </progress>

          {/* Progress Indicator */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${progressPercentage}%`,
              height: "100%",
              borderRadius: "10px",
              backgroundColor: "#4caf50", // Assuming green as the progress color
            }}
          />

          {/* Percentage Label Positioned to the Right */}
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
