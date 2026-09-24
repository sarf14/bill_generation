import { numberToWords } from './numberToWords';

describe('numberToWords util', () => {
  it('converts small numbers correctly', () => {
    expect(numberToWords(0)).toBe('Zero');
    expect(numberToWords(5)).toBe('Five');
    expect(numberToWords(15)).toBe('Fifteen');
    expect(numberToWords(24)).toBe('Twenty Four');
  });

  it('converts hundreds correctly', () => {
    expect(numberToWords(100)).toBe('One Hundred');
    expect(numberToWords(550)).toBe('Five Hundred and Fifty');
    expect(numberToWords(999)).toBe('Nine Hundred and Ninety Nine');
  });

  it('converts thousands correctly', () => {
    expect(numberToWords(1000)).toBe('One Thousand');
    expect(numberToWords(5000)).toBe('Five Thousand');
    expect(numberToWords(15000)).toBe('Fifteen Thousand');
    expect(numberToWords(99999)).toBe('Ninety Nine Thousand Nine Hundred and Ninety Nine');
  });

  it('converts lakhs correctly (Indian numbering system)', () => {
    expect(numberToWords(100000)).toBe('One Lakh');
    expect(numberToWords(150000)).toBe('One Lakh Fifty Thousand');
    expect(numberToWords(9999999)).toBe('Ninety Nine Lakh Ninety Nine Thousand Nine Hundred and Ninety Nine');
  });

  it('converts crores correctly (Indian numbering system)', () => {
    expect(numberToWords(10000000)).toBe('One Crore');
    expect(numberToWords(15000000)).toBe('One Crore Fifty Lakh');
  });
});
