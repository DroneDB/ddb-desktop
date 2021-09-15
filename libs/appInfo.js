module.exports = {
    getPackageInfo: async () => {
        const fs = require('fs');
        const path = require('path');
        
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, "..", "package.json"), { encoding: 'utf8' }, (err, data) => {
                if (err) reject(err);
                else resolve(JSON.parse(data));
            });
        });
    },
}