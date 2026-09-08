import jspdfPkg from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

const jsPDF = jspdfPkg.jsPDF || jspdfPkg.default || jspdfPkg;

const title = "AI Study Assistant - Visual Study Mind Map";

const mindmapData = {
  center: "AI STUDY ASSISTANT",
  branches: [
    {
      title: "1. Input & Processing",
      color: [244, 63, 94], // Rose
      colorHex: "F43F5E",
      bgHex: "FFF1F2",
      nodes: [
        "PDF Note Upload (Lectures & Textbooks)",
        "AI Extraction (Gemini / OpenAI API)",
        "Automated Parsing (pdf-parse & Multer)"
      ]
    },
    {
      title: "2. Core Study Aids",
      color: [16, 185, 129], // Emerald
      colorHex: "10B981",
      bgHex: "ECFDF5",
      nodes: [
        "Key Concept Summaries (Essential formulas & definitions)",
        "Active Recall Flashcards (Q&A pairs)",
        "MCQ Quizzes (Multiple choice self-tests)"
      ]
    },
    {
      title: "3. Learning Science",
      color: [245, 158, 11], // Amber
      colorHex: "F59E0B",
      bgHex: "FFFBEB",
      nodes: [
        "Active Recall (Stimulates active memory retrieval)",
        "Spaced Repetition (Combats forgetting curve over time)",
        "Immediate Feedback (Identifies knowledge gaps instantly)"
      ]
    },
    {
      title: "4. System Architecture",
      color: [6, 182, 212], // Cyan
      colorHex: "06B6D4",
      bgHex: "ECFEFF",
      nodes: [
        "Frontend: React 19 + Vite + Tailwind CSS",
        "Backend: Node.js + Express + MongoDB Atlas",
        "DevOps: Docker Containers + Nginx + GitHub Actions CI/CD"
      ]
    }
  ]
};

