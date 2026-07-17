import pdf from 'pdf-parse';

/**
 * Extracts text from a PDF file buffer.
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} The extracted text
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};
