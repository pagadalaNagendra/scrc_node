import React, { useEffect, useState } from "react";
import "./Notification.css";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import config from "../config";

const Notification = ({ reloadKey }) => {
  const [alertData, setAlertData] = useState([]);
  const [streamingActive, setStreamingActive] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${config.backendAPI}/alerts/`);
        if (response.ok) {
          const data = await response.json();
          setAlertData(data);
        } else {
          console.error("Failed to fetch alert data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching alert data:", error);
      }
    };

    fetchAlerts();
  }, [reloadKey]);

  useEffect(() => {
    if (!streamingActive) return;

    const eventSource = new EventSource(`${config.backendAPI}/services/events`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        const { node_id, status_code, error } = parsedData;

        if (status_code !== 201) {
          handleAlert(node_id, status_code, error);
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

  const handleAlert = (nodeId, statusCode, error) => {
    const alert = {
      nodeId,
      statusCode,
      error: String(error),
      timestamp: Math.floor(Date.now() / 1000),
    };

    setAlertData((prevData) => [...prevData, alert]);

    sendAlertToServer(alert);
  };

  const sendAlertToServer = async (alert) => {
    try {
      const response = await fetch(`${config.backendAPI}/alerts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: alert.timestamp,
          node_id: alert.nodeId,
          status_code: alert.statusCode,
          error_message: alert.error,
        }),
      });

      if (!response.ok) {
        console.error("Failed to post alert data:", response.statusText);
      }
    } catch (error) {
      console.error("Error posting alert data:", error);
    }
  };

  const deleteAlert = async (timestamp) => {
    try {
      const response = await fetch(`${config.backendAPI}/alerts/${timestamp}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete alert:", response.statusText);
      } else {
        setAlertData((prevData) => prevData.filter((alert) => alert.timestamp !== timestamp));
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  // Function to clear all alert data
  const clearAlerts = () => {
    setAlertData([]);
  };

  // Function to dismiss a specific alert by index
  const dismissAlert = (index, timestamp) => {
    deleteAlert(timestamp);
  };

  return (
    <div className="notification-container">
      {alertData.length > 0 ? (
        <div className="alert-cards">
          <h3>Node Alerts</h3>
          <Grid container spacing={2}>
            {alertData.map((alert, index) => (
              <Grid item xs={12} key={index}> {/* Set xs to 12 to take full width */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Node: {alert.node_id}
                    </Typography>
                    <Typography color="textSecondary">
                      Timestamp: {alert.timestamp}
                    </Typography>
                    <Typography color="textSecondary">
                      Status: {alert.status_code}
                    </Typography>
                    <Typography color="textSecondary">
                      Error: {alert.error_message || "N/A"}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => dismissAlert(index, alert.timestamp)}
                      sx={{ marginTop: 1.5, marginLeft: 50 }} 
                    >
                      Mark as read
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      ) : (
        <p>No alerts available.</p>
      )}
    </div>
  );
};

export default Notification;