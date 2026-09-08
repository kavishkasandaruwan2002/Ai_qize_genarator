import jspdfPkg from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

const jsPDF = jspdfPkg.jsPDF || jspdfPkg.default || jspdfPkg;

const title = "AI Study Assistant - Comprehensive Revision Guide";
const summary = [
  "AI-Powered Note Synthesis: Automatically transforms dense PDF textbooks and lecture slides into clean, bite-sized revision points.",
  "Active Recall & Self-Testing: Generates flashcards and MCQ quizzes engineered to optimize memory retention and exam preparation.",
  "Structured Knowledge Breakdown: Groups complex subject matter into clear definitions, key formulas, and exam-focused takeaways.",
  "Instant Feedback & Tracking: Interactive quiz modes highlight weak areas immediately so you focus your study time effectively.",
  "Production MERN Architecture: Built using React (Vite), Node.js, Express, MongoDB, Docker containers, and automated CI/CD pipelines."
];

const flashcards = [
  {
    question: "What is Active Recall and why is it effective?",
    answer: "Active Recall is a learning method where you retrieve information from memory without looking at notes. It builds stronger neural pathways and dramatically improves retention."
  },
  {
    question: "What are the three core study modules provided by the system?",
    answer: "1) Key Concept Summaries for quick overview, 2) Flashcards for active recall, and 3) MCQ Quizzes for self-assessment."
  },
  {
    question: "How does Spaced Repetition enhance long-term memory?",
    answer: "Spaced Repetition reviews study items at increasing time intervals, counteracting the forgetting curve and moving information into long-term memory."
  },
  {
    question: "What is the primary benefit of PDF upload for study decks?",
    answer: "It eliminates manual note synthesis by extracting and structuring key revision points directly from course materials in seconds."
  }
];

const quizzes = [
  {
    question: "Which studying technique provides the highest long-term retention rate?",
    options: [
      "Passive re-reading of textbook chapters",
      "Active recall and self-testing",
      "Highlighting sentences in notes",
      "Copying notes word-for-word"
    ],
    answer: "Active recall and self-testing"
  },
  {
    question: "What is the primary purpose of the AI Summary Generator?",
    options: [
      "To delete detailed source material",
      "To extract core revision concepts into clear, easy-to-study bullet points",
      "To translate text into random languages",
      "To edit PDF formatting"
    ],
    answer: "To extract core revision concepts into clear, easy-to-study bullet points"
  }
];

