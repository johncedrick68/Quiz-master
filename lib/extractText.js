const PDFJS_VERSION = '3.11.174';

async function extractFromPdf(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n\n';
  }

  if (text.trim().length < 30) {
    throw new Error(
      'This PDF has no selectable text (it may be a scan). Try a PDF with real text, or paste the content directly.'
    );
  }
  return text;
}

async function extractFromDocx(file) {
  const mammoth = (await import('mammoth')).default;
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  if (!result.value || result.value.trim().length < 30) {
    throw new Error('Could not find readable text in this Word document.');
  }
  return result.value;
}

async function extractFromPlainText(file) {
  return file.text();
}

export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractFromPdf(file);
  }
  if (
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractFromDocx(file);
  }
  if (name.endsWith('.doc')) {
    throw new Error('Old-style .doc files aren\'t supported — save it as .docx or .pdf and try again.');
  }
  if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) {
    return extractFromPlainText(file);
  }

  // Fallback: try reading as plain text
  return extractFromPlainText(file);
}
