var checker = require('./lib/bmpchecker');

module.exports = function (opt) {
  var last_error = '';
  
  function seterror(msg){
    last_error = msg;
  }

  function getlasterror(){
    return last_error;
  }

  return {
    check: checker(opt, seterror),
    geterror: getlasterror
  };
};