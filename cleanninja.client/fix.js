const fs = require('fs');
const path = require('path');

const map = {
  'ðŸ“…': '📅',
  'ðŸ“¦': '📦',
  'ðŸ’°': '💰',
  'ðŸ¤·': '🤷',
  'ðŸ“ž': '📞',
  'ðŸ“ ': '📌',
  'âœ ï¸ ': '✍️',
  'ðŸ–¼ï¸ ': '🖼️',
  'â€”': '—',
  'Â£': '£',
  'â˜…': '★',
  'â˜†': '☆',
  'â€¢': '•',
  'Ã°Å¸â€œ ': '🖼️',
  'ðŸ“ ': '🖼️' 
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      if (filePath.endsWith('.html')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walkDir('D:/Others/CleanNinja/CleanNinja/cleanninja.client/src/app/pages/admin');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  for (let [k, v] of Object.entries(map)) {
    if (content.includes(k)) {
      content = content.split(k).join(v);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed', f);
  }
});
