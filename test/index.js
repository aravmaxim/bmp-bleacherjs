var fs = require('fs'),
  path = require('path'),
  assert = require('assert').strict,
  bmp = require('..');

function get_pic(name){
  return fs.readFileSync(path.join(__dirname, 'pics', name));
}

describe('simple file tests', function(){
  it('simple bmp should be ok', function(){
    var bmpObj = bmp();
    var bmpData = get_pic('simple_bmp.bmp');
    var result = bmpObj.check(bmpData);
    assert.ok(result, 'The bmp is ok');
  });
});

describe('header tests', function(){
  it('bmp with bad magic number', function(){
    var bmpObj = bmp();
    var bmpData = get_pic('bmp_with_bad_magic.bmp');
    var result = bmpObj.check(bmpData);
    assert.equal(result, false);
    assert.equal(bmpObj.geterror(), 'Didnt found magic number got: PE');
  });
});


