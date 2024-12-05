import React, { useState, useEffect } from "react";
import { Grid, TextField, MenuItem, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Terminal from "../Terminal/Terminal";
import Status from "../Statustable/statustable";
import Analytics from "../statics/analytics";
import Node from "../statics/node";
import "./Predefinedconfigurations.css"
import config from "../config";
const PredefinedConfigurations = () => {
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [selectedMode, setSelectedMode] = useState("Node-Simultor/Predefinedconfigurations");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [verticals, setVerticals] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [predefinedNodes, setPredefinedNodes] = useState([]);
  const navigate = useNavigate();

  // Fetch verticals
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    fetch(`${config.backendAPI}/verticals/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then(setVerticals)
      .catch(console.error);
  }, []);

  // Fetch predefined nodes and populate Node ID dropdown
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    fetch(`${config.backendAPI}/config/predefined/single`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched predefined nodes:", data); // Debugging line
        if (Array.isArray(data)) {
          const nodes = data.map((item) => item.configuration[0]);
          setNodes(nodes);
          setFilteredNodes(nodes); // Populate Node ID dropdown
          if (nodes.length > 0) setSelectedNodeId(nodes[0].node_id);
        } else {
          setNodes([]);
          setFilteredNodes([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching predefined nodes:", error);
        setNodes([]);
        setFilteredNodes([]);
      });
  }, []);

  // Fetch predefined nodes based on selection
  useEffect(() => {
    if (selectedNodeId) {
      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/config/predefined/single?node_id=${selectedNodeId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched predefined nodes:", data); // Debugging line
          if (Array.isArray(data)) {
            const predefinedNodes = data.map((item) => item.configuration[0]);
            setPredefinedNodes(predefinedNodes);
          } else {
            setPredefinedNodes([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching predefined nodes:", error);
          setPredefinedNodes([]);
        });
    }
  }, [selectedNodeId]);

  const handleNodeSelect = (event) => {
    setSelectedNodeId(event.target.value);
  };

  const handleVerticalSelect = (event) => {
    setSelectedVertical(event.target.value);
    // Filter nodes by vertical
    const filtered = nodes.filter((node) => node.vertical_id === event.target.value);
    setFilteredNodes(filtered);
    setSelectedNodeId(filtered.length > 0 ? filtered[0].node_id : "");
  };

  const handleNavigate = (event) => {
    setSelectedMode(event.target.value);
    navigate(`/${event.target.value}`);
  };

  const handleStart = () => {
    if (selectedNodeId) {
      const node = predefinedNodes.find((node) => node.node_id === selectedNodeId);
      if (node) {
        const payload = [
          {
            node_id: node.node_id,
            frequency: node.frequency,
            parameters: node.parameters,
            platform: node.platform,
            protocol: node.protocol,
          },
        ];

        console.log("Data being sent to the server:", JSON.stringify(payload, null, 2));

        const accessToken = localStorage.getItem("access_token");

        fetch(`${config.backendAPI}/services/start`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Data sent successfully:", data);
          })
          .catch((error) => {
            console.error("Error sending data:", error);
          });
      }
    }
  };

  const handleStop = () => {
    if (selectedNodeId) {
      const payload = [
        {
          node_id: selectedNodeId,
        },
      ];

      console.log("Data being sent to the server:", JSON.stringify(payload, null, 2));

      const accessToken = localStorage.getItem("access_token");

      fetch(`${config.backendAPI}/services/stop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Data sent successfully:", data);
        })
        .catch((error) => {
          console.error("Error sending data:", error);
        });
    }
  };

  return (
    <Box sx={{ padding: 3, marginTop: 3 }}>
      <Grid container spacing={2} justifyContent="center" alignItems="left">
        <Grid item xs={12} md={8}>
          <Box sx={{ marginBottom: 3 }}>
            <Grid container spacing={1} justifyContent="flex-start">
              <Grid item xs={12} sm={4} sx={{ marginLeft: -23 }}>
                <TextField select label="Select Predefinedconfiguration" value={selectedMode} onChange={handleNavigate} fullWidth size="small" sx={{ margin: 3 }}>
                  <MenuItem value="Node-Simultor/Predefinedconfigurations">Single Predefinedconfigurations</MenuItem>
                  <MenuItem value="Node-Simultor/MultiPredefinedconfigurations">Multi Predefinedconfigurations</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={4}>
                <TextField select value={selectedVertical} onChange={handleVerticalSelect} fullWidth size="small" label="Select Vertical" sx={{ margin: 3 }}>
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

              <Grid item xs={4}>
                <TextField select value={selectedNodeId} onChange={handleNodeSelect} fullWidth size="small" label="Select Node ID" disabled={filteredNodes.length === 0} sx={{ margin: 3 }}>
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
            </Grid>
          </Box>
        </Grid>

        {/* Display predefined nodes in table format */}
        <Grid container spacing={2} marginTop={-7} marginLeft={-40}>
          {predefinedNodes
            .filter((node) => node.node_id === selectedNodeId)
            .map((node, index) => (
              <Grid item xs={12} key={index}>
                <TableContainer component={Paper} sx={{ maxWidth: 810, margin: "auto", marginBottom: 4 }}>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell>Node ID</TableCell>
                        <TableCell>Protocol</TableCell>
                        <TableCell>Platform</TableCell>
                        <TableCell>Frequency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{node.node_id}</TableCell>
                        <TableCell>{node.protocol}</TableCell>
                        <TableCell>{node.platform}</TableCell>
                        <TableCell>{node.frequency}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4}>
                          <TableContainer component={Paper} sx={{ maxHeight: 170, overflowY: "auto", marginTop: 2 }}>
                            <Table size="medium">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#ECEEF8", fontWeight: "bold", zIndex: 1 }}>Parameter</TableCell>
                                  <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#ECEEF8", fontWeight: "bold", zIndex: 1 }}>Min</TableCell>
                                  <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#ECEEF8", fontWeight: "bold", zIndex: 1 }}>Max</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {node.parameters.map((param, paramIndex) => (
                                  <TableRow key={paramIndex}>
                                    <TableCell>{param.name}</TableCell>
                                    <TableCell>{param.min}</TableCell>
                                    <TableCell>{param.max}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            ))}
        </Grid>

        {/* Start and Stop buttons */}
        <Grid container spacing={2} justifyContent="center" sx={{ marginTop: -8, marginLeft: -50 }}>
          <Grid item xs={12} md={7.75}>
            <Status sx={{ width: "100%" }} />
          </Grid>

          <Grid item sx={{ marginTop: 2.5, marginLeft: -9}}>
            <Button variant="contained" color="primary" onClick={handleStart}>
              Start
            </Button>
          </Grid>
          <Grid item sx={{ marginTop: 2.5}}>
            <Button variant="contained" color="secondary" onClick={handleStop}>
              Stop
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <div className="terminal-home-Predefined">
        <Terminal />
      </div>

      <Grid item xs={12} md={6} className="right-sidebar">
        <div className="right-sidebar">
          <div className="table-containerSS-live">
            <Node />
          </div>

          <Analytics />
        </div>
      </Grid>
    </Box>
  );
};

export default PredefinedConfigurations;