import React, { useState, useEffect } from "react";
import { Grid, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Card, CardContent, Typography, MenuItem, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Terminal from "../Terminal/Terminal";
import Status from "../Statustable/statustable";
import Analytics from "../statics/analytics";
import Node from "../statics/node";
import "./Predefinedconfigurations.css";
import config from "../config";
const MultiplePredefinedConfigurations = () => {
  const [predefinedConfigurations, setPredefinedConfigurations] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [filteredConfigurations, setFilteredConfigurations] = useState([]);
  const [selectedMode, setSelectedMode] = useState("MultiPredefinedconfigurations");
  const navigate = useNavigate();

  // Fetch predefined configurations
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    fetch(`${config.backendAPI}/config/predefined/multiple`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched predefined configurations:", data); // Debugging line
        if (Array.isArray(data)) {
          setPredefinedConfigurations(data);

          // Automatically select the first ID if data is available

          if (data.length > 0) {
            const firstId = data[0].id;

            setSelectedConfigId(firstId);

            const filtered = data.filter((config) => config.id === firstId);

            setFilteredConfigurations(filtered);
          }
        } else {
          setPredefinedConfigurations([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching predefined configurations:", error);
        setPredefinedConfigurations([]);
      });
  }, []);

  const handleConfigSelect = (event) => {
    const selectedId = event.target.value;
    setSelectedConfigId(selectedId);
    const filtered = predefinedConfigurations.filter((config) => config.id === selectedId);
    setFilteredConfigurations(filtered);
  };

  const handleModeSelect = (event) => {
    const selectedMode = event.target.value;
    setSelectedMode(selectedMode);
    navigate(`/Node-Simultor/${selectedMode}`);
  };

  const handleStart = () => {
    const payload = filteredConfigurations
      .flatMap((config) => config.configuration)
      .map((node) => ({
        node_id: node.node_id,
        frequency: node.frequency,
        parameters: node.parameters,
        platform: node.platform,
        protocol: node.protocol,
      }));

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
  };

  const handleStop = () => {
    const payload = filteredConfigurations
      .flatMap((config) => config.configuration)
      .map((node) => ({
        node_id: node.node_id,
      }));

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
  };

  return (
    <Box sx={{ padding: 3, marginTop: 5 }}>
      <Grid container spacing={1} justifyContent="center" alignItems="left">
        <Grid item xs={12} md={8}>
          <Box sx={{ marginBottom: 3 }}>
            <Grid container spacing={1} justifyContent="flex-start">
              <Grid item xs={12} sm={4} sx={{ marginLeft: -27 }}>
                <TextField select label="Select Mode" value={selectedMode} onChange={handleModeSelect} fullWidth size="small" sx={{ margin: 3 }}>
                  <MenuItem value="Predefinedconfigurations">Single Predefinedconfigurations</MenuItem>
                  <MenuItem value="MultiPredefinedconfigurations">Multi Predefinedconfigurations</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ marginLeft: 2 }}>
                <TextField select label="Select Configuration ID" value={selectedConfigId} onChange={handleConfigSelect} fullWidth size="small" sx={{ margin: 3 }}>
                  <MenuItem value="">
                    <em>Select Configuration ID</em>
                  </MenuItem>
                  {predefinedConfigurations.map((config, index) => (
                    <MenuItem key={config.id} value={config.id}>
                      {`Set ${index + 1}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid container spacing={0} sx={{ marginLeft: 8, marginTop: -5, overflowX: "hidden" }}>
          <Box
            sx={{
              maxHeight: 300,
              overflowY: "scroll",
              paddingRight: "16px",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              "-ms-overflow-style": "none",
            }}
          >
            <Grid container spacing={2}>
              {filteredConfigurations
                .flatMap((config) => config.configuration)
                .map((node, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    {/* Adjust grid size for 3 cards per row */}
                    <Card sx={{ maxWidth: "95%", margin: 0, marginBottom: 2 }}>
                      <CardContent>
                        <Typography variant="h6" component="div" sx={{ marginBottom: 0.5 }}>
                          Node ID: {node.node_id}
                        </Typography>
                        <TableContainer component={Paper} sx={{ marginTop: 0.5 }}>
                          <Table size="medium">
                            <TableHead>
                              <TableRow>
                                <TableCell>Protocol</TableCell>
                                <TableCell>Platform</TableCell>
                                <TableCell>Frequency</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{node.protocol}</TableCell>
                                <TableCell>{node.platform}</TableCell>
                                <TableCell>{node.frequency}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3}>
                                  <TableContainer
                                    component={Paper}
                                    sx={{
                                      maxHeight: 110,
                                      overflowY: "auto",
                                      marginTop: 0.5,
                                      "&::-webkit-scrollbar": { display: "none" },
                                      "-ms-overflow-style": "none",
                                      "scrollbar-width": "none",
                                    }}
                                  >
                                    <Table size="medium">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell
                                            sx={{
                                              position: "sticky",
                                              top: 0,
                                              backgroundColor: "#ECEEF8",
                                              fontWeight: "bold",
                                              zIndex: 1,
                                            }}
                                          >
                                            Parameter
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              position: "sticky",
                                              top: 0,
                                              backgroundColor: "#ECEEF8",
                                              fontWeight: "bold",
                                              zIndex: 1,
                                            }}
                                          >
                                            Min
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              position: "sticky",
                                              top: 0,
                                              backgroundColor: "#ECEEF8",
                                              fontWeight: "bold",
                                              zIndex: 1,
                                            }}
                                          >
                                            Max
                                          </TableCell>
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
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Grid>

        {/* Start and Stop buttons */}
        <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 1, marginLeft: -60 }}>
          <Grid item xs={12} md={7.75}>
            <Status sx={{ width: "100%" }} />
          </Grid>

          <Grid item sx={{ marginTop: 2, marginLeft: -9 }}>
            <Button variant="contained" color="primary" onClick={handleStart}>
              Start
            </Button>
          </Grid>
          <Grid item sx={{ marginTop: 2 }}>
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

export default MultiplePredefinedConfigurations;
