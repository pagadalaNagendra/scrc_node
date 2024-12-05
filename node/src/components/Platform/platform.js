import React, { useState, useEffect } from "react";
import "./platform.css";
import config from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import Terminal from "../Terminal/Terminal"; // Import the Terminal component
import Status from "../Statustable/statustable";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format } from "date-fns";
import Analytics from "../statics/analytics";
import Node from "../statics/node";
import Swal from "sweetalert2";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  FormLabel,
  Collapse,
  Typography,
  Box,
  Grid,
  Grid2,
} from "@mui/material";
const ParameterCard = ({ parameter, onUpdate }) => {
  const [minValue, setMinValue] = useState(parameter.min_value);
  const [maxValue, setMaxValue] = useState(parameter.max_value);

  const handleSave = () => {
    onUpdate(parameter.id, { min_value: minValue, max_value: maxValue });
  };

  return (
    <div className="parameter-card">
      <h4>{parameter.name}</h4>
      <div>
        <label>
          Min:
          <input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
        </label>
        <label>
          Max:
          <input type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
        </label>
      </div>
    </div>
  );
};

const Platform = () => {
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [platformData, setPlatformData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedMode, setSelectedMode] = useState("Node-Simultor/platform");
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedNegativeAction, setSelectedNegativeAction] = useState(""); // Fetch unique platforms
  const [fieldOne, setFieldOne] = useState("");
  const [fieldTwo, setFieldTwo] = useState("");
  const [startTime, setStartTime] = useState(null); // To store the start time
  const [endTime, setEndTime] = useState(null);
  const handleStartTimeChange = (newValue) => setStartTime(newValue);
  const handleEndTimeChange = (newValue) => setEndTime(newValue);
  // const formattedStartTime = startTime ? format(startTime, "dd:MM:yyyy") : "";

  const navigate = useNavigate();
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    fetch(`${config.backendAPI}/nodes?skip=0&limit=1000`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const uniquePlatforms = Array.from(new Set(data.map((node) => node.platform))).filter(Boolean);
        setPlatforms(uniquePlatforms);
        if (uniquePlatforms.includes("ccsp")) {
          setSelectedPlatform("ccsp");
        }
      })
      .catch((error) => console.error("Error fetching nodes:", error));
  }, []);

  // Fetch platform data based on selected platform
  useEffect(() => {
    if (selectedPlatform) {
      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/nodes?skip=0&limit=1000`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const filteredData = data.filter((node) => node.platform === selectedPlatform);
          const nodesWithParams = Promise.all(
            filteredData.map(async (node) => {
              const paramResponse = await fetch(`${config.backendAPI}/nodes/${node.node_id}`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              const paramData = await paramResponse.json();
              return { ...node, parameters: paramData.parameters || [] };
            })
          );

          nodesWithParams.then(setPlatformData).catch((error) => console.error("Error fetching node parameters:", error));
          setSelectedNodes([]);
        })
        .catch((error) => console.error("Error fetching platform data:", error));
    } else {
      setPlatformData([]);
    }
  }, [selectedPlatform]);

  // Fetch names from verticals
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    fetch(`${config.backendAPI}/verticals/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setNames(data))
      .catch((error) => console.error("Error fetching names:", error));
  }, []);

  // Fetch data from the URL for the DataTable
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    fetch(`${config.backendAPI}/nodes/?skip=0&limit=1000`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFetchedData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handlePlatformSelect = (event) => {
    const platform = event.target.value;
    setSelectedPlatform(platform);
    setSelectedNodes([]);
    setPlatformData([]);
  };

  const handleNodeSelect = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "selectAll") {
      const allNodeIds = platformData.map((node) => node.node_id);
      setSelectedNodes(allNodeIds);
    } else {
      if (selectedNodes.includes(selectedValue)) {
        setSelectedNodes(selectedNodes.filter((id) => id !== selectedValue));
      } else {
        setSelectedNodes([...selectedNodes, selectedValue]);
      }
    }
  };

  const handleCheckboxChange = (nodeId) => {
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(selectedNodes.filter((id) => id !== nodeId));
    } else {
      setSelectedNodes([...selectedNodes, nodeId]);
    }
  };

  const handleViewDetails = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId], // Toggle expanded state for the selected node
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNodes([]);
    } else {
      const allNodeIds = platformData.map((node) => node.node_id);
      setSelectedNodes(allNodeIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectNode = (nodeId) => {
    setSelectedNodes((prev) => (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]));
  };

  const handleToggle = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleRangeChange = (event) => {
    const { name, value } = event.target;
    if (name === "rangeStart") {
      setRangeStart(value);
    } else if (name === "rangeEnd") {
      setRangeEnd(value);
    }
  };

  const handleApplyRange = () => {
    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);
    if (!isNaN(start) && !isNaN(end) && start >= 1 && end >= 1 && start <= end) {
      const rangeSelectedNodes = platformData.slice(start - 1, end).map((node) => node.node_id);
      setSelectedNodes(rangeSelectedNodes);
    } else {
      alert("Invalid range. Please enter valid numbers where 'from' and 'to' are greater than or equal to 1 and 'from' is less than or equal to 'to'.");
    }
  };

  const handleFieldOneChange = (event) => {
    setFieldOne(event.target.value);
  };

  const handleFieldTwoChange = (event) => {
    setFieldTwo(event.target.value);
  };

  const handleNameSelect = (event) => {
    const selectedName = event.target.value;
    setSelectedName(selectedName);

    if (selectedName) {
      const selectedVertical = names.find((name) => name.name === selectedName);
      const verticalId = selectedVertical ? selectedVertical.id : null;

      if (verticalId) {
        const accessToken = localStorage.getItem("access_token");

        fetch(`${config.backendAPI}/nodes/vertical/${verticalId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
          })
          .then((data) => {
            const nodesWithParams = Promise.all(
              data.map(async (node) => {
                const paramResponse = await fetch(`${config.backendAPI}/nodes/${node.node_id}?skip=0&limit=1000`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
                const paramData = await paramResponse.json();
                return { ...node, parameters: paramData.parameters || [] };
              })
            );

            nodesWithParams
              .then((nodes) => {
                setPlatformData(nodes);
              })
              .catch((error) => console.error("Error fetching node parameters:", error));

            setSelectedNodes([]);
          })
          .catch((error) => console.error("Error fetching nodes for selected vertical:", error));
      } else {
        console.error("Vertical ID not found for the selected name.");
      }
    } else {
      setPlatformData([]);
    }
  };

  const formattedStartTime = startTime ? format(startTime, "dd-MM-yyyy HH:mm:ss") : "";
  const formattedEndTime = endTime ? format(endTime, "dd-MM-yyyy HH:mm:ss") : "";

  const handleStart = () => {
    if (!startTime || !endTime || selectedNodes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Required fields missing",
        text: "Please select start time, end time, and at least one node before starting.",
        confirmButtonText: "Okay",
      });
    } else {
      console.log("Starting...");
      setIsRunning(true);
      Swal.fire({
        icon: "success",
        title: "Node Started Successfully",
        text: "The node has been started successfully.",
        confirmButtonText: "Okay",
      });
    }

    const startData = platformData
      .filter((node) => selectedNodes.includes(node.node_id))
      .map((node) => ({
        node_id: node.node_id,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        frequency: node.frequency,
        parameters: (node.parameter || []).map((param) => {
          const { vertical_id, data_type, id, min_value, max_value, ...rest } = param;

          // Convert min_value and max_value to integers (if they exist)
          const min = min_value ? parseInt(min_value, 10) : undefined;
          const max = max_value ? parseInt(max_value, 10) : undefined;

          return {
            ...rest,
            min: min,
            max: max,
          };
        }),
        platform: node.platform,
        protocol: node.protocol,
      }));

    console.log("Start Data:", JSON.stringify(startData, null, 2));

    fetch(`${config.backendAPI}/services/start_scheduler`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(startData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Start response:", data);
        setIsRunning(true); // Update the state to indicate running
      })
      .catch((error) => console.error("Error starting services:", error));
  };

  const handleSave = () => {
    if (!startTime || !endTime || selectedNodes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Required fields missing",
        text: "Please select start time, end time, and at least one node before saving.",
        confirmButtonText: "Okay",
      });
    } else {
      console.log("Saving...");
      const configuration = platformData
        .filter((node) => selectedNodes.includes(node.node_id))
        .map((node) => ({
          node_id: node.node_id,
          frequency: node.frequency,
          parameters: (node.parameter || []).map((param) => {
            const { name, min_value, max_value } = param;

            return {
              name: name,
              min: min_value ? min_value.toString() : undefined,
              max: max_value ? max_value.toString() : undefined,
            };
          }),
          platform: node.platform,
          protocol: node.protocol,
        }));

      const saveData = {
        configuration: configuration,
        sim_type: "multiple",
        user_id: 0,
      };

      console.log("Save Data:", JSON.stringify(saveData, null, 2));

      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/config/predefined`, {
        method: "POST", // Changed to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(saveData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Save response:", data);
          Swal.fire({
            icon: "success",
            title: "Configuration Saved Successfully",
            text: "The configuration has been saved successfully.",
            confirmButtonText: "Okay",
          });
        })
        .catch((error) => console.error("Error saving configuration:", error));
    }
  };

  const handleStop = () => {
    const selectedNodesData = platformData.filter((node) => selectedNodes.includes(node.node_id)).map((node) => ({ node_id: node.node_id }));

    fetch(`${config.backendAPI}/services/stop`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedNodesData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Stop response:", data);
        setIsRunning(false);
      })
      .catch((error) => console.error("Error stopping services:", error));
  };

  const handleParameterUpdate = (paramId, newValues) => {
    setPlatformData((prevData) =>
      prevData.map((node) =>
        node.parameters
          ? {
              ...node,
              parameters: node.parameters.map((param) => (param.id === paramId ? { ...param, ...newValues } : param)),
            }
          : node
      )
    );
  };
  const handleNegativeActionSelect = (event) => {
    const action = event.target.value;
    setSelectedNegativeAction(action);

    // Navigate based on the selected action
    if (action) {
      navigate(action);
    }
  };

  useEffect(() => {
    navigate("/Node-Simultor/platform"); // Navigate to "Multi Simulation" page initially
  }, [navigate]);

  const handleNavigate = (event) => {
    const selectedPage = event.target.value;
    setSelectedMode(selectedPage); // Update the state with the selected mode
    if (selectedPage) {
      navigate(`/${selectedPage}`); // Navigate to the selected page
    }
  };
  return (
    <div className="homepage">
      {/* Main Content */}
      <div className="main-content">
        <Grid container spacing={2} alignItems="center">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField select label="Simulation Mode" value={selectedMode} onChange={handleNavigate} fullWidth size="small" sx={{ margin: 3 }}>
                <MenuItem value="Node-Simultor">Single Simulation</MenuItem>
                <MenuItem value="Node-Simultor/platform">Multi Simulation</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField select label="Select Platform" value={selectedPlatform} onChange={handlePlatformSelect} fullWidth size="small" sx={{ margin: 3 }}>
                <MenuItem value="">
                  <p>Select Platform</p>
                </MenuItem>
                {platforms.map((platform, index) => (
                  <MenuItem key={index} value={platform}>
                    {platform}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={11} sm={3.5}>
              <TextField select label="Select Vertical" value={selectedName} onChange={handleNameSelect} fullWidth size="small" sx={{ margin: 3 }}>
                <MenuItem value="">
                  <p>Select Vertical</p>
                </MenuItem>
                {names.map((name) => (
                  <MenuItem key={name.id} value={name.name}>
                    {name.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" marginLeft={"-7px"}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={4.05} sx={{ height: 40, width: "100%", "& .MuiInputBase-root": { height: 40 } }}>
              <FormControl fullWidth>
                <InputLabel
                  shrink
                  sx={{
                    fontSize: "14px",
                    // color: "black",
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

            <Grid item xs={4.05} sx={{ height: 40, width: "100%", "& .MuiInputBase-root": { height: 40 } }}>
              <FormControl fullWidth>
                <InputLabel
                  shrink
                  sx={{
                    fontSize: "14px",
                    // color: "black",
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
                  inputFormat="yyyy-MM-dd HH:mm:ss"
                  ampm={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
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
          </LocalizationProvider>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 150,
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
            }}
          >
            <Table className="node-table">
              <TableHead>
                <TableRow sx={{ height: 36 }}>
                  <TableCell padding="checkbox" sx={{ padding: "6px" }}>
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>Node ID</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>Platform</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>Frequency</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>Protocol</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>Parameters</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {platformData.length > 0 ? (
                  platformData.map((node) => (
                    <React.Fragment key={node.node_id}>
                      <TableRow sx={{ height: 30 }}>
                        <TableCell padding="checkbox" sx={{ padding: "6px" }}>
                          <Checkbox checked={selectedNodes.includes(node.node_id)} onChange={() => handleSelectNode(node.node_id)} />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>{node.node_id}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>{node.platform}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>{node.frequency}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>{node.protocol}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", padding: "6px" }}>
                          <Box
                            onClick={() => handleToggle(node.node_id)}
                            sx={{
                              padding: "2px 8px",
                              backgroundColor: "#1976d2",
                              width: "40px",
                              color: "#fff",
                              borderRadius: "4px",
                              cursor: "pointer",
                              textAlign: "center",
                              "&:hover": {
                                backgroundColor: "#1565c0",
                              },
                            }}
                          >
                            {expandedNodes[node.node_id] ? <Visibility sx={{ verticalAlign: "middle", marginRight: 1 }} /> : <VisibilityOff sx={{ verticalAlign: "middle", marginRight: 1 }} />}
                          </Box>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={4} style={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={expandedNodes[node.node_id]} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              {node.parameter && Array.isArray(node.parameter) && node.parameter.length > 0 ? (
                                <div className="parameter-list">
                                  <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                                    Parameters:
                                  </Typography>
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                    {" "}
                                    {/* Adjust the gap here */}
                                    {node.parameter.map((parameter, i) => (
                                      <Box
                                        key={i}
                                        className="parameter-item"
                                        sx={{
                                          padding: 1.5,
                                          marginBottom: 1.5,
                                          borderRadius: "8px",
                                          width: "calc(33.33% - 16px)", // Adjust for three items per row
                                          display: "flex",
                                          alignItems: "center", // Align items vertically in the center
                                          gap: 0.5, // Decreased gap between name and fields
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 400,
                                            minWidth: "80px", // Optional: reduced width for consistent alignment
                                          }}
                                        >
                                          {parameter.name}
                                        </Typography>
                                        <TextField label="Min Value" variant="outlined" value={parameter.min_value} size="small" InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                                        <TextField label="Max Value" variant="outlined" value={parameter.max_value} size="small" InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                                      </Box>
                                    ))}
                                  </Box>
                                </div>
                              ) : (
                                <Typography>No parameters available for this node.</Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No platform data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {platformData.length > 0 && (
          <div className="button-container" style={{ marginTop: "-12px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Status />

              <div className="startstop-buttons-container" style={{ display: "flex", gap: "10px" }}>
                <button className="startbtn" onClick={handleSave} disabled={isRunning}>
                  Save
                </button>
                <button className="startbtn" onClick={handleStart} disabled={isRunning}>
                  Start
                </button>
                <button className="stopbtn" onClick={handleStop} disabled={!isRunning}>
                  Stop
                </button>
              </div>
            </div>
            <div className="terminal-home-code">
              <Terminal />
            </div>
          </div>
        )}
      </div>
      {/* Right Sidebar */}
      <div className="right-sidebar">
        <div className="table-containerSS-live">
          <Node />
        </div>
        <Analytics />
      </div>
    </div>
  );
};

export default Platform;
