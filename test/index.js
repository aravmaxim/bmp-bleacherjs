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
    if(result)
      assert.ok(result, 'The bmp is ok');
    else {
      assert.fail(bmpObj.geterror());
    }
  });

  it('mspaint 16 color', function(){
    var bmpObj = bmp();
    var bmpData = get_pic('mspaint_16_color.bmp');
    var result = bmpObj.check(bmpData);
    if(result)
    assert.ok(result, 'The bmp is ok');
    else {
      assert.fail(bmpObj.geterror());
    }
  });

  it('mspaint 24 bit', function(){
    var bmpObj = bmp();
    var bmpData = get_pic('mspaint_24_bit.bmp');
    var result = bmpObj.check(bmpData);
    if(result)
    assert.ok(result, 'The bmp is ok');
    else {
      assert.fail(bmpObj.geterror());
    }
  });

  it('mspaint 256 color', function(){
    var bmpObj = bmp();
    var bmpData = get_pic('mspaint_256_color.bmp');
    var result = bmpObj.check(bmpData);
    if(result)
    assert.ok(result, 'The bmp is ok');
    else {
      assert.fail(bmpObj.geterror());
    }
  });

  it('mspaint monochrome', function(){
    var bmpObj = bmp();
    var bmpData = get_pic('mspaint_monochrome.bmp');
    var result = bmpObj.check(bmpData);
    if(result)
    assert.ok(result, 'The bmp is ok');
    else {
      assert.fail(bmpObj.geterror());
    }
  });
});

describe('test options', function(){
  describe('throw_exception option', function(){
    it('dont throw exception when throw_exception is false', function(){
      var bmpObj = bmp({throw_exception : false});
      var bmpData = get_pic('bmp_with_bad_magic.bmp');
      var result = bmpObj.check(bmpData);
      assert.equal(result, false);
      assert.equal(bmpObj.geterror(), 'Didnt found magic number got: PE');
    });
    it('throw exception when throw_exception is true', function(){
      var bmpObj = bmp({throw_exception : true});
      var bmpData = get_pic('bmp_with_bad_magic.bmp');
      assert.throws(() => {bmpObj.check(bmpData)}, Error, 'Didnt found magic number got: PE');
    });
    it('default value for throw_exception is false', function(){
      var bmpObj = bmp();
      var bmpData = get_pic('bmp_with_bad_magic.bmp');
      var result = bmpObj.check(bmpData);
      assert.equal(result, false);
      assert.equal(bmpObj.geterror(), 'Didnt found magic number got: PE');
    });
  })
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