// --- 1. Generate PDF Mind Map ---
function generatePDF(outputPath) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' }); // Landscape format for mindmap
  const pageWidth = doc.internal.pageSize.getWidth(); // 841.89
  const pageHeight = doc.internal.pageSize.getHeight(); // 595.28

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title Header Banner
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("🧠 AI STUDY ASSISTANT — VISUAL MIND MAP", pageWidth / 2, 32, { align: 'center' });

  // Center Node Position
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2 + 10;
  const centerW = 180;
  const centerH = 50;

  // Branch Positions (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
  const branchCoords = [
    { x: 140, y: 120, w: 230, h: 180 }, // Top-Left
    { x: 470, y: 120, w: 230, h: 180 }, // Top-Right
    { x: 140, y: 340, w: 230, h: 180 }, // Bottom-Left
    { x: 470, y: 340, w: 230, h: 180 }  // Bottom-Right
  ];

  // Draw Lines Connecting Center to Branches
  mindmapData.branches.forEach((b, idx) => {
    const coords = branchCoords[idx];
    const targetX = coords.x + coords.w / 2;
    const targetY = coords.y + coords.h / 2;

    doc.setDrawColor(b.color[0], b.color[1], b.color[2]);
    doc.setLineWidth(3);
    doc.line(centerX, centerY, targetX, targetY);
  });

  // Draw Center Node (On top of lines)
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(centerX - centerW / 2, centerY - centerH / 2, centerW, centerH, 12, 12, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.roundedRect(centerX - centerW / 2, centerY - centerH / 2, centerW, centerH, 12, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(mindmapData.center, centerX, centerY + 5, { align: 'center' });

  // Draw Branch Cards
  mindmapData.branches.forEach((branch, idx) => {
    const coords = branchCoords[idx];

    // Branch Container Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(coords.x, coords.y, coords.w, coords.h, 10, 10, 'F');
    doc.setDrawColor(branch.color[0], branch.color[1], branch.color[2]);
    doc.setLineWidth(2);
    doc.roundedRect(coords.x, coords.y, coords.w, coords.h, 10, 10, 'S');

    // Header Bar
    doc.setFillColor(branch.color[0], branch.color[1], branch.color[2]);
    doc.roundedRect(coords.x, coords.y, coords.w, 32, 10, 10, 'F');
    doc.rect(coords.x, coords.y + 20, coords.w, 12, 'F'); // Square bottom corners

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(branch.title, coords.x + 10, coords.y + 20);

    // Nodes (Sub-bullets)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    branch.nodes.forEach((nodeText, nIdx) => {
      const nodeY = coords.y + 50 + nIdx * 42;

      // Small bullet dot
      doc.setFillColor(branch.color[0], branch.color[1], branch.color[2]);
      doc.circle(coords.x + 18, nodeY + 5, 3.5, 'F');

      // Wrapped node text
      const lines = doc.splitTextToSize(nodeText, coords.w - 32);
      lines.forEach((l, lIdx) => {
        doc.text(l, coords.x + 28, nodeY + 8 + lIdx * 11);
      });
    });
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("AI Study Assistant • Mind Map Study Sheet • Clear & Simple English", pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save PDF
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log(`Successfully generated Mind Map PDF at: ${outputPath}`);
}

// --- 2. Generate PPTX Mind Map ---
async function generatePPTX(outputPath) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'AI Study Assistant';
  pptx.title = title;

  // --- SLIDE 1: Title Slide ---
  const s1 = pptx.addSlide();
  s1.background = { color: '1E1B4B' };

  s1.addText('🧠 AI Study Assistant', {
    x: 0.8, y: 2.0, w: 11.5, h: 1.2,
    fontSize: 38, bold: true, color: 'FFFFFF', valign: 'middle'
  });

  s1.addText('Visual Mind Map & Revision Breakdown', {
    x: 0.8, y: 3.4, w: 11.5, h: 0.6,
    fontSize: 20, color: 'A5B4FC'
  });

  s1.addText('Easy-to-Study Diagrammatic Summary • Clear English', {
    x: 0.8, y: 6.5, w: 11.5, h: 0.4,
    fontSize: 12, color: '818CF8'
  });

  // --- SLIDE 2: Master Mind Map Diagram Slide ---
  const s2 = pptx.addSlide();
  s2.background = { color: 'F8FAFC' };

  // Header Bar
  s2.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: '4F46E5' } });
  s2.addText('Master Mind Map Overview', { x: 0.8, y: 0.15, w: 10, h: 0.6, fontSize: 22, bold: true, color: 'FFFFFF' });

  // Center Node Box
  s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.16, y: 3.2, w: 3.0, h: 1.2,
    fill: { color: '4F46E5' },
    line: { color: 'FFFFFF', width: 2 }
  });
  s2.addText('AI STUDY\nASSISTANT', {
    x: 5.16, y: 3.2, w: 3.0, h: 1.2,
    fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
  });

  // Branch Card Coordinates (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
  const pptxBranchCoords = [
    { x: 0.8, y: 1.2, w: 4.0, h: 2.5 },  // Top Left
    { x: 8.53, y: 1.2, w: 4.0, h: 2.5 }, // Top Right
    { x: 0.8, y: 4.3, w: 4.0, h: 2.5 },  // Bottom Left
    { x: 8.53, y: 4.3, w: 4.0, h: 2.5 }  // Bottom Right
  ];

  mindmapData.branches.forEach((branch, idx) => {
    const coords = pptxBranchCoords[idx];

    // Branch Card Shape
    s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: coords.x, y: coords.y, w: coords.w, h: coords.h,
      fill: { color: 'FFFFFF' },
      line: { color: branch.colorHex, width: 2 }
    });

    // Branch Header Box
    s2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: coords.x, y: coords.y, w: coords.w, h: 0.5,
      fill: { color: branch.colorHex }
    });
    s2.addText(branch.title, {
      x: coords.x + 0.1, y: coords.y, w: coords.w - 0.2, h: 0.5,
      fontSize: 13, bold: true, color: 'FFFFFF', valign: 'middle'
    });

    // Subtopic Nodes
    branch.nodes.forEach((nodeText, nIdx) => {
      const nodeY = coords.y + 0.65 + nIdx * 0.58;

      s2.addShape(pptx.shapes.OVAL, {
        x: coords.x + 0.2, y: nodeY + 0.1, w: 0.15, h: 0.15,
        fill: { color: branch.colorHex }
      });

      s2.addText(nodeText, {
        x: coords.x + 0.45, y: nodeY, w: coords.w - 0.55, h: 0.55,
        fontSize: 10, color: '1E293B', valign: 'middle'
      });
    });
  });

  // --- SLIDES 3-6: Detailed Branch Slides ---
  mindmapData.branches.forEach((branch, idx) => {
    const s = pptx.addSlide();
    s.background = { color: 'F8FAFC' };

    // Header
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: branch.colorHex } });
    s.addText(`Mind Map Branch: ${branch.title}`, {
      x: 0.8, y: 0.2, w: 11, h: 0.6, fontSize: 22, bold: true, color: 'FFFFFF'
    });

    // Left Column: Central Node Connection Card
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.4, w: 3.5, h: 5.2,
      fill: { color: 'FFFFFF' }, line: { color: branch.colorHex, width: 2 }
    });

    s.addShape(pptx.shapes.OVAL, {
      x: 1.8, y: 1.8, w: 1.5, h: 1.5,
      fill: { color: branch.colorHex }
    });
    s.addText(`Branch\n0${idx + 1}`, {
      x: 1.8, y: 1.8, w: 1.5, h: 1.5,
      fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
    });

    s.addText(branch.title, {
      x: 1.0, y: 3.6, w: 3.1, h: 1.0,
      fontSize: 18, bold: true, color: '0F172A', align: 'center'
    });

    s.addText('Core revision pillar of the AI Study Assistant.', {
      x: 1.0, y: 4.8, w: 3.1, h: 1.0,
      fontSize: 12, color: '64748B', align: 'center'
    });

    // Right Column: Child Mind Map Cards
    branch.nodes.forEach((nodeText, nIdx) => {
      const topY = 1.4 + nIdx * 1.65;

      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 4.7, y: topY, w: 7.8, h: 1.45,
        fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 }
      });

      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 4.7, y: topY, w: 0.6, h: 1.45,
        fill: { color: branch.colorHex }
      });

      s.addText(`${nIdx + 1}`, {
        x: 4.7, y: topY, w: 0.6, h: 1.45,
        fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
      });

      s.addText(nodeText, {
        x: 5.5, y: topY + 0.1, w: 6.8, h: 1.25,
        fontSize: 15, bold: true, color: '1E293B', valign: 'middle'
      });
    });
  });

  await pptx.writeFile({ fileName: outputPath });
  console.log(`Successfully generated Mind Map PPTX at: ${outputPath}`);
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

console.log("All mind map study summary files updated successfully!");
