import { useState, useEffect } from "react";
export default useApi = (apiFunc) => {
  const [data, setData] = useState();
  const [error, setError] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (...args) => {
    setLoading(true);
    const response = await apiFunc(...args);      
    setLoading(false);   

    setError(!response.ok);
    setData(response.data);
    return response;
  };

  return {
    loadData,
    data,
    error,
    loading,            
  };
};
