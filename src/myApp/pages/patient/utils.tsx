import dayjs from 'dayjs';
 
 export const calculateAge = (birthDate: string) => {
    const today = dayjs();
    const birth = dayjs(birthDate);
    let years = today.diff(birth, 'year');
    const monthsDiff = today.diff(birth.add(years, 'year'), 'month');
    let ageText = '';
    if (years === 0) {
      ageText = `${monthsDiff} ${monthsDiff === 1 ? 'mes' : 'meses'}`;
    } else if (monthsDiff === 0) {
      ageText = `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      ageText = `${years} ${years === 1 ? 'año' : 'años'} y ${monthsDiff} ${monthsDiff === 1 ? 'mes' : 'meses'}`;
    }
      return ageText;
  };