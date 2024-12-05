import React, { useEffect, useState } from 'react';
import config from "../config";
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch(`${config.backendAPI}/alerts/`)
      .then(response => response.json())
      .then(data => {
        setAlerts(data); 
      })
      .catch(err => {
        console.error('Failed to fetch data', err);
      });
  }, []);

  return (
    <div>
      <h1>Alerts</h1>
      <p>Total number of records: {alerts.length}</p>
    </div>
  );
};

export default Alerts;
