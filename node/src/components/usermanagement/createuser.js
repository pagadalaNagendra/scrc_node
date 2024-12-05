import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import config from "../config";
function CreateUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [platformAccess, setPlatformAccess] = useState({
    ccsp: false,
    om2m: false,
    mobius: false,
  });

  const [verticals, setVerticals] = useState([]);
  const [selectedVerticals, setSelectedVerticals] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUserType, setFilterUserType] = useState("");
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const usersPerPage = 3;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerticals = async () => {
      const accessToken = localStorage.getItem("access_token");
      try {
        const response = await axios.get(`${config.backendAPI}/verticals/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setVerticals(response.data);
      } catch (error) {
        console.error("Error fetching verticals:", error);
      }
    };

    fetchVerticals();
  }, []);

  const handlePlatformAccessChange = (event) => {
    setPlatformAccess({
      ...platformAccess,
      [event.target.name]: event.target.checked,
    });
  };

  const handleVerticalChange = (event) => {
    const verticalId = event.target.name; // Get the ID of the checkbox
    setSelectedVerticals(
      (prevSelected) =>
        event.target.checked
          ? [...prevSelected, verticalId] // Add the ID if checked
          : prevSelected.filter((id) => id !== verticalId) // Remove the ID if unchecked
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !userType || !selectedVerticals.length) {
      setError("All fields are required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const postData = {
      username,
      email,
      password,
      user_type: userType,
      platform_access: userType.toLowerCase() === "user" ? Object.keys(platformAccess).filter((key) => platformAccess[key]) : [],
      verticals: selectedVerticals,
    };

    console.log("Posting data:", postData);

    try {
      const response = await axios.post(
        `${config.backendAPI}/users/create-user`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setSuccess(response.data.message);
      setUsername("");
      setEmail("");
      setPassword("");
      setUserType("");
      setPlatformAccess({
        ccsp: false,
        om2m: false,
        mobius: false,
      });
      setSelectedVerticals([]);
    } catch (error) {
      setError(error.response?.data?.detail || "An error occurred during user creation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGetUsers = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.get(`${config.backendAPI}/users/getusers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setUsers(response.data);
      setShowUserDetails(true);
    } catch (error) {
      setError(error.response?.data?.detail || "An error occurred while fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserDetails = () => {
    if (showUserDetails) {
      setShowUserDetails(false);
    } else {
      handleGetUsers();
    }
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 1:
        return "Admin";
      case 2:
        return "User";
      case 3:
        return "Guest";
      default:
        return "unknown";
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * usersPerPage < users.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on new search
  };

  const handleFilterUserTypeChange = (e) => {
    setFilterUserType(e.target.value);
    setCurrentPage(0); // Reset to first page on new filter
  };

  const handleDeleteUser = async (username, email) => {
    setLoading(true);
    try {
      await axios.delete(`${config.backendAPI}/users/delete-user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        data: { username, email },
      });

      setSuccess("User deleted successfully.");
      setUsers(users.filter((user) => user.username !== username && user.email !== email));
    } catch (error) {
      setError(error.response?.data?.detail || "An error occurred while deleting the user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditMode(true);
    setEditUserId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setUserType(user.user_type.toString());
    setPlatformAccess({
      ccsp: user.platform_access.includes("ccsp"),
      om2m: user.platform_access.includes("om2m"),
      mobius: user.platform_access.includes("mobius"),
    });
    // setSelectedVerticals(user.verticals);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!username || !email || !userType) {
      setError("All fields are required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.put(
        `${config.backendAPI}/users/platforms`,
        {
          id: editUserId,
          username,
          email,
          role: userType,
          platform_access: userType.toLowerCase() === "user" ? Object.keys(platformAccess).filter((key) => platformAccess[key]) : [],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setSuccess(response.data.message);
      setEditMode(false);
      setEditUserId(null);
      setUsername("");
      setEmail("");
      setPassword("");
      setUserType("");
      setPlatformAccess({
        ccsp: false,
        om2m: false,
        mobius: false,
      });
      // setSelectedVerticals([]);
      handleGetUsers();
    } catch (error) {
      setError(error.response?.data?.detail || "An error occurred during user update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.username.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())) && (filterUserType === "" || user.user_type === filterUserType)
  );

  const displayedUsers = filteredUsers.slice(currentPage * usersPerPage, (currentPage + 1) * usersPerPage);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#ECEEF8",
        overflow: "hidden",
      }}
    >
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 2,
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 3,
            width: "100%",
            maxHeight: "85vh",
            maxWidth: "800px",
            marginTop: "60px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
              paddingRight: "17px",
              boxSizing: "content-box",
              "&::-webkit-scrollbar": {
                width: "0px",
              },
              "-ms-overflow-style": "none",
              "scrollbar-width": "none",
            }}
          >
            <Typography variant="h5" gutterBottom align="center">
              {editMode ? "Edit User" : "Create User"}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%", marginBottom: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ width: "100%", marginBottom: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={editMode ? handleUpdateUser : handleSubmit} style={{ width: "100%" }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Username" variant="outlined" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} margin="dense" size="small" />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Email" variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} margin="dense" size="small" />
                </Grid>
                {!editMode && (
                  <Grid item xs={6}>
                    <TextField label="Password" variant="outlined" fullWidth type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="dense" size="small" />
                  </Grid>
                )}
                <Grid item xs={6}>
                  <FormControl fullWidth margin="dense" size="small">
                    <InputLabel>Role</InputLabel>
                    <Select value={userType} onChange={(e) => setUserType(e.target.value)} label="User Type">
                      <MenuItem value="guest">Guest</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {userType.toLowerCase() === "user" && (
                <Grid item xs={12}>
                  <FormControl component="fieldset" margin="dense" size="small">
                    <FormLabel component="legend">Verticals</FormLabel>
                    <FormGroup>
                      <Grid container spacing={2}>
                        {verticals.map((vertical) => (
                          <Grid item key={vertical.id}>
                            <FormControlLabel
                              control={<Checkbox checked={selectedVerticals.includes(vertical.id.toString())} onChange={handleVerticalChange} name={vertical.id.toString()} />}
                              label={vertical.name}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </FormGroup>
                  </FormControl>
                </Grid>
              )}

              {userType.toLowerCase() === "user" && (
                <FormControl component="fieldset" margin="dense" size="small">
                  <FormLabel component="legend">Platform Access</FormLabel>
                  <FormGroup>
                    <Grid container spacing={2}>
                      <Grid item>
                        <FormControlLabel control={<Checkbox checked={platformAccess.ccsp} onChange={handlePlatformAccessChange} name="ccsp" />} label="CCSP" />
                      </Grid>
                      <Grid item>
                        <FormControlLabel control={<Checkbox checked={platformAccess.om2m} onChange={handlePlatformAccessChange} name="om2m" />} label="oM2M" />
                      </Grid>
                      <Grid item>
                        <FormControlLabel control={<Checkbox checked={platformAccess.mobius} onChange={handlePlatformAccessChange} name="mobius" />} label="Mobius" />
                      </Grid>
                    </Grid>
                  </FormGroup>
                </FormControl>
              )}

              <Grid container spacing={2} sx={{ marginTop: 2 }} justifyContent="space-between">
                <Grid item xs={3}>
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ height: 40 }}>
                    {loading ? (editMode ? "Updating User..." : "Creating User...") : editMode ? "Update User" : "Create User"}
                  </Button>
                </Grid>

                <Grid item xs={4}>
                  <Button variant="contained" color="primary" sx={{ height: 40 }} fullWidth onClick={handleToggleUserDetails} disabled={loading}>
                    {showUserDetails ? "Hide Existing Users" : "View Existing Users"}
                  </Button>
                </Grid>
              </Grid>
            </form>

            {showUserDetails && (
              <Box sx={{ width: "100%", marginTop: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField label="Search by Username or Email" variant="outlined" fullWidth value={searchQuery} onChange={handleSearchChange} margin="dense" size="small" />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel>Filter by Role</InputLabel>
                      <Select value={filterUserType} onChange={handleFilterUserTypeChange} label="Filter by Role">
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value={1}>Admin</MenuItem>
                        <MenuItem value={2}>User</MenuItem>
                        <MenuItem value={3}>Guest</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getUserTypeLabel(user.user_type)}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleEditUser(user)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteUser(user.username, user.email)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <Button variant="contained" onClick={handlePreviousPage} disabled={currentPage === 0}>
                    Previous
                  </Button>
                  <Button variant="contained" onClick={handleNextPage} disabled={(currentPage + 1) * usersPerPage >= filteredUsers.length}>
                    Next
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default CreateUser;
