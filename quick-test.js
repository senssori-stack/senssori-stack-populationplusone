// Quick test to verify Hannibal data
const URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSr5fO3fDsaOjLYrZ1uTf7DL6yjI_QjbvCXApJSFTgfaq6bevEuoIYK-hEZcg00fxMH6KMepIS-NJ-t/pub?gid=544939160&single=true&output=csv';

fetch(URL).then(r => r.text()).then(t => {
  const lines = t.split('\n');
  const headers = lines[0].split(',');
  
  console.log('Total cities:', lines.length - 1);
  console.log('Headers:', headers.slice(0, 15).join(', '));
  
  // Find Hannibal
  const hannibal = lines.find(l => l.toLowerCase().startsWith('hannibal,missouri'));
  if (hannibal) {
    const parts = hannibal.split(',');
    console.log('\nHannibal, Missouri found!');
    console.log('  1910:', parts[2]);
    console.log('  1920:', parts[3]);
    console.log('  1950:', parts[6]);
    console.log('  1980:', parts[9]);
    console.log('  2000:', parts[11]);
    console.log('  2010:', parts[21]);
    console.log('  2020:', parts[31]);
    console.log('  2024:', parts[35]);
  } else {
    console.log('Hannibal NOT FOUND');
  }
  
  // Also check Springfield
  const springfield = lines.find(l => l.toLowerCase().startsWith('springfield,missouri'));
  if (springfield) {
    const parts = springfield.split(',');
    console.log('\nSpringfield, Missouri found!');
    console.log('  1910:', parts[2]);
    console.log('  2020:', parts[31]);
    console.log('  2024:', parts[35]);
  }
});
