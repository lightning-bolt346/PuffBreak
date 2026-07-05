const fs = require('fs');
['app/blog/page.tsx', 'app/blog/[slug]/page.tsx'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  fs.writeFileSync(f, content.replace(/\\`/g, '`'));
  console.log('Fixed ' + f);
});
