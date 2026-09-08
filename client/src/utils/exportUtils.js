import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';

/**
 * Clean up text for filenames
 */
const sanitizeFilename = (name) => {
  return (name || 'Study_Note').replace(/[^a-zA-Z0-9_-]/g, '_');
};

/**
 * Export Study Summary & Content as a PDF Document
 */
export const exportToPDF = ({ title = 'Study Note', summary = [], flashcards = [], quizzes = [] }) => {
  const jsPDFClass = typeof jsPDF === 'function' ? jsPDF : (jsPDF.jsPDF || jsPDF.default || jsPDF);
  const doc = new jsPDFClass({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkAddPage = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      addHeaderFooter();
      return true;
    }
    return false;
  };

  const addHeaderFooter = () => {
    // Header decorative line
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    doc.line(margin, 25, pageWidth - margin, 25);

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`AI Study Assistant • Page ${totalPages}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 15);
  };

  // --- Title Banner ---
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, currentY, contentWidth, 60, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin + 15, currentY + 28, { maxWidth: contentWidth - 30 });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text('Revision & Study Summary Deck', margin + 15, currentY + 48);

  currentY += 75;

  // --- Summary Section ---
  if (summary && summary.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text('Key Revision Concepts', margin, currentY);
    currentY += 15;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 15;

    summary.forEach((point, index) => {
      const textLines = doc.splitTextToSize(`${index + 1}. ${point}`, contentWidth - 20);
      const blockHeight = textLines.length * 14 + 10;

      checkAddPage(blockHeight);

      // Bullet Box background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, blockHeight, 6, 6, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, contentWidth, blockHeight, 6, 6, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);

      textLines.forEach((line, lineIdx) => {
        doc.text(line, margin + 12, currentY + 16 + lineIdx * 14);
      });

      currentY += blockHeight + 8;
    });

    currentY += 15;
  }

  // --- Flashcards Section ---
  if (flashcards && flashcards.length > 0) {
    checkAddPage(60);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Flashcards Overview', margin, currentY);
    currentY += 15;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 15;

    flashcards.forEach((card, index) => {
      const qLines = doc.splitTextToSize(`Q: ${card.question}`, contentWidth - 24);
      const aLines = doc.splitTextToSize(`A: ${card.answer}`, contentWidth - 24);
      const cardHeight = (qLines.length + aLines.length) * 14 + 20;

      checkAddPage(cardHeight);

      doc.setFillColor(238, 242, 255); // Indigo 50
      doc.roundedRect(margin, currentY, contentWidth, cardHeight, 6, 6, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(67, 56, 202);

      qLines.forEach((line, i) => {
        doc.text(line, margin + 12, currentY + 16 + i * 14);
      });

      const qHeight = qLines.length * 14;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);

      aLines.forEach((line, i) => {
        doc.text(line, margin + 12, currentY + 16 + qHeight + i * 14);
      });

      currentY += cardHeight + 8;
    });

    currentY += 15;
  }

  // --- Quiz Section ---
  if (quizzes && quizzes.length > 0) {
    checkAddPage(60);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Multiple Choice Quiz', margin, currentY);
    currentY += 15;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 15;

    quizzes.forEach((quiz, index) => {
      const qText = doc.splitTextToSize(`${index + 1}. ${quiz.question}`, contentWidth - 20);
      const needed = qText.length * 14 + (quiz.options ? quiz.options.length * 14 : 0) + 30;

      checkAddPage(needed);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      qText.forEach((l, i) => {
        doc.text(l, margin, currentY + i * 14);
      });

      currentY += qText.length * 14 + 6;

      if (quiz.options) {
        quiz.options.forEach((opt, optIdx) => {
          const isCorrect = opt === quiz.answer;
          doc.setFont('helvetica', isCorrect ? 'bold' : 'normal');
          if (isCorrect) {
            doc.setTextColor(16, 185, 129);
          } else {
            doc.setTextColor(71, 85, 105);
          }
          doc.text(`   [${String.fromCharCode(65 + optIdx)}] ${opt} ${isCorrect ? ' ✓' : ''}`, margin, currentY);
          currentY += 14;
        });
      }

      currentY += 10;
    });
  }

  addHeaderFooter();

  // Trigger download
  const filename = `${sanitizeFilename(title)}_Study_Summary.pdf`;
  doc.save(filename);
};

/**
 * Export Study Summary & Content as a PowerPoint Presentation (.pptx)
 */
export const exportToPPTX = ({ title = 'Study Note', summary = [], flashcards = [], quizzes = [] }) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'AI Study Assistant';
  pptx.title = title;

  // Theme Colors
  const INDIGO_DARK = '1E1B4B';
  const INDIGO_PRIMARY = '4F46E5';
  const SLATE_BG = 'F8FAFC';
  const TEXT_DARK = '0F172A';
  const CARD_BG = 'FFFFFF';

  // --- SLIDE 1: Title Slide ---
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: INDIGO_DARK };

  // Title Box
  titleSlide.addText(title, {
    x: 0.8,
    y: 2.0,
    w: 11.5,
    h: 1.5,
    fontSize: 36,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    valign: 'middle'
  });

  // Subtitle
  titleSlide.addText('Comprehensive AI Revision & Study Summary Deck', {
    x: 0.8,
    y: 3.6,
    w: 11.5,
    h: 0.6,
    fontSize: 18,
    color: 'A5B4FC',
    fontFace: 'Arial'
  });

  // Footer Tag
  titleSlide.addText(`Generated by AI Study Assistant • ${new Date().toLocaleDateString()}`, {
    x: 0.8,
    y: 6.5,
    w: 11.5,
    h: 0.4,
    fontSize: 12,
    color: '818CF8',
    fontFace: 'Arial'
  });

  // --- SLIDE 2: Summary Concept Slides ---
  if (summary && summary.length > 0) {
    const chunkSize = 4;
    for (let i = 0; i < summary.length; i += chunkSize) {
      const chunk = summary.slice(i, i + chunkSize);
      const slideNum = Math.floor(i / chunkSize) + 1;
      const totalSummarySlides = Math.ceil(summary.length / chunkSize);

      const slide = pptx.addSlide();
      slide.background = { color: SLATE_BG };

      // Header Bar
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 1.0,
        fill: { color: INDIGO_PRIMARY }
      });

      slide.addText(`Key Concepts (${slideNum}/${totalSummarySlides})`, {
        x: 0.8,
        y: 0.2,
        w: 10,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });

      // Cards layout
      chunk.forEach((point, idx) => {
        const globalIdx = i + idx + 1;
        const topY = 1.3 + idx * 1.35;

        // Card background shape
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: 0.8,
          y: topY,
          w: 11.73,
          h: 1.15,
          fill: { color: CARD_BG },
          line: { color: 'E2E8F0', width: 1 }
        });

        // Number Badge
        slide.addShape(pptx.shapes.OVAL, {
          x: 1.1,
          y: topY + 0.28,
          w: 0.6,
          h: 0.6,
          fill: { color: INDIGO_PRIMARY }
        });

        slide.addText(`${globalIdx}`, {
          x: 1.1,
          y: topY + 0.28,
          w: 0.6,
          h: 0.6,
          fontSize: 14,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
          valign: 'middle'
        });

        // Text content
        slide.addText(point, {
          x: 1.9,
          y: topY + 0.15,
          w: 10.3,
          h: 0.85,
          fontSize: 14,
          color: TEXT_DARK,
          valign: 'middle',
          fontFace: 'Arial'
        });
      });
    }
  }

  // --- SLIDE 3: Flashcards Slides ---
  if (flashcards && flashcards.length > 0) {
    const fcChunkSize = 2;
    for (let i = 0; i < flashcards.length; i += fcChunkSize) {
      const chunk = flashcards.slice(i, i + fcChunkSize);

      const slide = pptx.addSlide();
      slide.background = { color: SLATE_BG };

      // Header Bar
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 1.0,
        fill: { color: '312E81' }
      });

      slide.addText('Revision Flashcards', {
        x: 0.8,
        y: 0.2,
        w: 10,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });

      chunk.forEach((card, idx) => {
        const cardY = 1.3 + idx * 2.8;

        // Question Box
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: 0.8,
          y: cardY,
          w: 11.73,
          h: 1.2,
          fill: { color: 'EEF2FF' },
          line: { color: 'C7D2FE', width: 1 }
        });

        slide.addText(`Q: ${card.question}`, {
          x: 1.1,
          y: cardY + 0.15,
          w: 11.1,
          h: 0.9,
          fontSize: 15,
          bold: true,
          color: '3730A3',
          valign: 'middle'
        });

        // Answer Box
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: 0.8,
          y: cardY + 1.35,
          w: 11.73,
          h: 1.2,
          fill: { color: 'ECFDF5' },
          line: { color: 'A7F3D0', width: 1 }
        });

        slide.addText(`A: ${card.answer}`, {
          x: 1.1,
          y: cardY + 1.5,
          w: 11.1,
          h: 0.9,
          fontSize: 14,
          color: '065F46',
          valign: 'middle'
        });
      });
    }
  }

  // --- SLIDE 4: MCQ Quiz Slides ---
  if (quizzes && quizzes.length > 0) {
    quizzes.forEach((quiz, qIdx) => {
      const slide = pptx.addSlide();
      slide.background = { color: SLATE_BG };

      // Header Bar
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 1.0,
        fill: { color: '065F46' }
      });

      slide.addText(`Quiz Check (${qIdx + 1}/${quizzes.length})`, {
        x: 0.8,
        y: 0.2,
        w: 10,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });

      // Question Title
      slide.addText(`${qIdx + 1}. ${quiz.question}`, {
        x: 0.8,
        y: 1.2,
        w: 11.73,
        h: 0.9,
        fontSize: 18,
        bold: true,
        color: TEXT_DARK,
        valign: 'middle'
      });

      // Options
      if (quiz.options) {
        quiz.options.forEach((opt, optIdx) => {
          const isCorrect = opt === quiz.answer;
          const optY = 2.2 + optIdx * 1.0;

          slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
            x: 0.8,
            y: optY,
            w: 11.73,
            h: 0.85,
            fill: { color: isCorrect ? 'D1FAE5' : 'FFFFFF' },
            line: { color: isCorrect ? '10B981' : 'CBD5E1', width: isCorrect ? 2 : 1 }
          });

          const prefix = String.fromCharCode(65 + optIdx);
          slide.addText(`${prefix}. ${opt} ${isCorrect ? ' (Correct Answer ✓)' : ''}`, {
            x: 1.2,
            y: optY + 0.1,
            w: 11.0,
            h: 0.65,
            fontSize: 14,
            bold: isCorrect,
            color: isCorrect ? '047857' : '334155',
            valign: 'middle'
          });
        });
      }
    });
  }

  // --- FINAL SLIDE: End Slide ---
  const endSlide = pptx.addSlide();
  endSlide.background = { color: INDIGO_DARK };

  endSlide.addText('Great Job on Revising!', {
    x: 0.8,
    y: 2.5,
    w: 11.73,
    h: 1.2,
    fontSize: 36,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  });

  endSlide.addText('Keep testing your knowledge with AI Study Assistant', {
    x: 0.8,
    y: 3.8,
    w: 11.73,
    h: 0.6,
    fontSize: 18,
    color: 'A5B4FC',
    align: 'center'
  });

  // Save presentation
  const filename = `${sanitizeFilename(title)}_Presentation.pptx`;
  pptx.writeFile({ fileName: filename });
};

/**
 * Export Study Summary as a Visual Mind Map PDF
 */
export const exportMindMapToPDF = ({ title = 'Study Note', summary = [] }) => {
  const jsPDFClass = typeof jsPDF === 'function' ? jsPDF : (jsPDF.jsPDF || jsPDF.default || jsPDF);
  const doc = new jsPDFClass({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title Header Banner
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`🧠 MIND MAP: ${title.toUpperCase()}`, pageWidth / 2, 32, { align: 'center' });

  // Center Node Position
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2 + 10;
  const centerW = 180;
  const centerH = 50;

  const colors = [
    [244, 63, 94],  // Rose
    [16, 185, 129], // Emerald
    [245, 158, 11], // Amber
    [6, 182, 212]   // Cyan
  ];

  // Chunk summary items into 4 main branch pillars
  const branchCount = Math.min(summary.length, 4);
  const branchCoords = [
    { x: 140, y: 120, w: 230, h: 180 },
    { x: 470, y: 120, w: 230, h: 180 },
    { x: 140, y: 340, w: 230, h: 180 },
    { x: 470, y: 340, w: 230, h: 180 }
  ];

  for (let i = 0; i < branchCount; i++) {
    const coords = branchCoords[i];
    const color = colors[i % colors.length];

    // Connecting Line
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(3);
    doc.line(centerX, centerY, coords.x + coords.w / 2, coords.y + coords.h / 2);
  }

  // Draw Center Node
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(centerX - centerW / 2, centerY - centerH / 2, centerW, centerH, 12, 12, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.roundedRect(centerX - centerW / 2, centerY - centerH / 2, centerW, centerH, 12, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(doc.splitTextToSize(title, centerW - 20), centerX, centerY, { align: 'center' });

  // Draw Branch Cards
  for (let i = 0; i < branchCount; i++) {
    const coords = branchCoords[i];
    const color = colors[i % colors.length];
    const itemText = summary[i];

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(coords.x, coords.y, coords.w, coords.h, 10, 10, 'F');
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(2);
    doc.roundedRect(coords.x, coords.y, coords.w, coords.h, 10, 10, 'S');

    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(coords.x, coords.y, coords.w, 32, 10, 10, 'F');
    doc.rect(coords.x, coords.y + 20, coords.w, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`Pillar 0${i + 1}`, coords.x + 10, coords.y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    const lines = doc.splitTextToSize(itemText, coords.w - 20);
    lines.forEach((l, lIdx) => {
      doc.text(l, coords.x + 12, coords.y + 55 + lIdx * 14);
    });
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("AI Study Assistant • Mind Map Study Sheet", pageWidth / 2, pageHeight - 15, { align: 'center' });

  const filename = `${sanitizeFilename(title)}_MindMap.pdf`;
  doc.save(filename);
};

