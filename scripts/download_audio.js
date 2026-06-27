const https = require('https');
const fs = require('fs');
const path = require('path');
const urlModule = require('url');

const urls = {
  beach: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Ocean_waves.ogg',
  office: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Office_ambience.ogg',
  space: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Space_Ship_Engine_Sound.ogg',
  metro: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Subway_train_arriving.ogg',
  chai: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Coffee_shop_ambience.ogg',
  library: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Rain_on_a_tin_roof.ogg',
  park: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Birds_singing_in_the_forest.ogg',
  silent: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Office_ambience.ogg'
};

const targetDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function checkAndDownload() {
  for (const [room, url] of Object.entries(urls)) {
    console.log(`Checking ${room}...`);
    try {
      const p = new Promise((resolve) => {
        const parsedUrl = new URL(url);
        const options = {
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        };
        https.get(options, (res) => {
          console.log(`Status for ${room}: ${res.statusCode}`);
          if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301) {
             let targetUrl = res.statusCode === 200 ? url : res.headers.location;
             if(targetUrl.startsWith('/')) targetUrl = 'https://upload.wikimedia.org' + targetUrl;
             
             const parsedTarget = new URL(targetUrl);
             const targetOptions = {
                 hostname: parsedTarget.hostname,
                 path: parsedTarget.pathname,
                 headers: { 'User-Agent': 'Mozilla/5.0' }
             };
             https.get(targetOptions, (res2) => {
                 if (res2.statusCode === 200) {
                     const file = fs.createWriteStream(path.join(targetDir, `${room}.mp3`)); 
                     res2.pipe(file);
                     file.on('finish', () => { file.close(); console.log(`Downloaded ${room}`); resolve(); });
                 } else { resolve(); }
             });
          } else {
             resolve();
          }
        }).on('error', () => resolve());
      });
      await p;
    } catch(e) {
      console.log('Error', e);
    }
  }
}

checkAndDownload();
