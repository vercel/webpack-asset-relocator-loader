const num = Math.ceil(Math.random() * 3, 0);

const path = `path${num}`;
const m = require(`./modules/${path}/index.js`);
console.log(m);
