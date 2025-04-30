// api/listingService.js
import axios from './axiosConfig';

export const fetchListings = async (params = {}) => {
  const response = await axios.get('/listings', { params });
  return response.data;
};

export const fetchListingById = async (id) => {
  const response = await axios.get(`/listings/${id}`);
  return response.data;
};

export const createListing = async (listingData) => {
  const response = await axios.post('/listings', listingData);
  return response.data;
};

export const updateListing = async (id, listingData) => {
  const response = await axios.put(`/listings/${id}`, listingData);
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await axios.delete(`/listings/${id}`);
  return response.data;
};

export const toggleFavorite = async (id) => {
  const response = await axios.post(`/listings/${id}/favorite`);
  return response.data;
};

export const contactSeller = async (id, messageData) => {
  const response = await axios.post(`/listings/${id}/contact`, messageData);
  return response.data;
};

export const reportListing = async (id, reportData) => {
  const response = await axios.post(`/listings/${id}/report`, reportData);
  return response.data;
};

export const uploadImages = async (id, formData) => {
  const response = await axios.post(`/listings/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
