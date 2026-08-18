const path = require('path');

const rootDir = __dirname.replace('\\server\\src', '');
require('dotenv').config({
    path:     path.join(rootDir, '.env'),
    override: true
});
