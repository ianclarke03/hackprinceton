import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StrategyDetail = () => {
  const { id } = useParams();
  const [strategy, setStrategy] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchStrategy = async () => {
      const response = await axios.get(`/api/strategy/${id}`);
      setStrategy(response.data);

      const videoResponse = await axios.get(`/api/strategy/${id}/videos`);
      setVideos(videoResponse.data);
    };
    fetchStrategy();
  }, [id]);

  return (
    <div>
      {strategy && (
        <>
          <h1>{strategy.title}</h1>
          <p>{strategy.description}</p>
          <h2>Related Videos</h2>
          {videos.map((video, index) => (
            <div key={index}>
              <a href={video.url} target="_blank" rel="noopener noreferrer">{video.title}</a>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default StrategyDetail;
