import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default async function handler(req, res) {
  try {
    const {
      name,
      group,
      test,
      score,
      total,
      timeTaken,
      percentage,
      result,
      attempted,
      notAttempted
    } = req.query;

    const doc = new jsPDF();
    
    // Color scheme
    const colors = {
      primary: '#2563eb',      // Blue
      secondary: '#1e40af',    // Dark blue
      success: '#16a34a',      // Green
      warning: '#d97706',      // Orange
      danger: '#dc2626',       // Red
      light: '#f8fafc',        // Light gray
      dark: '#1e293b',         // Dark gray
      text: '#374151'          // Medium gray
    };

    // Helper function to get result color
    const getResultColor = (result) => {
      if (result?.toLowerCase().includes('pass') || result?.toLowerCase().includes('excellent')) {
        return colors.success;
      } else if (result?.toLowerCase().includes('good') || result?.toLowerCase().includes('average')) {
        return colors.warning;
      } else {
        return colors.danger;
      }
    };

    // Add header background
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, 210, 35, 'F');

    // Title with white text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("Quiz Results Summary", 105, 22, { align: "center" });

    // Reset text color
    doc.setTextColor(colors.text);

    // Student Information Section
    doc.setFillColor(colors.light);
    doc.rect(15, 45, 180, 60, 'F');
    
    // Section header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary);
    doc.text("Student Information", 20, 55);

    // Student details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.text);
    
    const studentInfo = [
      { label: 'UserName:', value: decodeURIComponent(name) },
      { label: 'Group:', value: decodeURIComponent(group) },
      { label: 'Test:', value: decodeURIComponent(test) },
      { label: 'Time Taken:', value: timeTaken }
    ];

    studentInfo.forEach((info, index) => {
      const yPos = 70 + (index * 10);
      doc.setFont('helvetica', 'bold');
      doc.text(info.label, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(info.value, 75, yPos);
    });

    // Results Summary Section
    const startY = 120;
    
    // Score highlight box
    const scorePercentage = parseFloat(percentage);
    const scoreColor = scorePercentage >= 80 ? colors.success : 
                      scorePercentage >= 60 ? colors.warning : colors.danger;
    
    doc.setFillColor(scoreColor);
    doc.rect(15, startY - 5, 180, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Final Score: ${score}/${total} (${percentage}%)`, 105, startY + 8, { align: "center" });

    // Results Table with enhanced styling
    autoTable(doc, {
      startY: startY + 30,
      head: [["Metric", "Value", "Details"]],
      body: [
        ["Total Questions", total, "Questions in the quiz"],
        ["Attempted", attempted, "Questions you answered"],
        ["Not Attempted", notAttempted, "Questions you skipped"],
        ["Correct Answers", score, "Your correct responses"],
        ["Accuracy", `${percentage}%`, "Percentage of correct answers"],
        ["Final Result", result, "Overall performance"]
      ],
      headStyles: {
        fillColor: [37, 99, 235], // Primary blue
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11,
        textColor: [55, 65, 81],
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [241, 245, 249] },
        1: { halign: 'center', fontStyle: 'bold' },
        2: { fontSize: 10, textColor: [107, 114, 128] }
      },
      margin: { left: 15, right: 15 },
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.5
    });

    // Performance Analysis
    const tableEndY = doc.lastAutoTable.finalY + 20;
    
    doc.setFillColor(colors.light);
    doc.rect(15, tableEndY, 180, 35, 'F');
    
    doc.setTextColor(colors.secondary);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Performance Analysis", 20, tableEndY + 12);

    doc.setTextColor(colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let analysis = "";
    if (scorePercentage >= 90) {
      analysis = "Excellent performance! You've mastered this topic.";
    } else if (scorePercentage >= 80) {
      analysis = "Great job! You have a strong understanding of the material.";
    } else if (scorePercentage >= 70) {
      analysis = "Good work! Consider reviewing the topics you missed.";
    } else if (scorePercentage >= 60) {
      analysis = "Keep practicing! Focus on areas that need improvement.";
    } else {
      analysis = "Additional study recommended. Review the material thoroughly.";
    }
    
    doc.text(analysis, 20, tableEndY + 25);

    // Footer with gradient-like effect
    const footerY = doc.internal.pageSize.height - 25;
    doc.setFillColor(colors.primary);
    doc.rect(0, footerY, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const currentDate = new Date().toLocaleString();
    doc.text(`📅 Generated on: ${currentDate}`, 20, footerY + 10);
    doc.text(`🎯 Quiz Management System`, 20, footerY + 18);
    
    // Add watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');

    // Output as Blob
    const pdfData = doc.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${decodeURIComponent(name)}_Quiz_Results.pdf"`);
    res.status(200).send(Buffer.from(pdfData));

  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}