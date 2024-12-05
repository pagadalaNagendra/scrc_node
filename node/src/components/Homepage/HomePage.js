import React, { useState, useEffect } from "react";
import { Select, MenuItem, Table, TableBody, TableCell, Box, TableContainer, TableHead, TableRow, TextField, Button, Typography, Paper, Grid, FormControl, InputLabel } from "@mui/material";
import "./Homepage.css"; // Import your styles
import config from "../config";
import Terminal from "../Terminal/Terminal"; // Import the Terminal component
import Status from "../Statustable/statustable";
import Node from "../statics/node";
import { useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Analytics from "../statics/analytics";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format } from "date-fns";
import Swal from "sweetalert2";

const NodeSelector = () => {
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [selectedMode, setSelectedMode] = useState("Node-Simultor");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [nodeDetails, setNodeDetails] = useState(null);
  const [frequency, setFrequency] = useState("");
  const [parameters, setParameters] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [terminalReloadKey, setTerminalReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParameters, setShowParameters] = useState(false);
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const handleStartTimeChange = (newValue) => setStartTime(newValue);
  const handleEndTimeChange = (newValue) => setEndTime(newValue);
  const formattedStartTime = startTime ? format(startTime, "dd:MM:yyyy") : "";
  const [dateTimeErrors, setDateTimeErrors] = useState({
    startTime: false,
    endTime: false,
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    fetch(`${config.backendAPI}/nodes/?skip=0&limit=1000`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNodes(data);
          setFilteredNodes(data); // Initially set filteredNodes to all nodes
          if (data.length > 0) {
            setSelectedNodeId(data[0].node_id); // Select the first node ID initially
          }
        } else {
          setNodes([]);
          setFilteredNodes([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching nodes data:", error);
        setNodes([]);
        setFilteredNodes([]);
      });
  }, []);
  // Fetch verticals on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    fetch(`${config.backendAPI}/verticals/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVerticals(data);
        } else {
          setVerticals([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching verticals:", error);
        setVerticals([]);
      });
  }, []);

  useEffect(() => {
    if (selectedVertical) {
      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/nodes/vertical/${selectedVertical}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFilteredNodes(data);
            setSelectedNodeId(data[0].node_id); // Automatically select the first node ID if available
          } else {
            alert("Node Ids not found");
            setFilteredNodes([]);
            setSelectedNodeId(""); // Reset selected node ID if no nodes are found
          }
        })
        .catch((error) => {
          console.error("Error fetching filtered nodes:", error);
          alert("Error fetching nodes. Please try again.");
        });
    } else {
      setFilteredNodes(nodes); // Reset filtered nodes to all nodes if no vertical is selected
    }
  }, [selectedVertical, nodes]); // Include nodes in the dependency array

  // Fetch filtered nodes when selected vertical changes
  useEffect(() => {
    if (selectedVertical) {
      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/nodes/vertical/${selectedVertical}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFilteredNodes(data);
            setSelectedNodeId(data[0].node_id);
          } else {
            alert("Node Ids not found");
            setFilteredNodes([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching filtered nodes:", error);
          alert("Error fetching nodes. Please try again.");
        });
    } else {
      setFilteredNodes([]);
    }
  }, [selectedVertical]);

  // Fetch all nodes data on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    fetch(`${config.backendAPI}/nodes/?skip=0&limit=1000`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNodes(data);
        } else {
          setNodes([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching nodes data:", error);
        setNodes([]);
      });
  }, []);

  // Fetch node details when a node is selected
  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find((node) => node.node_id === selectedNodeId);
      if (selectedNode) {
        setNodeDetails(selectedNode);
        if (selectedNode.frequency) {
          setFrequency(secondsToHMS(selectedNode.frequency));
        }
        setParameters(selectedNode.parameter || []);
        setShowParameters(false);
      }
    } else {
      setNodeDetails(null);
    }
  }, [selectedNodeId, nodes]);

  const handleNodeSelect = (event) => {
    setSelectedNodeId(event.target.value);
  };

  const handleVerticalSelect = (event) => {
    setSelectedVertical(event.target.value);
  };

  // const handleNavigate = (event) => {
  //   setSelectedMode(event.target.value);

  // };

  const secondsToHMS = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), secs.toString().padStart(2, "0")].join(":");
  };

  const hmsToSeconds = (hms) => {
    const [hours, minutes, seconds] = hms.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleStart = (event) => {
    event.preventDefault();

    if (!startTime) {
      Swal.fire({
        icon: "error",
        title: "Missing Start Time",
        text: "Please select a 'From' and 'To' time before starting.",
      });
      return;
    }

    if (!endTime) {
      Swal.fire({
        icon: "error",
        title: "Missing End Time",
        text: "Please select a 'To' time before starting.",
      });
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Time Range",
        text: "The 'From' time must be earlier than the 'To' time.",
      });
      return;
    }

    if (selectedNodeId && frequency) {
      const frequencyInSeconds = hmsToSeconds(frequency);
      const formattedParameters = parameters.map((param) => ({
        name: param.name,
        min: param.min_value,
        max: param.max_value,
      }));

      // Ensure the startTime and endTime are formatted properly or empty if not provided
      const formattedStartTime = startTime ? format(startTime, "dd-MM-yyyy HH:mm:ss") : "";
      const formattedEndTime = endTime ? format(endTime, "dd-MM-yyyy HH:mm:ss") : "";

      const payload = [
        {
          node_id: selectedNodeId,
          start_time: formattedStartTime, // Start time included here
          end_time: formattedEndTime, // End time included here
          frequency: frequencyInSeconds,
          parameters: formattedParameters,
          platform: nodeDetails.platform,
          protocol: nodeDetails.protocol,
        },
      ];

      console.log("Data being sent to the server:", JSON.stringify(payload, null, 2));

      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/services/start_scheduler`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          setNodeDetails((prevDetails) => ({ ...prevDetails, status: "start" }));
          setTerminalReloadKey((prevKey) => prevKey + 1);
        })
        .catch((error) => console.error("Error starting service:", error));
    }
  };

  const handleStop = (event) => {
    event.preventDefault();
    if (selectedNodeId) {
      const payload = [{ node_id: selectedNodeId }];
      const accessToken = localStorage.getItem("access_token");
  
      fetch(`${config.backendAPI}/services/stop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          setNodeDetails((prevDetails) => ({ ...prevDetails, status: "stop" }));
        })
        .catch((error) => console.error("Error stopping service:", error));
    }
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (selectedNodeId && frequency) {
      const frequencyInSeconds = hmsToSeconds(frequency);
      const formattedParameters = parameters.map((param) => ({
        name: param.name,
        min: param.min_value,
        max: param.max_value,
      }));
      const formattedStartTime = startTime ? format(startTime, "dd-MM-yyyy HH:mm:ss") : "";
      const formattedEndTime = endTime ? format(endTime, "dd-MM-yyyy HH:mm:ss") : "";

      const payload = {
        configuration: [
          {
            node_id: selectedNodeId,
            frequency: frequencyInSeconds,
            parameters: formattedParameters,
            platform: nodeDetails.platform,
            protocol: nodeDetails.protocol,
          },
        ],
        sim_type: "single",
        user_id: 1, // Replace with the actual user ID if needed
      };

      console.log("Data being sent to the server:", JSON.stringify(payload, null, 2));

      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/config/predefined`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          // If the save was successful
          Swal.fire({
            icon: "success",
            title: "Saved Successfully!",
            text: "Your data has been saved.",
          });
          console.log("Data saved successfully:", data);
        })
        .catch((error) => {
          // If there was an error saving
          Swal.fire({
            icon: "error",
            title: "Save Failed",
            text: "There was an error saving your data. Please try again.",
          });
          console.error("Error saving data:", error);
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please make sure to fill in all required fields.",
      });
    }
  };

  const handleFrequencyChange = (event) => {
    setFrequency(event.target.value);
  };

  const handleParameterChange = (index, field, value) => {
    setParameters((prevParams) => {
      const newParams = [...prevParams];
      newParams[index][field] = value;
      return newParams;
    });
  };

  const handleToggleParameters = () => {
    setShowParameters((prev) => !prev); // Toggle parameter visibility
  };

  useEffect(() => {
    navigate("/Node-Simultor"); // Navigate to "Multi Simulation" page initially
  }, [navigate]);

  const handleNavigate = (event) => {
    const selectedPage = event.target.value;
    setSelectedMode(selectedPage); // Update the state with the selected mode
    if (selectedPage) {
      navigate(`/${selectedPage}`); // Navigate to the selected page
    }
  };

  const validateDateTime = () => {
    const errors = {
      startTime: !startTime,
      endTime: !endTime,
    };
    setDateTimeErrors(errors);

    // Check if both dates are set and start is before end
    if (startTime && endTime && startTime >= endTime) {
      alert("Start time must be before end time");
      return false;
    }

    return !errors.startTime && !errors.endTime;
  };

  return (
    <div className="homepage-single">
      <Grid container spacing={2} justifyContent="center" alignItems="center" marginTop="-290px">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid item xs={12} md={6}>
            {nodeDetails && (
              <div className="node-details-single">
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4.2} sx={{ marginLeft: -3 }}>
                    <TextField
                      select
                      label="Select Mode"
                      value={selectedMode}
                      onChange={handleNavigate}
                      fullWidth
                      size="small"
                      sx={{ margin: 3, height: "40px" }} // Adjust the height as needed
                    >
                      <MenuItem value="Node-Simultor">Single Simulation</MenuItem>
                      <MenuItem value="Node-Simultor/platform">Multi Simulation</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={4} sx={{ height: 40, width: "100%", mt: 0, "& .MuiInputBase-root": { height: 30 } }}>
                    <TextField
                      select
                      value={selectedVertical}
                      onChange={handleVerticalSelect}
                      fullWidth
                      size="small"
                      label="Select Vertical"
                      sx={{
                        margin: 3,
                        "& .MuiInputBase-root": {
                          height: 40,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select Vertical</em>
                      </MenuItem>
                      {verticals.map((vertical) => (
                        <MenuItem key={vertical.id} value={vertical.id}>
                          {vertical.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={4} sx={{ height: 40, width: "100%", mt: 0, "& .MuiInputBase-root": { height: 30 } }}>
                    <TextField
                      select
                      value={selectedNodeId}
                      onChange={handleNodeSelect}
                      fullWidth
                      size="small"
                      label="Select Node ID"
                      disabled={filteredNodes.length === 0}
                      sx={{
                        margin: 3,
                        "& .MuiInputBase-root": {
                          height: 40,
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select Node ID</em>
                      </MenuItem>
                      {filteredNodes.map((node) => (
                        <MenuItem key={node.node_id} value={node.node_id}>
                          {node.node_id}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={4} sx={{ height: 40, width: "100%", mt: -3, "& .MuiInputBase-root": { height: 30 } }}>
                    <FormControl fullWidth error={dateTimeErrors.startTime}>
                      <InputLabel
                        shrink
                        sx={{
                          fontSize: "14px",
                          position: "absolute",
                          transform: "translate(0, -50%)",
                          marginLeft: "8px",

                          backgroundColor: "white",
                          padding: "0 4px",
                        }}
                      >
                        From
                      </InputLabel>
                      <DateTimePicker
                        value={startTime}
                        onChange={handleStartTimeChange}
                        inputFormat="dd:MM:yyyy HH:mm:ss"
                        ampm={false}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={dateTimeErrors.startTime}
                            helperText={dateTimeErrors.startTime ? "Start time is required" : ""}
                            fullWidth
                            sx={{
                              height: 40,
                              "& .MuiInputBase-root": {
                                height: 40,
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={4} sx={{ height: 40, width: "100%", mt: -3, "& .MuiInputBase-root": { height: 30 } }}>
                    <FormControl fullWidth error={dateTimeErrors.endTime}>
                      <InputLabel
                        shrink
                        sx={{
                          fontSize: "14px",
                          position: "absolute",
                          transform: "translate(0, -50%)",
                          marginLeft: "8px",
                          backgroundColor: "white",
                          padding: "0 4px",
                        }}
                      >
                        To
                      </InputLabel>
                      <DateTimePicker
                        value={endTime}
                        onChange={handleEndTimeChange}
                        inputFormat="dd:MM:yyyy HH:mm:ss"
                        ampm={false}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={dateTimeErrors.endTime}
                            helperText={dateTimeErrors.endTime ? "End time is required" : ""}
                            fullWidth
                            sx={{
                              height: 40,
                              "& .MuiInputBase-root": {
                                height: 40,
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                <Typography variant="h5"> </Typography>
                <br></br>
                <TableContainer component={Paper} sx={{ marginTop: -2 }}>
                  <Table className="node-node-node">
                    <TableBody>
                      {/* Node ID and Platform side by side */}
                      <TableRow>
                        <TableCell>Node ID</TableCell>
                        <TableCell>Protocol</TableCell>
                        <TableCell>Platform</TableCell>
                        <TableCell>Frequency</TableCell>
                      </TableRow>

                      {/* Protocol and Frequency side by side */}
                      <TableRow>
                        <TableCell>{nodeDetails.node_id}</TableCell>
                        <TableCell>{nodeDetails.protocol}</TableCell>
                        <TableCell>{nodeDetails.platform}</TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={frequency}
                            onChange={handleFrequencyChange}
                            placeholder="HH:MM:SS"
                            fullWidth
                            sx={{ height: 20, width: 95, color: 333, "& .MuiInputBase-root": { height: 20, width: 105, color: 333 } }}
                          />
                        </TableCell>
                      </TableRow>

                      {/* Scrollable Parameters Section */}
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div style={{ maxHeight: "80px", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                            <Table>
                            <Typography variant="h5" sx={{ fontSize: '1.25rem'}}>Parameters</Typography>                           
                               {parameters.map((param, index) => (
                                <TableRow key={index}>
                                  <TableCell>{param.name}</TableCell>
                                  <TableCell>
                                    <Grid container spacing={2}>
                                      <Grid item xs={6}>
                                        <TextField
                                          type="number"
                                          label="Min Value"
                                          value={param.min_value}
                                          onChange={(e) => handleParameterChange(index, "min_value", e.target.value)}
                                          variant="outlined"
                                          fullWidth
                                          size="small"
                                          sx={{
                                            "& .MuiInputBase-root": {
                                              height: 40,
                                            },
                                            "& .MuiInputBase-input": {
                                              padding: "8px",
                                            },
                                            "& .MuiInputLabel-root": {
                                              background: "white",
                                              padding: "0 4px",
                                            },
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={6}>
                                        <TextField
                                          type="number"
                                          label="Max Value"
                                          value={param.max_value}
                                          onChange={(e) => handleParameterChange(index, "max_value", e.target.value)}
                                          variant="outlined"
                                          fullWidth
                                          size="small"
                                          sx={{
                                            "& .MuiInputBase-root": {
                                              height: 40,
                                            },
                                            "& .MuiInputBase-input": {
                                              padding: "8px",
                                            },
                                            "& .MuiInputLabel-root": {
                                              background: "white",
                                              padding: "0 4px",
                                            },
                                          }}
                                        />
                                      </Grid>
                                    </Grid>
                                  </TableCell>

                                  {/* Add another parameter in the same row */}
                                  {parameters[index + 1] && (
                                    <>
                                      <TableCell>{parameters[index + 1].name}</TableCell>
                                      <TableCell>
                                        <Grid container spacing={1}>
                                          <Grid item xs={6}>
                                            <TextField
                                              type="number"
                                              label="Min Value"
                                              value={param.min_value}
                                              onChange={(e) => handleParameterChange(index, "min_value", e.target.value)}
                                              variant="outlined"
                                              fullWidth
                                              size="small"
                                              sx={{
                                                "& .MuiInputBase-root": {
                                                  height: 40,
                                                },
                                                "& .MuiInputBase-input": {
                                                  padding: "8px",
                                                },
                                                "& .MuiInputLabel-root": {
                                                  background: "white",
                                                  padding: "0 4px",
                                                },
                                              }}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <TextField
                                              type="number"
                                              label="Max Value"
                                              value={param.max_value}
                                              onChange={(e) => handleParameterChange(index, "max_value", e.target.value)}
                                              variant="outlined"
                                              fullWidth
                                              size="small"
                                              sx={{
                                                "& .MuiInputBase-root": {
                                                  height: 40,
                                                },
                                                "& .MuiInputBase-input": {
                                                  padding: "8px",
                                                },
                                                "& .MuiInputLabel-root": {
                                                  background: "white",
                                                  padding: "0 4px",
                                                },
                                              }}
                                            />
                                          </Grid>
                                        </Grid>{" "}
                                      </TableCell>
                                    </>
                                  )}
                                </TableRow>
                              ))}
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <br></br>

                <Box display="flex" alignItems="center" sx={{ mt: -5 }}>
                  <Status sx={{ ml: -50 }} />
                  <Button className="home-stop-terminal" variant="contained" color="secondary" onClick={handleSave} sx={{ ml: "auto", display: "block", mr: 0.5 }}>
                    Save
                  </Button>

                  <Button
                    className="home-start-terminal"
                    variant="contained"
                    color="primary"
                    onClick={handleStart}
                    sx={{ ml: "auto", display: "block", mr: 1 }}
                    disabled={nodeDetails.status === "start"}
                  >
                    Start
                  </Button>

                  <Button className="home-stop-terminal" variant="contained" color="secondary" onClick={handleStop} sx={{ ml: "auto", display: "block" }} disabled={nodeDetails.status === "stop"}>
                    Stop
                  </Button>
                </Box>

                <div className="terminal-home-code-codet">
                  <Terminal />
                </div>
              </div>
            )}
          </Grid>

          <Grid item xs={12} md={6} className="right-sidebar">
            <div className="right-sidebar">
              <div className="table-containerSS-live">
                <Node />
              </div>

              <Analytics />
            </div>
          </Grid>
        </LocalizationProvider>
      </Grid>
    </div>
  );
};

export default NodeSelector;
