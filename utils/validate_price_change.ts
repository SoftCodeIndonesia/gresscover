export function handlePriceChange(value: string){
    // Hilangkan karakter selain angka (0-9)
    const numericValue = value != '' ? value.replace(/[^0-9]/g, '') : '0';
    return numericValue;
};