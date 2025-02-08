// utils/formatRupiah.js

export const formatRupiah = (value: number) => {
    if (!value) return '';
    const number = Number(value);
    if (isNaN(number)) return '';
    
    return number.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0, // Menghilangkan desimal jika bulat
      maximumFractionDigits: 0, // Menghilangkan desimal jika bulat
    });
  };
  