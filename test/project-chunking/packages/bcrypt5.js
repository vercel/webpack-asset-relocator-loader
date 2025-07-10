const bcrypt = require('bcrypt5');

bcrypt.hash('pass', 10).then(function(hash) {
  console.log(hash);
});
