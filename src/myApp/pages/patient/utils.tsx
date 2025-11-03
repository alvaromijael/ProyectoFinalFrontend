import dayjs from 'dayjs';
 
export const calculateAge = (birthDate: string) => {
  const today = dayjs();
  const birth = dayjs(birthDate);
  
  let years = today.diff(birth, 'year');
  
  const afterYears = birth.add(years, 'year');
  let months = today.diff(afterYears, 'month');
  
  const afterMonths = afterYears.add(months, 'month');
  let days = today.diff(afterMonths, 'day');
  
  let ageText = '';
  
  if (years < 2) {
    if (years === 0 && months === 0) {
      ageText = `${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (years === 0) {
      ageText = `${months} ${months === 1 ? 'mes' : 'meses'}`;
      if (days > 0) {
        ageText += ` y ${days} ${days === 1 ? 'día' : 'días'}`;
      }
    } else {
      ageText = `${years} año`;
      if (months > 0) {
        ageText += `, ${months} ${months === 1 ? 'mes' : 'meses'}`;
      }
      if (days > 0) {
        ageText += ` y ${days} ${days === 1 ? 'día' : 'días'}`;
      }
    }
  } else {
    if (months === 0) {
      ageText = `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      ageText = `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
  }
  
  return ageText;
};