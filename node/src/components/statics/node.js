import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";
import Swal from "sweetalert2";
import config from "../config";

const Terminal = ({ reloadKey }) => {
  const [responseData, setResponseData] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [successCount, setSuccessCount] = useState(0); // Count of successful responses
  const [errorCount, setErrorCount] = useState(0); // Count of error responses

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const eventSource = new EventSource(`${config.backendAPI}/services/events?access_token=${accessToken}`,);
  
    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        const { node_id, status_code } = parsedData;
  
        setTotalResponses((prevCount) => prevCount + 1);
  
        if (status_code === 201) {
          setSuccessCount((prev) => prev + 1);
        } else {
          setErrorCount((prev) => prev + 1);
          handleAlert(node_id);
        }
      } catch (err) {
        console.error("Error parsing event data:", err);
      }
    };
  
    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };
  
    // Set up a timer to calculate averages every minute
    const intervalId = setInterval(() => {
      setResponseData((prevData) => {
        const newData = [
          ...prevData,
          {
            time: new Date().toLocaleTimeString(),
            "201": successCount,
            errors: errorCount,
          },
        ];

        // Reset counts for the next interval
        setSuccessCount(0);
        setErrorCount(0);

        return newData.slice(-10); // Keep the last 10 data points for the graph
      });
    }, 10000); // Every 60 seconds

    return () => {
      clearInterval(intervalId);
      eventSource.close();
    };
  }, [reloadKey, successCount, errorCount]);

  const handleAlert = (nodeId) => {
    Swal.fire({
      title: "Node Issue Detected",
      text: `There was a problem with node: ${nodeId}`,
      icon: "warning",
    });
  };

  const [lineColors, setLineColors] = useState({
    line201: '#000000', // Initial color black
    lineErrors: '#000000', // Initial color black
  });

  useEffect(() => {
    if (responseData && responseData.length > 0) {
      setLineColors({
        line201: '#82ca9d', // Change to desired color after response
        lineErrors: '#ff7300', // Change to desired color after response
      });
    }
  }, [responseData]);

  return (
    <div style={{ width: "100%", height: 900, marginLeft: "-60px", marginTop: "0px"}}>
      {/* <h2>Node Response Over Time</h2> */}
      <div style={{ marginBottom: "10px", marginLeft: "85px"}}>
        <strong>Total Responses:</strong> {totalResponses}
      </div>
      <ResponsiveContainer width="120%" height="26%" marginLeft= "-20px">
        <LineChart data={responseData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" hide /> {/* Hide the XAxis */}
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="201" stroke={lineColors.line201} />
          <Line type="monotone" dataKey="errors" stroke={lineColors.lineErrors} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Terminal;