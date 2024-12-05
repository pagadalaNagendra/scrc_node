import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Checkbox, TextField, FormGroup, FormControlLabel, Grid, Select, MenuItem, FormControl, InputLabel, Container, Box, Typography, Stepper, Step, StepLabel } from "@mui/material";
import { styled } from "@mui/system";
import config from "../config";
import Terminal from "../Terminal/Terminal";
import Status from "../Statustable/statustable";
import Analytics from "../statics/analytics";
import Node from "../statics/node";
const Section = styled(Box)({
  minWidth: "100%",
  padding: "20px",
  backgroundColor: "#f5f7fa",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
});

const CenteredContainer = styled(Container)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [vertical, setVertical] = useState("");
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [datatype, setDatatype] = useState("number");
  const [shortName, setShortName] = useState("");
  const [steps] = useState(["Domain", "Sensor Type", "Node"]);
  const [parameter, setParameter] = useState("");
  const [verticals, setVerticals] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState("https");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedParameter, setSelectedParameter] = useState([]);
  const [parameterInputs, setParameterInputs] = useState({});
  const [nodeId, setNodeId] = useState("");
  const [frequency, setFrequency] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [ccspFiles, setCcspFiles] = useState([null, null]);
  const [oneM2mCredentials, setOneM2mCredentials] = useState({ username: "", password: "" });
  const [ctopField, setCtopField] = useState("");
  const [url, setUrl] = useState("");
  const [port, setPort] = useState("");
  const [mobiusField1, setMobiusField1] = useState("");
  const [mobiusField2, setMobiusField2] = useState("");

  useEffect(() => {
    const fetchVerticals = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(`${config.backendAPI}/verticals/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setVerticals(data);
      } catch (error) {
        console.error("Error fetching verticals:", error);
      }
    };

    fetchVerticals();
  }, []);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitSection1 = async () => {
    const requestBody = {
      name: vertical,
      shortName: shortName,
    };

    console.log("Request Body:", requestBody);

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${config.backendAPI}/verticals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Successfully submitted Section 1:", data);
    } catch (error) {
      console.error("Error submitting Section 1:", error);
    }
  };

  const handleSubmitSection2 = async () => {
    const requestBody = {
      name: parameter,
      min_value: parseFloat(min),
      max_value: parseFloat(max),
      vertical_id: verticals.find((v) => v.name === vertical)?.id,
      data_type: datatype,
    };

    console.log("Request Body:", requestBody);

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${config.backendAPI}/parameters/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Successfully submitted Section 2:", data);
    } catch (error) {
      console.error("Error submitting Section 2:", error);
    }
  };

  const platforms = [{ name: "ccsp" }, { name: "oM2M" }, { name: "mobius" }];

  useEffect(() => {
    const fetchVerticals = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(`${config.backendAPI}/verticals/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setVerticals(response.data);
      } catch (error) {
        console.error("Error fetching verticals!", error);
      }
    };

    fetchVerticals();
  }, []);

  const handleVerticalChange = (e) => {
    const selectedVerticalName = e.target.value;
    setSelectedVertical(selectedVerticalName);

    const selectedVerticalObject = verticals.find((vertical) => vertical.name === selectedVerticalName);
    if (selectedVerticalObject) {
      const accessToken = localStorage.getItem("access_token");
      axios
        .get(`${config.backendAPI}/parameters/?vertical_id=${selectedVerticalObject.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setParameters(response.data);
          setSelectedParameter([]);
          setParameterInputs({});
        })
        .catch((error) => {
          console.error("Error fetching parameters!", error);
        });
    } else {
      setParameters([]);
    }
  };

  const handleParameterChange = (parameterId) => {
    setSelectedParameter((prev) => {
      if (prev.includes(parameterId)) {
        const newParams = prev.filter((id) => id !== parameterId);
        const newInputs = { ...parameterInputs };
        delete newInputs[parameterId];
        setParameterInputs(newInputs);
        return newParams;
      } else {
        return [...prev, parameterId];
      }
    });
  };

  const handleParameterInputChange = (parameterId, type) => (event) => {
    setParameterInputs((prev) => ({
      ...prev,
      [parameterId]: { ...prev[parameterId], [type]: event.target.value },
    }));
  };

  const handleCcspFileChange = (index) => (event) => {
    const files = [...ccspFiles];
    files[index] = event.target.files[0];
    setCcspFiles(files);
  };

  const handleOneM2mChange = (event) => {
    const { name, value } = event.target;
    setOneM2mCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const frequencyInSeconds = frequency.hours * 3600 + frequency.minutes * 60 + frequency.seconds;

    try {
      // Create base node data structure
      const baseNodeData = {
        node_id: nodeId,
        platform: selectedPlatform,
        protocol: selectedProtocol,
        frequency: frequencyInSeconds,
        services: "stop",
        vertical_id: verticals.find((v) => v.name === selectedVertical)?.id,
        parameter: selectedParameter.map((paramId) => ({
          name: parameters.find((p) => p.id === paramId).name,
          min_value: parseFloat(parameterInputs[paramId]?.min) || 0,
          max_value: parseFloat(parameterInputs[paramId]?.max) || 0,
        })),
        url: url,
      };

      let response;

      if (selectedPlatform === "ccsp") {
        // Handle CCSP platform submission
        const formData = new FormData();
        formData.append("node", JSON.stringify(baseNodeData));
        console.log(formData);
        formData.append("cert_file", ccspFiles[0]);
        formData.append("key_file", ccspFiles[1]);

        const accessToken = localStorage.getItem("access_token");
        response = await axios.post(`${config.backendAPI}/nodes/ccsp/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else if (selectedPlatform === "oM2M") {
        // Handle OneM2M platform submission
        const oneM2mNodeData = {
          ...baseNodeData,
          om2m_user: oneM2mCredentials.username,
          om2m_pass: oneM2mCredentials.password,
          url: url,
          port: parseInt(port),
        };

        const accessToken = localStorage.getItem("access_token");
        response = await axios.post(`${config.backendAPI}/nodes/`, oneM2mNodeData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else if (selectedPlatform === "mobius") {
        // Handle Mobius platform submission with the required format
        const mobiusNodeData = {
          parameter: baseNodeData.parameter,
          vertical_id: baseNodeData.vertical_id,
          platform: baseNodeData.platform,
          protocol: baseNodeData.protocol,
          frequency: baseNodeData.frequency,
          services: baseNodeData.services,
          node_id: baseNodeData.node_id,
          url: url,
          port: parseInt(port),
          mobius_origin: mobiusField1,
          mobius_ri: mobiusField2,
        };

        const accessToken = localStorage.getItem("access_token");
        response = await axios.post(`${config.backendAPI}/nodes/`, mobiusNodeData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      // Handle successful response
      if (response?.status === 201 || response?.status === 200) {
        alert(`${selectedPlatform.toUpperCase()} node created successfully!`);

        // Reset all form fields
        setNodeId("");
        setSelectedVertical("");
        setSelectedProtocol("https");
        setSelectedPlatform("");
        setSelectedParameter([]);
        setParameterInputs({});
        setFrequency({ hours: 0, minutes: 0, seconds: 0 });
        setCcspFiles([null, null]);
        setOneM2mCredentials({ username: "", password: "" });
        setCtopField("");
        setUrl("");
        setPort("");
        setMobiusField1("");
        setMobiusField2("");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.detail || error.message;
      alert(`Submission failed: ${errorMessage}`);
    }
  };

  const handleChange = (key) => (e) => {
    let value = parseInt(e.target.value) || 0; // Default to 0 if empty or invalid

    // Ensure valid ranges for hours, minutes, and seconds
    if (key === "hours" && value > 23) value = 23;
    if ((key === "minutes" || key === "seconds") && value > 59) value = 59;

    setFrequency((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <CenteredContainer sx={{ marginTop: "60px", marginLeft: "-90px" }}>
      <Box width="60%">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box width="100%" mt={4}>
          {/* Section 1 */}
          {activeStep === 0 && (
            <Section>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Add New Domain
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Domain Name"
                    fullWidth
                    margin="normal"
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px", // Set uniform height
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "14px", // Adjust label size
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Domain Short Name"
                    fullWidth
                    margin="normal"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px", // Set uniform height
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "14px", // Adjust label size
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="contained" color="secondary" onClick={handleSubmitSection1}>
                  Submit
                </Button>
                <Button variant="contained" color="primary" onClick={handleNext}>
                  Next
                </Button>
              </Box>
            </Section>
          )}

          {/* Section 2 */}
          {activeStep === 1 && (
            <Section>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Sensor Type
              </Typography>

              {/* First Row: Vertical, Parameter, and Data Type */}
              <Box display="flex" gap={2} mb={2}>
                <Grid container spacing={2}>
                  {/* Vertical Name Selection */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="vertical-select-label"
                        sx={{
                          fontSize: "14px", // Adjust font size
                          top: "-6px", // Align label with input field
                        }}
                      >
                        Vertical Name
                      </InputLabel>
                      <Select
                        labelId="vertical-select-label"
                        value={vertical}
                        onChange={(e) => setVertical(e.target.value)}
                        sx={{
                          height: "40px", // Decreased height for the dropdown
                          "& .MuiSelect-select": {
                            padding: "6px 12px", // Adjust padding for smaller height
                          },
                          "& .MuiOutlinedInput-root": {
                            height: "30px", // Matching height for the input
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {verticals.map((v) => (
                          <MenuItem key={v.id} value={v.name}>
                            {v.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Parameter Input */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Parameter"
                      fullWidth
                      value={parameter}
                      onChange={(e) => setParameter(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: "40px", // Set uniform height
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "14px", // Adjust label size
                        },
                      }}
                    />
                  </Grid>

                  {/* Data Type Selection */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="datatype-select-label"
                        sx={{
                          fontSize: "14px", // Slightly smaller font size for a compact look
                          transform: "translate(12px, 14px) scale(1)", // Initial position of the label
                          "&.Mui-focused, &.MuiInputLabel-shrink": {
                            transform: "translate(12px, -4px) scale(0.85)", // Label shrinks when focused
                          },
                        }}
                      >
                        Data Type Name
                      </InputLabel>
                      <Select
                        labelId="datatype-select-label"
                        value={datatype}
                        onChange={(e) => setDatatype(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "40px", // Slightly more height
                            padding: "0 12px", // Adjust padding inside the field
                          },
                          "& .MuiSelect-select": {
                            padding: "8px 10px", // Adjust padding for dropdown options
                          },
                        }}
                      >
                        <MenuItem value="string" sx={{ fontSize: "14px", padding: "8px 12px" }}>
                          String
                        </MenuItem>
                        <MenuItem value="number" sx={{ fontSize: "14px", padding: "8px 12px" }}>
                          Number
                        </MenuItem>
                        <MenuItem value="boolean" sx={{ fontSize: "14px", padding: "8px 12px" }}>
                          Boolean
                        </MenuItem>
                        <MenuItem value="date" sx={{ fontSize: "14px", padding: "8px 12px" }}>
                          Date
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Second Row: Max and Min */}
              <Box display="flex" gap={2} mb={2}>
                {/* Max Input Field */}
                <TextField
                  label="Max"
                  type="number"
                  fullWidth
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px", // Set uniform height
                      "& input": {
                        padding: "10px 12px", // Adjust padding inside the field
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "14px", // Compact label font size
                    },
                  }}
                />

                {/* Min Input Field */}
                <TextField
                  label="Min"
                  type="number"
                  fullWidth
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px", // Set uniform height
                      "& input": {
                        padding: "10px 12px", // Adjust padding inside the field
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "14px", // Compact label font size
                    },
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="contained" color="secondary" onClick={handleSubmitSection2}>
                  Submit
                </Button>
                <Box>
                  <Button variant="outlined" color="primary" onClick={handleBack} style={{ marginRight: "8px" }}>
                    Back
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleNext}>
                    Next
                  </Button>
                </Box>
              </Box>
            </Section>
          )}

          {/* Section 3 */}
          {activeStep === 2 && (
            <Section sx={{ marginTop: "-25px" }}>
              <Typography variant="h4"></Typography>
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap={1} sx={{ padding: 1 }}>
                  {/* First Row: Vertical Name, Node ID, and Protocol */}
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel
                          sx={{
                            fontSize: "14px", // Compact font size
                            top: "-6px", // Align with input field
                            left: "12px",
                          }}
                        ></InputLabel>
                        <Select
                          value={selectedVertical}
                          onChange={handleVerticalChange}
                          displayEmpty
                          sx={{
                            height: "40px",
                            "& .MuiSelect-select": {
                              padding: "10px 12px", // Proper padding
                            },
                            "&:focus .MuiInputLabel-root": {
                              transform: "translate(14px, -6px) scale(0.75)", // Shrink label
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>Select Vertical</em>
                          </MenuItem>
                          {verticals.map((vertical) => (
                            <MenuItem key={vertical.id} value={vertical.name}>
                              {vertical.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField label="Node ID" value={nodeId} onChange={(e) => setNodeId(e.target.value.toUpperCase())} fullWidth size="small" sx={{ margin: 0 }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField select label="Protocol" value={selectedProtocol} onChange={(e) => setSelectedProtocol(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}>
                        <MenuItem value="">
                          <p>Select Protocol</p>
                        </MenuItem>
                        {["https", "mqtt", "tcp"].map((protocol) => (
                          <MenuItem key={protocol} value={protocol}>
                            {protocol}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  {/* Second Row: Platform, URL, and Port */}
                  <Grid container spacing={2} mb={0}>
                    <Grid item xs={12} sm={4}>
                      <TextField select label="Platform" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}>
                        <MenuItem value="">
                          <em>Select Platform</em>
                        </MenuItem>
                        {platforms.map((platform) => (
                          <MenuItem key={platform.name} value={platform.name}>
                            {platform.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField label="URL" value={url} onChange={(e) => setUrl(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField label="PORT" value={port} onChange={(e) => setPort(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />
                    </Grid>
                  </Grid>

                  {/* Frequency Input (if needed) */}
                  <Box display="flex" gap={1}>
                    <TextField
                      type="number"
                      value={frequency.hours || ""}
                      onChange={handleChange("hours")}
                      className="time-input"
                      inputProps={{ min: 0, max: 23 }}
                      size="small"
                      sx={{ margin: 0, width: "33%" }}
                      placeholder="HH"
                    />
                    <TextField
                      type="number"
                      value={frequency.minutes || ""}
                      onChange={handleChange("minutes")}
                      className="time-input"
                      inputProps={{ min: 0, max: 59 }}
                      size="small"
                      sx={{ margin: 0, width: "33%" }}
                      placeholder="MM"
                    />
                    <TextField
                      type="number"
                      value={frequency.seconds || ""}
                      onChange={handleChange("seconds")}
                      className="time-input"
                      inputProps={{ min: 0, max: 59 }}
                      size="small"
                      sx={{ margin: 0, width: "33%" }}
                      placeholder="SS"
                    />
                  </Box>

                  {/* Parameters Section */}
                  {parameters.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <label>Parameters:</label>
                      <Box
                        sx={{
                          maxHeight: "92px",
                          overflowY: "auto",
                          border: "1px solid #ccc",
                          padding: 2,
                        }}
                      >
                        {parameters.map((parameter) => (
                          <Box key={parameter.id} sx={{ mb: 1, display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                              control={<Checkbox checked={selectedParameter.includes(parameter.id)} onChange={() => handleParameterChange(parameter.id)} />}
                              label={parameter.name}
                              sx={{ width: "150px" }}
                            />
                            {selectedParameter.includes(parameter.id) && (
                              <>
                                <TextField
                                  type="number"
                                  placeholder="Min Value"
                                  value={parameterInputs[parameter.id]?.min || ""}
                                  onChange={handleParameterInputChange(parameter.id, "min")}
                                  sx={{ width: "120px", mx: 1, margin: 0 }}
                                  size="small"
                                />
                                <TextField
                                  type="number"
                                  placeholder="Max Value"
                                  value={parameterInputs[parameter.id]?.max || ""}
                                  onChange={handleParameterInputChange(parameter.id, "max")}
                                  sx={{ width: "120px", margin: 0 }}
                                  size="small"
                                />
                              </>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Conditional File Inputs */}
                  {selectedPlatform === "ccsp" && (
                    <Box>
                      <Typography variant="h6">CCSP Files:</Typography>
                      <Box display="flex" gap={1}>
                        <input type="file" onChange={handleCcspFileChange(0)} />
                        <input type="file" onChange={handleCcspFileChange(1)} />
                      </Box>
                    </Box>
                  )}

                  {selectedPlatform === "oM2M" && (
                    <Box>
                      <Typography variant="h6">oM2M Credentials:</Typography>
                      <Box display="flex" gap={1}>
                        <TextField label="Username" name="username" value={oneM2mCredentials.username} onChange={handleOneM2mChange} fullWidth size="small" sx={{ margin: 0 }} />
                        <TextField type="password" label="Password" name="password" value={oneM2mCredentials.password} onChange={handleOneM2mChange} fullWidth size="small" sx={{ margin: 0 }} />
                      </Box>
                    </Box>
                  )}

                  {selectedPlatform === "mobius" && (
                    <Box display="flex" gap={2} mt={2}>
                      <TextField label="mobius_origin" value={mobiusField1} onChange={(e) => setMobiusField1(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />
                      <TextField label="mobius_ri" value={mobiusField2} onChange={(e) => setMobiusField2(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />
                    </Box>
                  )}

                  {/* Button alignment */}
                  <Box display="flex" justifyContent="space-between" width="100%" mt={0}>
                    <Button variant="contained" color="secondary" type="submit">
                      Submit
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleBack}>
                      Back
                    </Button>
                  </Box>
                </Box>
              </form>
            </Section>
          )}
          {/* <div className="terminal-home-code-codeeet">
            <Terminal />
          </div> */}
        </Box>
        <Box item xs={12} md={6} className="right-sidebar">
          <div className="right-sidebar">
            <div className="table-containerSS-live">
              <Node />
            </div>
            <Analytics />
          </div>
        </Box>
      </Box>
    </CenteredContainer>
  );
};

export default App;
