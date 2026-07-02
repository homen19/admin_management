const fs = require('fs');
const logPath = 'C:/Users/homen/.gemini/antigravity-ide/brain/0bd625cf-64d5-4e47-b142-67f702d07ce0/.system_generated/logs/transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
let codeString = '';
for (const line of content.split('\n')) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.content && data.content.includes('File Path: ile:///d:/Homen-workspace/admin_management/frontend/src/pages/Chat.jsx')) {
        const start = data.content.indexOf('1: import React');
        const end = data.content.indexOf('\nThe above content shows', start);
        if (start !== -1 && end !== -1) {
            codeString = data.content.substring(start, end);
            break;
        }
    }
  } catch(e) {}
}
if (codeString) {
    const clean = codeString.split('\n').map(l => l.replace(/^\d+: /, '')).join('\n');
    fs.writeFileSync('src/pages/Chat.jsx', clean);
    console.log('Restored Chat.jsx correctly!');
} else {
    console.log('Not found.');
}
