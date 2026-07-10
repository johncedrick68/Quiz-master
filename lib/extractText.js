const PDFJS_VERSION = '3.11.174';

async function extractFromPdf(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = '';
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += `${content.items.map((item) => item.str).join(' ')}\n\n`;
  }
  if (text.trim().length < 30) throw new Error('This PDF has no selectable text. Use a text-based PDF or paste the content instead.');
  return text;
}

export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return extractFromPdf(file);
  if (name.endsWith('.doc') || name.endsWith('.docx')) throw new Error('Word files are not supported yet. Export as PDF or TXT, or paste the text instead.');
  if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) return file.text();
  throw new Error('Use a PDF, TXT, or Markdown file.');
}
