const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function convert() {
  const dir = path.join(__dirname, 'manuscript');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));

  for (const file of files) {
    const docxPath = path.join(dir, file);
    const txtPath = path.join(dir, file.replace('.docx', '.txt'));

    console.log(`Converting ${file}...`);
    const buffer = fs.readFileSync(docxPath);
    const result = await mammoth.extractRawText({ buffer });

    fs.writeFileSync(txtPath, result.value);
    console.log(`Created ${txtPath}`);
  }
}

convert().catch(console.error);
