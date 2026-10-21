import { useState } from "react";
import { AppContext } from "./contextValue";

export function AppProvider({ children }) {
  const [video, setVideo] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);

  const [detections, setDetections] = useState([]);

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    videos: 0,
    disasters: 0,
    accuracy: 98,
    avgTime: 1.8,
  });

  const value = {
    video,
    setVideo,

    processedVideo,
    setProcessedVideo,

    detections,
    setDetections,

    loading,
    setLoading,

    stats,
    setStats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}