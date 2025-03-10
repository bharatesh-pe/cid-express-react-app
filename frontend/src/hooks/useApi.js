// src/hooks/useApi.js
import { useState, useEffect } from 'react';
import api from '../services/api'; // Import the API service

const useApi = (endpoint, method = 'GET', requestData = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        // Handle the API request based on method (GET, POST, PUT, DELETE)
        if (method === 'GET') {
          response = await api.get(endpoint);
        } else if (method === 'POST') {
          response = await api.post(endpoint, requestData);
        } else if (method === 'PUT') {
          response = await api.put(endpoint, requestData);
        } else if (method === 'DELETE') {
          response = await api.del(endpoint);
        }
        setData(response);
      } catch (err) {
        setError(err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, method, requestData]); // Re-run when endpoint, method, or requestData changes

  return { data, loading, error };
};

export default useApi;