// --- 1. Generate PDF ---
function generatePDF(outputPath) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkAddPage = (needed) => {
    if (currentY + needed > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      addHeaderFooter();
    }
  };

  const addHeaderFooter = () => {
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    doc.line(margin, 25, pageWidth - margin, 25);

    const totalPages = doc.internal.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`AI Study Assistant • Page ${totalPages}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    doc.text(`Generated Revision Guide • English Summary`, margin, pageHeight - 15);
  };

  // Header Banner
  doc.setFillColor(79, 70, 229);
  doc.rect(margin, currentY, contentWidth, 60, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin + 15, currentY + 28, { maxWidth: contentWidth - 30 });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text('Easy-to-Study Summary & Revision Guide', margin + 15, currentY + 48);

  currentY += 75;

  // Key Concepts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Key Revision Concepts', margin, currentY);
  currentY += 15;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 15;

  summary.forEach((pt, idx) => {
    const textLines = doc.splitTextToSize(`${idx + 1}. ${pt}`, contentWidth - 24);
    const blockHeight = textLines.length * 14 + 14;

    checkAddPage(blockHeight);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, contentWidth, blockHeight, 6, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, blockHeight, 6, 6, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    textLines.forEach((l, lIdx) => {
      doc.text(l, margin + 12, currentY + 18 + lIdx * 14);
    });

    currentY += blockHeight + 8;
  });

  currentY += 15;

  // Flashcards
  checkAddPage(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Revision Flashcards', margin, currentY);
  currentY += 15;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 15;

  flashcards.forEach((card) => {
    const qLines = doc.splitTextToSize(`Q: ${card.question}`, contentWidth - 24);
    const aLines = doc.splitTextToSize(`A: ${card.answer}`, contentWidth - 24);
    const cardHeight = (qLines.length + aLines.length) * 14 + 20;

    checkAddPage(cardHeight);

    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, currentY, contentWidth, cardHeight, 6, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(67, 56, 202);
    qLines.forEach((l, i) => doc.text(l, margin + 12, currentY + 16 + i * 14));

    const qH = qLines.length * 14;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    aLines.forEach((l, i) => doc.text(l, margin + 12, currentY + 16 + qH + i * 14));

    currentY += cardHeight + 8;
  });

  currentY += 15;

  // Quiz
  checkAddPage(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Self-Assessment Quiz', margin, currentY);
  currentY += 15;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 15;

  quizzes.forEach((q, qIdx) => {
    const qText = doc.splitTextToSize(`${qIdx + 1}. ${q.question}`, contentWidth - 20);
    const needed = qText.length * 14 + q.options.length * 14 + 20;

    checkAddPage(needed);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    qText.forEach((l, i) => doc.text(l, margin, currentY + i * 14));

    currentY += qText.length * 14 + 6;

    q.options.forEach((opt, optIdx) => {
      const isCorrect = opt === q.answer;
      doc.setFont('helvetica', isCorrect ? 'bold' : 'normal');
      if (isCorrect) doc.setTextColor(16, 185, 129);
      else doc.setTextColor(71, 85, 105);
      doc.text(`   [${String.fromCharCode(65 + optIdx)}] ${opt}${isCorrect ? ' ✓' : ''}`, margin, currentY);
      currentY += 14;
    });

    currentY += 10;
  });

  addHeaderFooter();

  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log(`Successfully generated PDF at: ${outputPath}`);
}

// --- 2. Generate PPTX ---
async function generatePPTX(outputPath) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'AI Study Assistant';
  pptx.title = title;

  // Title Slide
  const s1 = pptx.addSlide();
  s1.background = { color: '1E1B4B' };
  s1.addText(title, {
    x: 0.8, y: 2.0, w: 11.5, h: 1.5,
    fontSize: 34, bold: true, color: 'FFFFFF', valign: 'middle'
  });
  s1.addText('Easy-to-Study Summary & PowerPoint Slide Deck', {
    x: 0.8, y: 3.6, w: 11.5, h: 0.6,
    fontSize: 18, color: 'A5B4FC'
  });
  s1.addText('Clear English Summary • AI Study Assistant', {
    x: 0.8, y: 6.5, w: 11.5, h: 0.4,
    fontSize: 12, color: '818CF8'
  });

  // Summary Slide
  const s2 = pptx.addSlide();
  s2.background = { color: 'F8FAFC' };
  s2.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: '4F46E5' } });
  s2.addText('Key Revision Concepts', { x: 0.8, y: 0.2, w: 10, h: 0.6, fontSize: 22, bold: true, color: 'FFFFFF' });

  summary.slice(0, 4).forEach((pt, idx) => {
    const topY = 1.3 + idx * 1.35;
    s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: topY, w: 11.73, h: 1.15, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }
    });
    s2.addShape(pptx.shapes.OVAL, {
      x: 1.1, y: topY + 0.28, w: 0.6, h: 0.6, fill: { color: '4F46E5' }
    });
    s2.addText(`${idx + 1}`, {
      x: 1.1, y: topY + 0.28, w: 0.6, h: 0.6, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
    });
    s2.addText(pt, {
      x: 1.9, y: topY + 0.15, w: 10.3, h: 0.85, fontSize: 14, color: '0F172A', valign: 'middle'
    });
  });

  // Flashcards Slide
  const s3 = pptx.addSlide();
  s3.background = { color: 'F8FAFC' };
  s3.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: '312E81' } });
  s3.addText('Revision Flashcards', { x: 0.8, y: 0.2, w: 10, h: 0.6, fontSize: 22, bold: true, color: 'FFFFFF' });

  flashcards.slice(0, 2).forEach((fc, idx) => {
    const cardY = 1.3 + idx * 2.8;
    s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: cardY, w: 11.73, h: 1.2, fill: { color: 'EEF2FF' }, line: { color: 'C7D2FE', width: 1 }
    });
    s3.addText(`Q: ${fc.question}`, {
      x: 1.1, y: cardY + 0.15, w: 11.1, h: 0.9, fontSize: 15, bold: true, color: '3730A3', valign: 'middle'
    });

    s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: cardY + 1.35, w: 11.73, h: 1.2, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 }
    });
    s3.addText(`A: ${fc.answer}`, {
      x: 1.1, y: cardY + 1.5, w: 11.1, h: 0.9, fontSize: 14, color: '065F46', valign: 'middle'
    });
  });

  // Quiz Slide
  const s4 = pptx.addSlide();
  s4.background = { color: 'F8FAFC' };
  s4.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: '065F46' } });
  s4.addText('Self-Assessment Quiz', { x: 0.8, y: 0.2, w: 10, h: 0.6, fontSize: 22, bold: true, color: 'FFFFFF' });

  const q = quizzes[0];
  s4.addText(`1. ${q.question}`, { x: 0.8, y: 1.2, w: 11.73, h: 0.9, fontSize: 18, bold: true, color: '0F172A' });
  q.options.forEach((opt, optIdx) => {
    const isCorrect = opt === q.answer;
    const optY = 2.2 + optIdx * 1.0;
    s4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: optY, w: 11.73, h: 0.85, fill: { color: isCorrect ? 'D1FAE5' : 'FFFFFF' }, line: { color: isCorrect ? '10B981' : 'CBD5E1', width: isCorrect ? 2 : 1 }
    });
    const prefix = String.fromCharCode(65 + optIdx);
    s4.addText(`${prefix}. ${opt} ${isCorrect ? ' (Correct Answer ✓)' : ''}`, {
      x: 1.2, y: optY + 0.1, w: 11.0, h: 0.65, fontSize: 14, bold: isCorrect, color: isCorrect ? '047857' : '334155', valign: 'middle'
    });
  });

  await pptx.writeFile({ fileName: outputPath });
  console.log(`Successfully generated PPTX at: ${outputPath}`);
}

const artifactDir = "C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\99aaecfe-183d-4783-838a-1b693908f254";
const projectDir = "E:\\destop\\Ai_qize_genarator";

const pdfArtifactPath = path.join(artifactDir, "AI_Study_Assistant_Summary.pdf");
const pptxArtifactPath = path.join(artifactDir, "AI_Study_Assistant_Summary.pptx");
const pdfProjectPath = path.join(projectDir, "AI_Study_Assistant_Summary.pdf");
const pptxProjectPath = path.join(projectDir, "AI_Study_Assistant_Summary.pptx");

generatePDF(pdfArtifactPath);
generatePDF(pdfProjectPath);
await generatePPTX(pptxArtifactPath);
await generatePPTX(pptxProjectPath);
console.log("All study summary files created successfully!");
