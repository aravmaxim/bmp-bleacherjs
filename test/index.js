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

describe('known CVE for BMP format', function(){
  describe('CVE-2018-7640', function(){
    it('cimg-heap-overflow-load_bmp-48378', function(){
      var bmpObj = bmp();
      var bmpData = get_pic('CVE-2018-7640_48378.bmp');
      var result = bmpObj.check(bmpData);
      assert.equal(result, false);
      assert.equal(bmpObj.geterror(), 'Bad file size in header found: 268436086 read size: 512');
    });
    it('cimg-heap-overflow-load_bmp-48397', function(){
      var bmpObj = bmp();
      var bmpData = get_pic('CVE-2018-7640_48397.bmp');
      var result = bmpObj.check(bmpData);
      assert.equal(result, false);
      assert.equal(bmpObj.geterror(), 'Bad file size in header found: 630 read size: 588');
    });    
    it('cimg-heap-overflow-load_bmp-48413', function(){
      var bmpObj = bmp();
      var bmpData = get_pic('CVE-2018-7640_48413.bmp');
      var result = bmpObj.check(bmpData);
      assert.equal(result, false);
      assert.equal(bmpObj.geterror(), 'Bad file size in header found: -1900170 read size: 407');
    });
    
    it('cimg-heap-overflow-load_bmp-48427', function(){
      var bmpObj = bmp();
      var bmpData = get_pic('CVE-2018-7640_48427.bmp');
      var result = bmpObj.check(bmpData);
      assert.equal(result, false);
      assert.equal(bmpObj.geterror(), 'Bad file size in header found: 626 read size: 56');
    });
    it('cimg-heap-overflow-load_bmp-48457', function(){
      var bmpObj = bmp();
      var bmpData = get_pic('CVE-2018-7640_48457.bmp');
      var result = bmpObj.check(bmpData);
      assert.equal(result, false);
      assert.equal(bmpObj.geterror(), 'Bad file size in header found: 118 read size: 56');
    });
  })
})


