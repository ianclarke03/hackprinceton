import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    const fetchStrategies = async () => {
      const response = await axios.get("/api/strategy");
      setStrategies(response.data);
    };
    fetchStrategies();
  }, []);

  return (
    <div>
      <h1>Investment Strategies</h1>
      {strategies.map((strategy) => (
        <div key={strategy._id}>
          <h2>{strategy.title}</h2>
          <p>{strategy.description}</p>
          <button>Learn More</button>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
