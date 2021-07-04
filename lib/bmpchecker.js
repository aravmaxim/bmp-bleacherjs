// Consts
const BMP_HEADER_SIZE = 14;
const BITMAPINFOHEADER_SIZE = 40;

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
    this.bitmap_header = null;
    this.bitmap_dib_header = null;
    this.bitmap_type = null;

    // Initalize map of header magic numbers
    this.bmpStarters = new Map();
    this.bmpStarters.set('BM', 'Windows 3.1x, 95, NT, ... etc');
    this.bmpStarters.set('BA', 'OS/2 struct bitmap array');
    this.bmpStarters.set('CI', 'OS/2 struct color icon');
    this.bmpStarters.set('CP', 'OS/2 const color pointer');
    this.bmpStarters.set('IC', 'OS/2 struct icon');
    this.bmpStarters.set('PT', 'OS/2 pointer');

    // Initalize map of dib headers sized
    this.bmpDibSizes = new Map();
    this.bmpDibSizes.set(12, 'BITMAPCOREHEADER');
    this.bmpDibSizes.set(64, 'OS22XBITMAPHEADER');
    this.bmpDibSizes.set(16, 'OS22XBITMAPHEADER');
    this.bmpDibSizes.set(BITMAPINFOHEADER_SIZE, 'BITMAPINFOHEADER');
    this.bmpDibSizes.set(52, 'BITMAPV2INFOHEADER');
    this.bmpDibSizes.set(56, 'BITMAPV3INFOHEADER');
    this.bmpDibSizes.set(108, 'BITMAPV4HEADER');
    this.bmpDibSizes.set(124, 'BITMAPV5HEADER');

    // Initalize map of BITMAPINFOHEADER compression types
    this.infoHeaderCompressionTypes = new Map();
    this.infoHeaderCompressionTypes.set(0, 'BI_RGB');
    this.infoHeaderCompressionTypes.set(1, 'BI_RLE8');
    this.infoHeaderCompressionTypes.set(2, 'BI_RLE4');
    this.infoHeaderCompressionTypes.set(3, 'BI_BITFIELDS');
    this.infoHeaderCompressionTypes.set(4, 'BI_JPEG');
    this.infoHeaderCompressionTypes.set(5, 'BI_PNG');
    this.infoHeaderCompressionTypes.set(6, 'BI_ALPHABITFIELDS');
    this.infoHeaderCompressionTypes.set(11, 'BI_CMYK');
    this.infoHeaderCompressionTypes.set(12, 'BI_CMYKRLE8');
    this.infoHeaderCompressionTypes.set(13, 'BI_CMYKRLE4');
  }

  /**
   * Checks BMP image data
   * @param {Buffer} data Buffer of the BMP image to check
   * @returns {Boolean} If the BMP file is ok
   */
  check_bmp(data){
    if(!this.check_bmp_file_header(data)) return false;
    if(!this.check_dib_header_type(data)) return false;
    if(!this.read_dib_header(data)) return false;
    if(!this.check_data(data)) return false;

    return true;
  }

  check_bmp_file_header(data){
    // Check if have enough to read the header
    if(!this.check_condtion(
      data.length >= BMP_HEADER_SIZE,
      'BMP header size is ok',
      `Size is too small for bmp header: ${data.length}`))
        return false;

    // Read the header
    this.bitmap_header = {
      magic_number : String.fromCharCode(data[0], data[1]),
      bmp_size : read_uint32(data, 2),
      reserved1 : read_uint16(data, 6),
      reserved2 : read_uint16(data, 8),
      offset_to_data : read_uint16(data, 10)
    };

    // Check bmp header
    if(!this.check_condtion(
    this.bmpStarters.get(this.bitmap_header.magic_number) != undefined,
    `found bmp magic number magic:${this.bitmap_header.magic_number} 
    type:${this.bmpStarters.get(this.bitmap_header.magic_number)}`,
    `Didnt found magic number got: ${this.bitmap_header.magic_number}`))
      return false;

    // Check bmp size
    if(!this.check_condtion(
    data.length == this.bitmap_header.bmp_size,
    `found bmp size:${this.bitmap_header.bmp_size} and its ok`,
    `Bad file size in header found: ${this.bitmap_header.bmp_size} read size: ${data.length}`))
      return false;

    // Check reserved values
    if(!this.check_condtion(
    this.bitmap_header.reserved1 == 0 && 
    this.bitmap_header.reserved2 == 0,
    'reserved values in header were ok',
    `Bad reserved values in header found 
                reserved1: ${this.bitmap_header.reserved1}
                reserved2: ${this.bitmap_header.reserved2}
                expected 0 and 0`))
        return false;

    // Offset to bitmap image data
    if(!this.check_condtion(
      data.length >= this.bitmap_header.offset_to_data,
      `offset to data in header was found it 
      is: ${ this.bitmap_header.offset_to_data} it is ok`,
      `Bad offset to data in header 
      found: ${ this.bitmap_header.offset_to_data} when file size: ${data.length}`))
          return false;

    return true;
  }

  check_dib_header_type(data){
    let dib_header_size = read_uint32(data, 14);
    let dib_header_type = this.bmpDibSizes.get(dib_header_size);

    if(!this.check_condtion(
      dib_header_type != undefined,
      `DIB header was found and it is: ${dib_header_type}`,
      `Bad DIB header size was found and it is: ${dib_header_size}`))
          return false;
    
    this.bitmap_type = dib_header_type;

    return true;
  }

  read_dib_header(data){
    if(this.bitmap_type == 'BITMAPINFOHEADER')
      return this.read_BITMAPINFOHEADER(data);
    else{
      let bad_message = `Dont support read of dib header ${this.bitmap_type}`;
      this.seterror(bad_message);

      if(this.opts.throw_exception == true){
        throw new Error(bad_message);
      }
      return false;
    }
  }

  check_data(data){
    if(this.bitmap_type == 'BITMAPINFOHEADER' && 
       this.bitmap_dib_header.compression_method == 'BI_RGB'){

    } else if (this.bitmap_type == 'BITMAPINFOHEADER') {
      this.check_condtion(false, '', 
      `BITMAPINFOHEADER compression ${this.bitmap_dib_header.compression_method}
       not supported yet`);
    } else {
      this.check_condtion(false, '', `${this.bitmap_type} not supported data check`);
    }

    // TODO : complete other data checks

    return true;
  }

  read_BITMAPINFOHEADER(data){
    // Check mnimum size for header
    if(!this.check_condtion(
    data.length >= BMP_HEADER_SIZE + BITMAPINFOHEADER_SIZE,
    'BMP size meets minimum size for BITMAPINFOHEADER type',
    `BMP size dont meet minmum size for BITMAPINFOHEADER 
    expected at lest 54 got ${data.length}`))
      return false;

    // Read the header
    this.bitmap_dib_header = {
      width  : read_uint32(data, 18),
      height : read_uint32(data, 22),
      number_of_color_planes : read_uint16(data, 26),
      bits_per_pixel : read_uint16(data, 28),
      compression_method : read_uint32(data, 30),
      image_size : read_uint32(data, 34),
      horizontal_resolution : read_uint32(data, 38),
      vertical_resolution : read_uint32(data, 42),
      colors_in_palette : read_uint32(data, 46),
      colors_used : read_uint32(data, 50)
    };
    if(this.opts.verbose)
      console.log(`Readed BITMAPINFOHEADER:${this.bitmap_dib_header}`);

    // Check number of color planes must be 1
    if(!this.check_condtion(
      this.bitmap_dib_header.number_of_color_planes == 1,
      'BITMAPINFOHEADER color plane is 1 as needed',
      `BITMAPINFOHEADER color plane is not 1 as needed 
      it is ${this.bitmap_dib_header.number_of_color_planes}`))
      return false;
    
    // Check if bits ammount is normal
    if(!this.check_condtion(
      [1,4,8,16,24,32].includes(this.bitmap_dib_header.bits_per_pixel),
      `BITMAPINFOHEADER bits per pixel has 
      value of:${this.bitmap_dib_header.bits_per_pixel}`,
      `BITMAPINFOHEADER bits per pixel has bad value: 
      ${this.bitmap_dib_header.bits_per_pixel} must be one of [1,4,8,16,24,32]`))
      return false;

    // Check if the compression is known
    let compression = 
      this.infoHeaderCompressionTypes.get(this.bitmap_dib_header.compression_method);
    if(!this.check_condtion(
      compression != undefined,
      `BITMAPINFOHEADER compression method that 
      is used is:${compression}`,
      `BITMAPINFOHEADER compression method is 
      unkown it is:${this.bitmap_dib_header.compression_method}`))
      return false;

    // TODO: what to check about width & height 
    // TODO: what to check about image size 
    // TODO: what to check about horizontal resolution
    // TODO: what to check about vertical resolution
    // TODO: what to check about number of colors
    // TODO: what to check about number of important colors used

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