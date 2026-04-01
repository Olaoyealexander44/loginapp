import callApi from '../Lib_storage/axios';

export const loginUser = async (data:
     { username: string;
     password: string }) => {
  const response = await callApi.post('/auth/login', data); 
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await callApi.get('/auth/me');
  return response.data;
};

