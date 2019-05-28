function x (module) {
}

exports.asdf = 'asdf';
console.log(module.require('./input.js'));

if (module.require)
  console.log("yes");
