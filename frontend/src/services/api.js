import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadVideo = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload-video", formData, {
    onUploadProgress,
  });

  return response.data;
};

export const mediaUrl = (path) => new URL(path, API_BASE_URL).toString();

export default api;