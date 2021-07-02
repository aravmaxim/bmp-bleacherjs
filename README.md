# bmp-bleacherjs
Part of the [FileBleacher project](https://github.com/aravmaxim/filebleacher-research) checks BMP format.


##  Usage Example
Synchronous check of file from file:
```javascript
var fs = require('fs');
var bmpCDR = require('bmp-bleacherjs');
var bmp = bmpCDR();
var bmpData = fs.readFileSync('pic.bmp');

if (bmp.check(bmpData)) console.log('bmp ok!');
else {
  console.log('Bad bmp');
}
```

