var fs = require('fs'),
  path = require('path'),
  assert = require('assert'),
  bmp = require('..');

function get_pic(name){
  return fs.readFileSync(path.join(__dirname, 'pics', name));
}

it('simple bmp should be ok', function(){
  var bmpData = get_pic('simple_bmp.bmp');
  var result = bmp.checker(bmpData);
  assert(result, 'The bmp is ok');
});