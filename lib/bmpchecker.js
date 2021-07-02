function read_uint32(data, start){
  return (data[start + 3] << 24)  + (data[start + 2] << 16) + 
         (data[start + 1] << 8) + (data[start]);
}

function bmpchecker(data) {
  // Initalize map of header magic numbers
  bmpStarters = new Map();
  bmpStarters.set('BM', 'Windows 3.1x, 95, NT, ... etc');
  bmpStarters.set('BA', 'OS/2 struct bitmap array');
  bmpStarters.set('CI', 'OS/2 struct color icon');
  bmpStarters.set('CP', 'OS/2 const color pointer');
  bmpStarters.set('IC', 'OS/2 struct icon');
  bmpStarters.set('PT', 'OS/2 pointer');

  // TODO : minimal size check

  // Check bmp header
  let magicNumber = String.fromCharCode(data[0], data[1]);
  if(bmpStarters.get(magicNumber) == undefined){
    // TODO : add message why failed
    return false;
  } else {
    console.log(`found bmp magic number magic:${magicNumber} type:${bmpStarters.get(magicNumber)}`);
  }

  // Read and check bmp size
  let bmp_size = read_uint32(data, 2);
  if(data.length != bmp_size){
    // TODO : add message why failed
    return false;
  } else {
    console.log(`found bmp size:${bmp_size} and its ok`);
  }

  

  return true;
}

module.exports = bmpchecker;