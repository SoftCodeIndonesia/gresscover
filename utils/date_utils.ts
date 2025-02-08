export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };
    return date.toLocaleDateString('id-ID', options);
};
export const toFormatLaravel = (dateString: string) => {
    // Buat Date object dari string ISO
    const date = new Date(dateString);

    // Format tanggal sesuai kebutuhan
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.00`;
    return formattedDate;
}

export const getStartAndEndOfMonth = () => {
    const now = new Date(); // Tanggal sekarang
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Tanggal 1 bulan ini
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Tanggal terakhir bulan ini
  
    
    return {
      startOfMonth: toFormatLaravel(startOfMonth.toDateString()),
      endOfMonth: toFormatLaravel(endOfMonth.toDateString()),
    };
  };
