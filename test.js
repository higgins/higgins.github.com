var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let currentBlockIsProtected = false;
rl.on('line', function(line){
  if (line.startsWith("<< PRIVATE")) {
    currentBlockIsProtected = true;
  }
  if (currentBlockIsProtected) {
    if (line.startsWith("PRIVATE")) {
      currentBlockIsProtected = false;
    }
  } else {
    console.log('new line: ', line);
  }
})
