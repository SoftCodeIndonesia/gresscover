export function validateDecimal(input: string) {
  // Hapus karakter yang tidak valid
  let formattedValue = input.replace(/[^0-9.]/g, '');

  // Pastikan hanya satu koma
  const decimalParts = formattedValue.split(',');
  if (decimalParts.length > 2) {
    formattedValue = decimalParts[0] + '.' + decimalParts.slice(1).join('');
  }

  // Batasi digit di belakang koma
  if (decimalParts.length > 1) {
    formattedValue = decimalParts[0] + '.' + decimalParts[1].slice(0, 2);
  }
  
  return formattedValue;
}