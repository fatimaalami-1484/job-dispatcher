const os = require('os');

console.log('===== Job: System Information =====');

console.log(`Computer Name: ${os.hostname()}`);
console.log(`User: ${os.userInfo().username}`);
console.log(`OS: ${os.type()} ${os.release()}`);
console.log(`Processors: ${os.cpus().length}`);
console.log(`Time: ${new Date().toLocaleString()}`);