import React, { useEffect, useState } from 'react';
import './App.css';
import config from "../config";
function App() {
  const [data, setData] = useState('');

    useEffect(() => {
        const eventSource = new EventSource(`${config.backendAPI}/services/events`);

        eventSource.onmessage = (event) => {
            setData((prevData) => prevData + event.data + '\n');
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div>
            <h1>Streaming Data</h1>
            <pre>{data}</pre>
        </div>
    );
}

export default App;
