import React, { useState, useEffect } from 'react';

const StaticEventTable = () => {
  const [events, setEvents] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ accept: 0, reject: 0, pending: 0 });

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/services/events');
      const data = await response.json();

      console.log('Fetched data:', data);

      const parsedEvents = data.map(event => ({
        id: event.node_id, 
        status: event.status_code === 201 ? 'accept' : event.status_code === 400 ? 'reject' : 'pending',
        message: event.status_code,
        date: new Date().toLocaleDateString(), 
      }));

      setEvents(parsedEvents);

      const counts = parsedEvents.reduce((acc, event) => {
        if (event.status === 'accept') acc.accept += 1;
        else if (event.status === 'reject') acc.reject += 1;
        else acc.pending += 1; 
        return acc;
      }, { accept: 0, reject: 0, pending: 0 });

      console.log('Status Counts:', counts);

      setStatusCounts(counts);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div style={{ marginLeft: '20px' }}>
      <h1>Static Event Table</h1>
      <p>
        Accept: {statusCounts.accept} | Reject: {statusCounts.reject} | Pending: {statusCounts.pending}
      </p>
      <table style={{ marginLeft: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.id}>
              <td>{event.id}</td>
              <td>{event.status}</td>
              <td>{event.message}</td>
              <td>{event.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaticEventTable;
