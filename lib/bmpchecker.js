function read_uint16(data, start){
  return (data[start + 1] << 8) + (data[start]);
}

function read_uint32(data, start){
  return (data[start + 3] << 24)  + (data[start + 2] << 16) + 
         (data[start + 1] << 8) + (data[start]);
}


class BMPChecker{
  constructor(opts, seterror){
    this.opts = opts;
    this.seterror = seterror;
  }

  check_bmp(data){
    // TODO : minimal size check
    if(!this.check_bmp_file_header(data)) return false;

    return true;
  }

  check_bmp_file_header(data){
    // Initalize map of header magic numbers
    let bmpStarters = new Map();
    bmpStarters.set('BM', 'Windows 3.1x, 95, NT, ... etc');
    bmpStarters.set('BA', 'OS/2 struct bitmap array');
    bmpStarters.set('CI', 'OS/2 struct color icon');
    bmpStarters.set('CP', 'OS/2 const color pointer');
    bmpStarters.set('IC', 'OS/2 struct icon');
    bmpStarters.set('PT', 'OS/2 pointer');

    // Check bmp header
    let magicNumber = String.fromCharCode(data[0], data[1]);
    if(bmpStarters.get(magicNumber) == undefined){
      let msg = `Didnt found magic number got: ${magicNumber}`; 
      this.seterror(msg);
      return false;
    } else if(this.opts.verbose == true){
      console.log(`found bmp magic number magic:${magicNumber} type:${bmpStarters.get(magicNumber)}`);
    }

    // Read and check bmp size
    let bmp_size = read_uint32(data, 2);
    if(data.length != bmp_size){
      let msg = `Bad file size in header found: ${bmp_size} read size: ${data.length}`;
      this.seterror(msg);
      return false;
    } else if(this.opts.verbose == true) {
      console.log(`found bmp size:${bmp_size} and its ok`);
    }

    // Reserved values
    let reserved1 = read_uint16(data, 6);
    let reserved2 = read_uint16(data, 8);
    if(reserved1 != 0 || reserved2 != 0 ){
      let msg = `Bad reserved values in header found 
                  reserved1: ${reserved1}
                  reserved2: ${reserved2}
                  expected 0 and 0`;
      this.seterror(msg);
      return false;
    } else if(this.opts.verbose == true) {
      console.log('reserved values in header were ok');
    }

    // Offset to bitmap image data
    let offset_to_data = read_uint16(data, 10);
    if(data.length < offset_to_data){
      let msg = `Bad offset to data in header found: ${offset_to_data} when file size: ${data.length}`;
      this.seterror(msg);
      return false;
    } else if(this.opts.verbose == true) {
      console.log(`offset to data in header was found it is: ${offset_to_data} it is ok`);
    }

    return true;
  }
}


function check_dib_header(data, opts, seterror){
    // Initalize map of dib headers sized
    bmpDibSizes = new Map();
    bmpDibSizes.set(12, 'BITMAPCOREHEADER');
    bmpDibSizes.set(64, 'OS22XBITMAPHEADER');
    bmpDibSizes.set(16, 'OS22XBITMAPHEADER');
    bmpDibSizes.set(40, 'BITMAPV2INFOHEADER');
    bmpDibSizes.set(52, 'BITMAPV2INFOHEADER');
    bmpDibSizes.set(56, 'BITMAPV3INFOHEADER');
    bmpDibSizes.set(108, 'BITMAPV4HEADER');
    bmpDibSizes.set(124, 'BITMAPV5HEADER');
}

function bmpchecker(options, seterror){
  var opts = options || {};

  // Set default vaules
  if (opts.verbose == null) opts.verbose = false;


  return function bmpcheck(data){
    let checker = new BMPChecker(opts, seterror);
    return checker.check_bmp(data);
  }
}

module.exports = bmpchecker;