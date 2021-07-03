/**
 * Reads uint 16 from a given buffer
 * @param {Buffer} data Buffer from which to read the int
 * @param {Number} start The offset from which to read the integer
 * @returns {Number} The uint 16 number readed
 */
function read_uint16(data, start){
  return (data[start + 1] << 8) + (data[start]);
}

/**
 * Reads uint 32 from a given buffer
 * @param {Buffer} data Buffer from which to read the int
 * @param {Number} start The offset from which to read the integer
 * @returns {Number} The uint 32 number readed
 */
function read_uint32(data, start){
  return (data[start + 3] << 24)  + (data[start + 2] << 16) + 
         (data[start + 1] << 8) + (data[start]);
}

/**
 * Class that checks the BMP file format
 */
class BMPChecker{
  /**
   * Constructor for BMPChecker
   * @param {Object} opts The options for BMP checker
   * @param {Function} seterror The function to set last error
   */
  constructor(opts, seterror){
    this.opts = opts;
    this.seterror = seterror;
  }

  /**
   * Checks BMP image data
   * @param {Buffer} data Buffer of the BMP image to check
   * @returns {Boolean} If the BMP file is ok
   */
  check_bmp(data){
    // TODO : minimal size check
    if(!this.check_bmp_file_header(data)) return false;
    if(!this.check_dib_header_type(data)) return false;

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
    if(!this.check_condtion(
    bmpStarters.get(magicNumber) != undefined,
    `found bmp magic number magic:${magicNumber} type:${bmpStarters.get(magicNumber)}`,
    `Didnt found magic number got: ${magicNumber}`))
      return false;


    // Read and check bmp size
    let bmp_size = read_uint32(data, 2);
    if(!this.check_condtion(
    data.length == bmp_size,
    `found bmp size:${bmp_size} and its ok`,
    `Bad file size in header found: ${bmp_size} read size: ${data.length}`))
      return false;

    // Reserved values
    let reserved1 = read_uint16(data, 6);
    let reserved2 = read_uint16(data, 8);
    if(!this.check_condtion(
    reserved1 == 0 && reserved2 == 0,
    'reserved values in header were ok',
    `Bad reserved values in header found 
                reserved1: ${reserved1}
                reserved2: ${reserved2}
                expected 0 and 0`))
        return false;

    // Offset to bitmap image data
    let offset_to_data = read_uint16(data, 10);
    if(!this.check_condtion(
      data.length >= offset_to_data,
      `offset to data in header was found it is: ${offset_to_data} it is ok`,
      `Bad offset to data in header found: ${offset_to_data} when file size: ${data.length}`))
          return false;

    return true;
  }

  check_dib_header_type(data){
    // Initalize map of dib headers sized
    let bmpDibSizes = new Map();
    bmpDibSizes.set(12, 'BITMAPCOREHEADER');
    bmpDibSizes.set(64, 'OS22XBITMAPHEADER');
    bmpDibSizes.set(16, 'OS22XBITMAPHEADER');
    bmpDibSizes.set(40, 'BITMAPV2INFOHEADER');
    bmpDibSizes.set(52, 'BITMAPV2INFOHEADER');
    bmpDibSizes.set(56, 'BITMAPV3INFOHEADER');
    bmpDibSizes.set(108, 'BITMAPV4HEADER');
    bmpDibSizes.set(124, 'BITMAPV5HEADER');

    let dib_header_size = read_uint32(data, 14);
    let dib_header_type = bmpDibSizes.get(dib_header_size);

    if(!this.check_condtion(
      dib_header_type != undefined,
      `DIB header was found and it is: ${dib_header_type}`,
      `Bad DIB header size was found and it is: ${dib_header_size}`))
          return false;

    return true;
  }

  /**
   * Checks the condition and if it is good do verbose and if its bad set error.
   * @param {Boolean} condition The condition to check
   * @param {String} good_message The message for if the condition is true
   * @param {String} bad_message The message for if the condition is false
   * @returns {Boolean} The condition value
   */
  check_condtion(condition, good_message, bad_message){
    if(!condition){
      this.seterror(bad_message);

      if(this.opts.throw_exception == true){
        throw new Error(bad_message);
      }

      return false;
    } else if(this.opts.verbose == true){
      console.log(good_message);
    }

    return true;
  }
}


/**
 * Creates the bmpchecker function
 * @param {Object} options The options with which to check the BMP file
 * @param {Function} seterror The function with which to set the last error
 * @returns {Function} function that check bmp image with a given options
 */
function bmpchecker(options, seterror){
  var opts = options || {};

  // Set default vaules
  if (opts.verbose == null) opts.verbose = false;
  if (opts.throw_exception == null) opts.throw_exception = false;

  /**
   * Checks if bmp file is ok
   * @param {Buffer} data The data of the bmp image
   * @returns {Boolean} If the bmp image is ok
   */
  function bmpcheck(data){
    let checker = new BMPChecker(opts, seterror);
    return checker.check_bmp(data);
  }

  return bmpcheck;
}

module.exports = bmpchecker;