import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import config from "../config";

const StatisticsChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
  
      const response = await fetch(`${config.backendAPI}/simulations/analytic/statistics/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const data = await response.json();
      
      const transformedData = [
        {
          name: 'Total',
          Success: parseInt(data.total_success),
          Failure: parseInt(data.total_failure),
          Total: parseInt(data.total)
        },
        {
          name: 'CCSP',
          Success: parseInt(data.total_success_ccsp),
          Failure: parseInt(data.total_failure_ccsp),
          Total: parseInt(data.total_ccsp)
        },
        {
          name: 'OM2M',
          Success: parseInt(data.total_success_om2m),
          Failure: parseInt(data.total_failure_om2m),
          Total: parseInt(data.total_om2m)
        },
        {
          name: 'Mobius',
          Success: parseInt(data.total_success_mobius),
          Failure: parseInt(data.total_failure_mobius),
          Total: parseInt(data.total_mobius)
        }
      ];
      
      console.log('Transformed Data:', transformedData);
      setChartData(transformedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={{ width: '105%', height: '280px' }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 16,
            right: 30,
            left: -30,
            bottom: -2,
          }}
          barSize={20} // Reduced bar width
          barGap={0} // Minimal gap between bars within a group
          barCategoryGap={0} // Reduced gap between bar groups
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Success" fill="#82ca9d" />
          <Bar dataKey="Failure" fill="#ff8042" />
          <Bar dataKey="Total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatisticsChart;