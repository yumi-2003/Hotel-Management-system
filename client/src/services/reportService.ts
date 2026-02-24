import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const downloadRevenueExcel = async (year: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/reports/revenue/excel?year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Revenue_Report_${year}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadRevenuePDF = async (year: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/reports/revenue/pdf?year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Revenue_Report_${year}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
