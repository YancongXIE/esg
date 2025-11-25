import * as React from 'react';
import { Typography, Button, Grid, Box, TextField, MenuItem, Select, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput, Card, CardContent, useTheme, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { fetchESGReportData, fetchComplianceAnalysis, fetchRecommendations, sendReportToServer } from '../services/apiService';
import LLMRecommendations from './LLMRecommendations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

const metricsOptions = ['Metric 1', 'Metric 2', 'Metric 3'];
const esgOptions = ['GRI', 'AASB S2', 'AASB Sscope 3'];

// Data processing function
const processData = (data) => {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    console.error('Invalid data structure:', data);
    return {};
  }
  
  const results = {};
  
  // Iterate through each category (metric and standard)
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    
    // Validate category data
    if (!categoryData || typeof categoryData !== 'object') {
      console.warn(`Invalid category data for ${category}:`, categoryData);
      return;
    }
    
    results[category] = {};
    
    // Iterate through each subcategory
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      
      // Validate subcategory data
      if (!subCategoryData || typeof subCategoryData !== 'object') {
        console.warn(`Invalid subcategory data for ${category}/${subCategory}:`, subCategoryData);
        return;
      }
      
      let totalCriteria = 0;
      let compliantCriteria = 0;
      
      // Iterate through each standard
      Object.keys(subCategoryData).forEach(criterion => {
        const criterionData = subCategoryData[criterion];
        
        // Skip if criterion data is None/null
        if (criterionData === null || criterionData === undefined) {
          return;
        }
        
        // Validate criterion data format
        if (!criterionData) {
          console.warn(`Invalid criterion data for ${category}/${subCategory}/${criterion}:`, criterionData);
          return;
        }
        
        // Handle different data formats
        let result, details;
        if (Array.isArray(criterionData)) {
          // Handle array format: ['criteria_name', 'result', 'details', 'value']
          if (criterionData.length >= 2) {
            [, result] = criterionData; // Skip criteria name, get result
          } else {
            result = criterionData[0];
          }
        } else if (typeof criterionData === 'object') {
          result = criterionData.compliance || criterionData.result;
          details = criterionData.text || criterionData.details;
        } else {
          result = criterionData;
          details = '';
        }
        
        if (result !== undefined && result !== null) {
          totalCriteria++;
          
          // Check for compliant results - "yes" and "few" are compliant with weight 1
          const resultLower = result.toLowerCase();
          if (resultLower === 'yes' || resultLower === 'few') {
            compliantCriteria++;
          }
          // "no" is not compliant (0 weight)
        }
      });
      
      // Only add subcategory if it has valid criteria
      if (totalCriteria > 0) {
        results[category][subCategory] = {
          total: totalCriteria,
          compliant: compliantCriteria,
          ratio: `${compliantCriteria} out of ${totalCriteria}`
        };
      }
    });
  });
  
  return results;
};

// Calculate compliance rate
const calculateComplianceRate = (data) => {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    console.error('Invalid data structure in calculateComplianceRate:', data);
    return 0;
  }
  
  let totalCriteria = 0;
  let compliantCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    
    // Validate category data
    if (!categoryData || typeof categoryData !== 'object') {
      console.warn(`Invalid category data for ${category}:`, categoryData);
      return;
    }
    
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      
      // Validate subcategory data
      if (!subCategoryData || typeof subCategoryData !== 'object') {
        console.warn(`Invalid subcategory data for ${category}/${subCategory}:`, subCategoryData);
        return;
      }
      
      Object.keys(subCategoryData).forEach(criterion => {
        const criterionData = subCategoryData[criterion];
        
        // Skip if criterion data is None/null
        if (criterionData === null || criterionData === undefined) {
          return;
        }
        
        // Validate criterion data format
        if (!criterionData) {
          console.warn(`Invalid criterion data for ${category}/${subCategory}/${criterion}:`, criterionData);
          return;
        }
        
        // Handle different data formats
        let result, details;
        if (Array.isArray(criterionData)) {
          // Handle array format: ['criteria_name', 'result', 'details', 'value']
          if (criterionData.length >= 2) {
            [, result] = criterionData; // Skip criteria name, get result
          } else {
            result = criterionData[0];
          }
        } else if (typeof criterionData === 'object') {
          result = criterionData.compliance || criterionData.result;
          details = criterionData.text || criterionData.details;
        } else {
          result = criterionData;
          details = '';
        }
        
        if (result !== undefined && result !== null) {
          totalCriteria++;
          const resultLower = result.toLowerCase();
          if (resultLower === 'yes' || resultLower === 'few') {
            // Both "yes" and "few" are compliant with weight 1
            compliantCriteria++;
          }
        }
      });
    });
  });
  
  return totalCriteria > 0 ? Math.round((compliantCriteria / totalCriteria) * 100) : 0;
};

// Calculate greenwashing risk (based on "Few" and "No" result ratios)
const calculateGreenwashingRisk = (data) => {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    console.error('Invalid data structure in calculateGreenwashingRisk:', data);
    return 0;
  }
  
  let totalCriteria = 0;
  let riskCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    
    // Validate category data
    if (!categoryData || typeof categoryData !== 'object') {
      console.warn(`Invalid category data for ${category}:`, categoryData);
      return;
    }
    
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      
      // Validate subcategory data
      if (!subCategoryData || typeof subCategoryData !== 'object') {
        console.warn(`Invalid subcategory data for ${category}/${subCategory}:`, subCategoryData);
        return;
      }
      
      Object.keys(subCategoryData).forEach(criterion => {
        const criterionData = subCategoryData[criterion];
        
        // Skip if criterion data is None/null
        if (criterionData === null || criterionData === undefined) {
          return;
        }
        
        // Validate criterion data format
        if (!criterionData) {
          console.warn(`Invalid criterion data for ${category}/${subCategory}/${criterion}:`, criterionData);
          return;
        }
        
        // Handle different data formats
        let result, details;
        if (Array.isArray(criterionData)) {
          // Handle array format: ['criteria_name', 'result', 'details', 'value']
          if (criterionData.length >= 2) {
            [, result] = criterionData; // Skip criteria name, get result
          } else {
            result = criterionData[0];
          }
        } else if (typeof criterionData === 'object') {
          result = criterionData.compliance || criterionData.result;
          details = criterionData.text || criterionData.details;
        } else {
          result = criterionData;
          details = '';
        }
        
        if (result !== undefined && result !== null) {
          totalCriteria++;
          const resultLower = result.toLowerCase();
          if (resultLower === 'no') {
            // Only "no" is considered a risk
            riskCriteria++;
          }
        }
      });
    });
  });
  
  return totalCriteria > 0 ? Math.round((riskCriteria / totalCriteria) * 100 * 10) / 10 : 0;
};

// Data mapping function - map category names from JSON to display names
const mapCategoryToDisplay = (categoryName) => {
  const mapping = {
    'Scope': 'Scope',
    'Governance': 'Governance',
    'Strategy': 'Strategy',
    'Climate-related risk and opportunities': 'Climate-related Risk and Opportunities',
    'Business model and value chain': 'Business Model and Value Chain',
    'Strategy and decision-making': 'Strategy and Decision Making',
    'Financial position, financial performance and cash flows': 'Financial Position and Financial Performance',
    'Climate resilience': 'Climate Resilience',
    'Risk Management': 'Risk Management',
    'Metrics and Targets': 'Metrics and Targets',
    'Climate-related metrics': 'Climate-related Metrics',
    'Climate-related targets': 'Climate-related Targets'
  };
  
  return mapping[categoryName] || categoryName;
};

export default function ESGdashboardContent() {
  const theme = useTheme();
  const [metrics, setMetrics] = React.useState([]);
  const [esg, setEsg] = React.useState([]);
  const [date1, setDate1] = React.useState('2023-05-23');
  const [date2, setDate2] = React.useState('2023-07-16');
  
  // File upload status
  const [uploadedFile, setUploadedFile] = React.useState(null);
  const [uploadedMetricsFile, setUploadedMetricsFile] = React.useState(null);
  
  // Data state
  const [esgData, setEsgData] = React.useState(null);
  const [complianceData, setComplianceData] = React.useState(null);
  
  // Verification status
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationError, setVerificationError] = React.useState(null);
  
  // Detail dialog state
  const [detailDialog, setDetailDialog] = React.useState({
    open: false,
    title: '',
    content: ''
  });

  // Filter state
  const [filters, setFilters] = React.useState({
    category: '',
    criteria: '',
    result: ''
  });

  // Card selection state for filtering
  const [selectedCard, setSelectedCard] = React.useState(null);

  // Monitor filter changes
  React.useEffect(() => {
    // Filter state changed
  }, [filters, selectedCard]);

  // Handle file upload
  const handleFileUpload = (file, type) => {
    if (type === 'pdf') {
      setUploadedFile(file);
    } else if (type === 'metrics') {
      setUploadedMetricsFile(file);
    }
  };

  // Handle verify report
  const handleVerifyReport = async () => {
    if (!uploadedFile) {
      setVerificationError('Please upload a PDF report');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      let result;
      
      if (uploadedMetricsFile) {
        // Send both PDF and custom metrics
        result = await sendReportToServer(uploadedFile, uploadedMetricsFile);
      } else {
        // Send only PDF with built-in standard criteria
        result = await sendReportToServer(uploadedFile, null);
      }
      
      if (result.success) {
        // Extract the actual data from the server response
        // Server returns: { standard: {...} } or { results: { standard: {...} } }
        const serverData = result.data;
        
        // Check if data has the expected structure
        if (serverData && typeof serverData === 'object') {
          // Use the data directly (server returns {standard: {...}})
          const processedData = serverData;
          
          // Process returned data
          setEsgData(processedData);
          
          // Calculate compliance data
          const complianceResult = calculateComplianceFromData(processedData);
          setComplianceData(complianceResult);
        } else {
          console.error('Invalid data structure received from server:', serverData);
          setVerificationError('Invalid data structure received from server');
        }
      } else {
        console.error('Server returned error:', result.error);
        setVerificationError(result.error || 'Failed to verify report');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError(error.message || 'An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  // Generate and download PDF report
  const generatePDFReport = () => {
    console.log('PDF generation started');
    console.log('esgData:', esgData);
    console.log('complianceData:', complianceData);
    
    if (!esgData || !complianceData) {
      console.error('Missing data for PDF generation');
      alert('No analysis data available. Please run the analysis first.');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ESG Verification Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString();
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Summary section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Overall Compliance Rate: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.complianceRate}%`, margin + 85, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text('Greenwashing Risk: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.greenwashingRisk}%`, margin + 65, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text('Total Criteria: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.totalCriteria}`, margin + 55, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text('Compliant Criteria: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.compliantCriteria}`, margin + 70, yPosition);
      yPosition += 20;

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      // Category-wise Summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Category-wise Summary', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Get processed data for category summary
      const processedData = processData(esgData);
      Object.keys(processedData).forEach(category => {
        const categoryData = processedData[category];
        Object.keys(categoryData).forEach(subCategory => {
          const summary = categoryData[subCategory];
          if (summary && summary.ratio) {
            // Split the ratio to highlight numbers
            const ratioParts = summary.ratio.split(' out of ');
            if (ratioParts.length === 2) {
              const categoryText = `${mapCategoryToDisplay(category)} - ${subCategory}`;
              
              // Check if text is too long and needs to be split
              if (categoryText.length > 50) {
                // Split long text into multiple lines
                const words = categoryText.split(' ');
                let line1 = '';
                let line2 = '';
                
                for (let i = 0; i < words.length; i++) {
                  if (i < words.length / 2) {
                    line1 += words[i] + ' ';
                  } else {
                    line2 += words[i] + ' ';
                  }
                }
                
                // First line
                doc.text(line1.trim(), margin, yPosition);
                yPosition += 6;
                
                // Second line with numbers
                doc.text(line2.trim() + ': ', margin, yPosition);
                doc.setFont('helvetica', 'bold');
                doc.text(`${ratioParts[0]} out of `, margin + 120, yPosition);
                doc.text(ratioParts[1], margin + 140, yPosition);
                doc.setFont('helvetica', 'normal');
              } else {
                // Short text, single line
                doc.text(categoryText + ': ', margin, yPosition);
                doc.setFont('helvetica', 'bold');
                doc.text(`${ratioParts[0]} out of `, margin + 120, yPosition);
                doc.text(ratioParts[1], margin + 140, yPosition);
                doc.setFont('helvetica', 'normal');
              }
            } else {
              doc.text(`${mapCategoryToDisplay(category)} - ${subCategory}: ${summary.ratio}`, margin, yPosition);
            }
            yPosition += 8;
          }
        });
      });
      yPosition += 15;

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      // AASB S2 and Materiality Matrix section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AASB S2 and Materiality Matrix', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('This section provides analysis of AASB S2 compliance and materiality assessment.', margin, yPosition);
      yPosition += 10;
      doc.text('For detailed materiality matrix and heatmap visualization, please refer to the dashboard.', margin, yPosition);
      yPosition += 20;

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      // AI Recommendations section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AI-Powered Recommendations', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Based on the comprehensive ESG analysis, here are detailed recommendations:', margin, yPosition);
      yPosition += 10;
      
      // Add detailed recommendations based on compliance rate
      if (complianceData.overall.complianceRate < 50) {
        doc.setFont('helvetica', 'bold');
        doc.text('CRITICAL PRIORITY - Immediate Action Required:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text('• Implement comprehensive ESG reporting framework immediately', margin, yPosition);
        yPosition += 6;
        doc.text('• Establish dedicated ESG team and governance structure', margin, yPosition);
        yPosition += 6;
        doc.text('• Conduct gap analysis to identify specific compliance deficiencies', margin, yPosition);
        yPosition += 6;
        doc.text('• Develop action plan with clear timelines and responsibilities', margin, yPosition);
        yPosition += 6;
        doc.text('• Consider engaging external ESG consultants for expertise', margin, yPosition);
        yPosition += 6;
        doc.text('• Implement regular ESG training for all staff levels', margin, yPosition);
        yPosition += 10;
      } else if (complianceData.overall.complianceRate < 80) {
        doc.setFont('helvetica', 'bold');
        doc.text('IMPROVEMENT PRIORITY - Focus on Specific Areas:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text('• Identify and address specific ESG criteria with low compliance', margin, yPosition);
        yPosition += 6;
        doc.text('• Enhance data collection and reporting processes', margin, yPosition);
        yPosition += 6;
        doc.text('• Strengthen ESG risk management and monitoring systems', margin, yPosition);
        yPosition += 6;
        doc.text('• Improve stakeholder engagement and communication strategies', margin, yPosition);
        yPosition += 6;
        doc.text('• Consider setting up ESG performance metrics and KPIs', margin, yPosition);
        yPosition += 6;
        doc.text('• Review and update ESG policies and procedures', margin, yPosition);
        yPosition += 10;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text('EXCELLENCE MAINTENANCE - Advanced ESG Initiatives:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text('• Maintain high ESG standards and continue monitoring', margin, yPosition);
        yPosition += 6;
        doc.text('• Consider advanced ESG initiatives and stakeholder engagement', margin, yPosition);
        yPosition += 6;
        doc.text('• Explore innovative sustainability practices and technologies', margin, yPosition);
        yPosition += 6;
        doc.text('• Lead industry best practices and share knowledge', margin, yPosition);
        yPosition += 6;
        doc.text('• Consider ESG certification and third-party verification', margin, yPosition);
        yPosition += 6;
        doc.text('• Develop long-term sustainability strategy and roadmap', margin, yPosition);
        yPosition += 10;
      }
      
      // Add general recommendations for all compliance levels
      doc.setFont('helvetica', 'bold');
      doc.text('GENERAL RECOMMENDATIONS FOR ALL ORGANIZATIONS:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('• Regular review and updates of ESG policies (quarterly recommended)', margin, yPosition);
      yPosition += 6;
      doc.text('• Consider third-party ESG verification for enhanced credibility', margin, yPosition);
      yPosition += 6;
      doc.text('• Implement ESG performance tracking and reporting systems', margin, yPosition);
      yPosition += 6;
      doc.text('• Develop ESG communication strategy for stakeholders', margin, yPosition);
      yPosition += 6;
      doc.text('• Stay updated with evolving ESG standards and regulations', margin, yPosition);
      yPosition += 6;
      doc.text('• Integrate ESG considerations into business strategy and decision-making', margin, yPosition);
      yPosition += 6;
      doc.text('• Establish ESG risk assessment and mitigation procedures', margin, yPosition);
      yPosition += 6;
      doc.text('• Consider ESG impact on financial performance and valuation', margin, yPosition);
      yPosition += 10;
      
      // Add specific recommendations based on greenwashing risk
      if (complianceData.overall.greenwashingRisk > 20) {
        doc.setFont('helvetica', 'bold');
        doc.text('GREENWASHING RISK MITIGATION:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text('• Ensure all ESG claims are substantiated with evidence', margin, yPosition);
        yPosition += 6;
        doc.text('• Implement transparent reporting and disclosure practices', margin, yPosition);
        yPosition += 6;
        doc.text('• Avoid overstating ESG achievements or commitments', margin, yPosition);
        yPosition += 6;
        doc.text('• Consider independent ESG verification and certification', margin, yPosition);
        yPosition += 6;
        doc.text('• Develop clear ESG communication guidelines', margin, yPosition);
        yPosition += 10;
      }
      
      // Add technology and AI recommendations
      doc.setFont('helvetica', 'bold');
      doc.text('TECHNOLOGY AND AI ENHANCEMENT:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('• Leverage AI-powered ESG analysis tools for continuous monitoring', margin, yPosition);
      yPosition += 6;
      doc.text('• Implement automated ESG data collection and reporting systems', margin, yPosition);
      yPosition += 6;
      doc.text('• Use predictive analytics for ESG risk assessment', margin, yPosition);
      yPosition += 6;
      doc.text('• Consider blockchain for ESG data transparency and verification', margin, yPosition);
      yPosition += 6;
      doc.text('• Explore ESG-focused fintech solutions and platforms', margin, yPosition);
      yPosition += 20;

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      // Detailed Analysis section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Analysis', margin, yPosition);
      yPosition += 15;

      // Prepare table data
      const tableData = [];
      const filteredData = getFilteredData();
      console.log('filteredData:', filteredData);
      
      Object.keys(filteredData).forEach(category => {
        const categoryData = filteredData[category];
        Object.keys(categoryData).forEach(subCategory => {
          const subCategoryData = categoryData[subCategory];
          Object.keys(subCategoryData).forEach(criterion => {
            const [criteriaName, result, details, value] = subCategoryData[criterion];
            tableData.push([
              mapCategoryToDisplay(category),
              criteriaName || 'N/A',
              result || 'N/A',
              details || 'No details available'
            ]);
          });
        });
      });

      console.log('tableData:', tableData);

      // Add table
      if (tableData.length > 0) {
        try {
          autoTable(doc, {
            startY: yPosition,
            head: [['Category', 'Criteria', 'Result', 'Details']],
            body: tableData,
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold',
            },
            columnStyles: {
              0: { cellWidth: 30 },
              1: { cellWidth: 50 },
              2: { cellWidth: 20 },
              3: { cellWidth: 80 },
            },
            didDrawPage: function (data) {
              // Add page numbers
              doc.setFontSize(10);
              doc.text(
                `Page ${doc.internal.getNumberOfPages()}`,
                pageWidth - margin,
                pageHeight - 10
              );
            },
          });
        } catch (tableError) {
          console.warn('AutoTable failed, using simple text format:', tableError);
          // Fallback to simple text format
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text('Detailed Analysis Results:', margin, yPosition);
          yPosition += 10;
          
          tableData.forEach((row, index) => {
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = 20;
            }
            doc.setFontSize(10);
            doc.text(`${row[0]} - ${row[1]}: ${row[2]}`, margin, yPosition);
            yPosition += 6;
            if (row[3] && row[3] !== 'No details available') {
              doc.setFontSize(8);
              doc.text(`  Details: ${row[3]}`, margin + 5, yPosition);
              yPosition += 5;
            }
            yPosition += 3;
          });
        }
      } else {
        // If no table data, add a message
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('No detailed analysis data available.', margin, yPosition);
      }

      // Download the PDF
      const fileName = `ESG_Verification_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF as:', fileName);
      doc.save(fileName);
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  // Calculate compliance from API returned data
  const calculateComplianceFromData = (data) => {
    // Validate data structure
    if (!data || typeof data !== 'object') {
      console.error('Invalid data structure in calculateComplianceFromData:', data);
      return {
        overall: {
          totalCriteria: 0,
          compliantCriteria: 0,
          complianceRate: 0,
          greenwashingRisk: 0
        }
      };
    }
    
    let totalCriteria = 0;
    let compliantCriteria = 0;
    let riskCriteria = 0;
    
    // Iterate through metric and standard data
    Object.keys(data).forEach(category => {
      const categoryData = data[category];
      
      // Validate category data
      if (!categoryData || typeof categoryData !== 'object') {
        console.warn(`Invalid category data for ${category}:`, categoryData);
        return;
      }
      
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        
        // Validate subcategory data
        if (!subCategoryData || typeof subCategoryData !== 'object') {
          console.warn(`Invalid subcategory data for ${category}/${subCategory}:`, subCategoryData);
          return;
        }
        
        Object.keys(subCategoryData).forEach(criterion => {
          const criterionData = subCategoryData[criterion];
          
          // Skip if criterion data is None/null
          if (criterionData === null || criterionData === undefined) {
            return;
          }
          
          // Validate criterion data format
          if (!criterionData) {
            console.warn(`Invalid criterion data for ${category}/${subCategory}/${criterion}:`, criterionData);
            return;
          }
          
          // Handle different data formats
          let result, details;
          if (Array.isArray(criterionData)) {
            // Handle array format: ['criteria_name', 'result', 'details', 'value']
            if (criterionData.length >= 2) {
              [, result] = criterionData; // Skip criteria name, get result
            } else {
              result = criterionData[0];
            }
          } else if (typeof criterionData === 'object') {
            result = criterionData.compliance || criterionData.result;
            details = criterionData.text || criterionData.details;
          } else {
            result = criterionData;
            details = '';
          }
          
          if (result !== undefined && result !== null) {
            totalCriteria++;
            
            const resultLower = result.toLowerCase();
            if (resultLower === 'yes' || resultLower === 'few') {
              // Both "yes" and "few" are compliant with weight 1
              compliantCriteria++;
            } else if (resultLower === 'no') {
              // Only "no" is considered a risk
              riskCriteria++;
            }
          }
        });
      });
    });
    
    const complianceRate = totalCriteria > 0 ? Math.round((compliantCriteria / totalCriteria) * 100) : 0;
    const greenwashingRisk = totalCriteria > 0 ? Math.round((riskCriteria / totalCriteria) * 100 * 10) / 10 : 0;
    
    return {
      overall: {
        totalCriteria,
        compliantCriteria,
        complianceRate,
        greenwashingRisk
      }
    };
  };

  // Get all unique categories
  const getUniqueCategories = () => {
    if (!esgData) return [];
    return Object.keys(esgData).map(category => mapCategoryToDisplay(category));
  };

  // Get all unique results
  const getUniqueResults = () => {
    if (!esgData) return [];
    const results = new Set();
    Object.keys(esgData).forEach(category => {
      const categoryData = esgData[category];
      
      // Validate category data
      if (!categoryData || typeof categoryData !== 'object') {
        return;
      }
      
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        
        // Validate subcategory data
        if (!subCategoryData || typeof subCategoryData !== 'object') {
          return;
        }
        
        Object.keys(subCategoryData).forEach(criterion => {
          const criterionData = subCategoryData[criterion];
          
          // Skip if criterion data is None/null
          if (criterionData === null || criterionData === undefined) {
            return;
          }
          
          // Handle different data formats
          let result, details;
          if (Array.isArray(criterionData)) {
            // Handle array format: ['criteria_name', 'result', 'details', 'value']
            if (criterionData.length >= 2) {
              [, result] = criterionData; // Skip criteria name, get result
            } else {
              result = criterionData[0];
            }
          } else if (typeof criterionData === 'object') {
            result = criterionData.compliance || criterionData.result;
            details = criterionData.text || criterionData.details;
          } else {
            result = criterionData;
            details = '';
          }
          
          if (result !== undefined && result !== null) {
            results.add(result);
          }
        });
      });
    });
    return Array.from(results).sort();
  };

  // Filter data
  const getFilteredData = () => {
    if (!esgData) return {};
    
    return Object.keys(esgData).reduce((filtered, category) => {
      const categoryData = esgData[category];
      
      // Validate category data
      if (!categoryData || typeof categoryData !== 'object') {
        return filtered;
      }
      
      const filteredCategoryData = {};
      
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        
        // Validate subcategory data
        if (!subCategoryData || typeof subCategoryData !== 'object') {
          return;
        }
        
        const filteredSubCategoryData = {};
        
        Object.keys(subCategoryData).forEach(criterion => {
          const criterionData = subCategoryData[criterion];
          
          // Skip if criterion data is None/null
          if (criterionData === null || criterionData === undefined) {
            return;
          }
          
          // Handle different data formats
          let criteriaName, result, details, value;
          if (Array.isArray(criterionData)) {
            // Handle array format: ['criteria_name', 'result', 'details', 'value']
            if (criterionData.length >= 4) {
              [criteriaName, result, details, value] = criterionData;
            } else if (criterionData.length === 2) {
              [result, details] = criterionData;
              criteriaName = criterion; // Use criterion key as criteria name
            } else {
              result = criterionData[0];
              details = criterionData[1] || '';
              criteriaName = criterion;
            }
          } else if (typeof criterionData === 'object') {
            result = criterionData.compliance || criterionData.result;
            details = criterionData.text || criterionData.details;
            criteriaName = criterion;
          } else {
            result = criterionData;
            details = '';
            criteriaName = criterion;
          }
          
          if (result === undefined || result === null) {
            return;
          }
          
          // Category filter - check both main category and subcategory
          const mappedCategory = mapCategoryToDisplay(category);
          
          // For "standard" category, we need to check if the subcategory matches the card
          if (filters.category === 'standard' && category === 'standard') {
            // Check if this subcategory matches the selected card
            const cardToSubCategoryMap = {
              'Scope': 'Scope',
              'Governance': 'Governance',
              'Strategy': 'Strategy',
              'Climate-related Risk and Opportunities': 'Climate-related risk and opportunities',
              'Business Model and Value Chain': 'Business model and value chain',
              'Strategy and Decision Making': 'Strategy and decision-making',
              'Financial Position and Financial Performance': 'Financial position, financial performance and cash flows',
              'Climate Resilience': 'Climate resilience',
              'Risk Management': 'Risk Management',
              'Metrics and Targets': 'Metrics and Targets',
              'Climate-related Metrics': 'Climate-related metrics',
              'Climate-related Targets': 'Climate-related targets'
            };
            
            const expectedSubCategory = cardToSubCategoryMap[selectedCard];
            if (expectedSubCategory && subCategory !== expectedSubCategory) {
              return;
            }
          } else if (filters.category && mappedCategory !== filters.category) {
            return;
          }
          
          // Criteria filter
          if (filters.criteria && !criteriaName.toLowerCase().includes(filters.criteria.toLowerCase())) {
            return;
          }
          
          // Result filter
          if (filters.result && result !== filters.result) {
            return;
          }
          
          filteredSubCategoryData[criterion] = [criteriaName, result, details, value];
        });
        
        if (Object.keys(filteredSubCategoryData).length > 0) {
          filteredCategoryData[subCategory] = filteredSubCategoryData;
        }
      });
      
      if (Object.keys(filteredCategoryData).length > 0) {
        filtered[category] = filteredCategoryData;
      }
      
      return filtered;
    }, {});
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      criteria: '',
      result: ''
    });
    setSelectedCard(null);
  };

  // Handle card click for filtering
  const handleCardClick = (cardLabel) => {
    // Find the actual category name in esgData that corresponds to this card
    let actualCategoryName = null;
    
    // First, try to find by exact match in processedData
    for (const category in processedData) {
      for (const subCategory in processedData[category]) {
        const ratio = processedData[category][subCategory].ratio;
        // Check if this ratio matches what's displayed on the card
        if (getRatioFromData(cardLabel) === ratio) {
          actualCategoryName = category;
          break;
        }
      }
      if (actualCategoryName) break;
    }
    
    // If not found by ratio matching, try direct mapping
    if (!actualCategoryName) {
      // Based on the actual data structure: cards map to subcategories within "standard" category
      const cardToCategoryMap = {
        'Scope': 'standard',
        'Governance': 'standard', 
        'Strategy': 'standard',
        'Climate-related Risk and Opportunities': 'standard',
        'Business Model and Value Chain': 'standard',
        'Strategy and Decision Making': 'standard',
        'Financial Position and Financial Performance': 'standard',
        'Climate Resilience': 'standard',
        'Risk Management': 'standard',
        'Metrics and Targets': 'standard',
        'Climate-related Metrics': 'standard',
        'Climate-related Targets': 'standard'
      };
      actualCategoryName = cardToCategoryMap[cardLabel];
    }
    
    if (selectedCard === cardLabel) {
      // If clicking the same card, deselect it
      setSelectedCard(null);
      setFilters(prev => ({
        ...prev,
        category: ''
      }));
    } else {
      // Select the new card and filter by category
      setSelectedCard(cardLabel);
      setFilters(prev => ({
        ...prev,
        category: actualCategoryName ? mapCategoryToDisplay(actualCategoryName) : '',
        criteria: '', // Clear other filters when selecting a card
        result: ''
      }));
    }
  };

  // Load data - commented out auto-loading, only load data when user actively verifies
  // React.useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);
  //       
  //       // Parallel loading of data
  //       const [esgResult, complianceResult] = await Promise.all([
  //         fetchESGReportData('QAN_2024', { start: date1, end: date2 }),
  //         fetchComplianceAnalysis()
  //       ]);
  //       
  //       if (esgResult.success && complianceResult.success) {
  //         setEsgData(esgResult.data);
  //         setComplianceData(complianceResult.data);
  //         
  //         // Load recommendations
  //         const recommendationsResult = await fetchRecommendations(complianceResult.data);
  //         if (recommendationsResult.success) {
  //           setRecommendations(recommendationsResult.data);
  //         }
  //       } else {
  //         throw new Error(esgResult.error || complianceResult.error || 'Failed to load data');
  //       }
  //     } catch (err) {
  //       console.error('Error loading data:', err);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   
  //   loadData();
  // }, [date1, date2]);

  // Process data
  const processedData = esgData ? processData(esgData) : {};
  const complianceRate = complianceData?.overall?.complianceRate || 0;
  const greenwashingRisk = complianceData?.overall?.greenwashingRisk || 0;

  // Helper function to get ratio from processed data
  const getRatioFromData = (categoryName) => {
    // Try different possible data structures
    const possiblePaths = [
      processedData['standard']?.[categoryName]?.ratio,
      processedData[categoryName]?.ratio,
      // Try with mapped category names
      Object.values(processedData).find(cat => 
        Object.keys(cat).some(subCat => 
          subCat.toLowerCase().includes(categoryName.toLowerCase())
        )
      )?.ratio
    ];
    
    for (const path of possiblePaths) {
      if (path) return path;
    }
    
    // If no direct match, try to find by partial name matching
    for (const category in processedData) {
      for (const subCategory in processedData[category]) {
        if (subCategory.toLowerCase().includes(categoryName.toLowerCase())) {
          return processedData[category][subCategory].ratio;
        }
      }
    }
    
    return '0 out of 0';
  };

  // Define summary card data
  const summaryCardsRow1 = [
    { label: 'Scope', value: getRatioFromData('Scope') },
    { label: 'Governance', value: getRatioFromData('Governance') },
    { label: 'Strategy', value: getRatioFromData('Strategy') },
    { label: 'Climate-related Risk and Opportunities', value: getRatioFromData('Climate-related risk and opportunities') },
    { label: 'Business Model and Value Chain', value: getRatioFromData('Business model and value chain') },
    { label: 'Strategy and Decision Making', value: getRatioFromData('Strategy and decision-making') },
    { label: 'Greenwashing Risk', value: `${greenwashingRisk}%`, highlight: true, warning: true },
  ];

  const summaryCardsRow2 = [
    { label: 'Financial Position and Financial Performance', value: getRatioFromData('Financial position, financial performance and cash flows') },
    { label: 'Climate Resilience', value: getRatioFromData('Climate resilience') },
    { label: 'Risk Management', value: getRatioFromData('Risk Management') },
    { label: 'Metrics and Targets', value: getRatioFromData('Metrics and Targets') },
    { label: 'Climate-related Metrics', value: getRatioFromData('Climate-related metrics') },
    { label: 'Climate-related Targets', value: getRatioFromData('Climate-related targets') },
    { label: 'Compliant Rate', value: `${complianceRate}%`, highlight: true, warning: true, sub: 'vs prev 11.6K (+10%)', subColor: 'success.main' },
  ];

  // Handle detail expansion
  const handleDetailExpand = (criterion, resultsData) => {
    setDetailDialog({
      open: true,
      title: criterion,
      content: resultsData
    });
  };

  // Close detail dialog
  const handleDetailClose = () => {
    setDetailDialog({
      open: false,
      title: '',
      content: ''
    });
  };

  // Display error message
  if (verificationError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {verificationError}
        </Alert>
        <Button variant="contained" onClick={() => setVerificationError(null)}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Inputs Area */}
      <Box id="input">
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Inputs
        </Typography>
        <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
          {/* Sustainability Report */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Sustainability Report</Typography>
                {!uploadedFile ? (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ 
                      height: 56, 
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'solid',
                        borderWidth: 2,
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleFileUpload(file, 'pdf');
                        }
                      }}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Upload Report
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF, DOC, DOCX, TXT
                      </Typography>
                    </Box>
                  </Button>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      p: 1, 
                      mb: 1, 
                      bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      sx={{ 
                        borderStyle: 'dashed',
                        borderWidth: 1,
                        '&:hover': {
                          borderStyle: 'solid',
                          borderWidth: 1,
                        }
                      }}
                    >
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleFileUpload(file, 'pdf');
                          }
                        }}
                      />
                      Re-upload
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Upload Metrics - Commented out */}
          {/* <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Additional Metrics (Optional)</Typography>
                {!uploadedMetricsFile ? (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ 
                      height: 56, 
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'solid',
                        borderWidth: 2,
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleFileUpload(file, 'metrics');
                        }
                      }}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Add Custom Metrics
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        JSON (optional - adds to standard criteria)
                      </Typography>
                    </Box>
                  </Button>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      p: 1, 
                      mb: 1, 
                      bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {uploadedMetricsFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(uploadedMetricsFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      sx={{ 
                        borderStyle: 'dashed',
                        borderWidth: 1,
                        '&:hover': {
                          borderStyle: 'solid',
                          borderWidth: 1,
                        }
                      }}
                    >
                      <input
                        type="file"
                        hidden
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleFileUpload(file, 'metrics');
                          }
                        }}
                      />
                      Re-upload
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid> */}
          {/* Select ESG Standards */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Select ESG Standards</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>ESG Standards</InputLabel>
                  <Select
                    multiple
                    value={esg}
                    onChange={e => setEsg(e.target.value)}
                    input={<OutlinedInput label="ESG Standards" />}
                    renderValue={selected => selected.join(', ')}
                  >
                    {esgOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={esg.indexOf(option) > -1} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          {/* Verify Report */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent sx={{ width: '100%' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ width: '100%', height: 56, fontWeight: 700, fontSize: 18 }}
                  onClick={handleVerifyReport}
                >
                  Verify Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Latest Standard Update - Commented out */}
      {/* <Box id="standard-update">
        <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 3 }}>
          Latest Standard Update
        </Typography>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Edit text in left pane...</Typography>
          </CardContent>
        </Card>
      </Box> */}
      
      {/* Summary Cards Area */}
      <Box id="summary">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography component="h2" variant="h6">
            Summary
          </Typography>
          {esgData && !isVerifying && (
            <Button
              variant="contained"
              color="primary"
              onClick={generatePDFReport}
              startIcon={<DownloadRoundedIcon />}
              sx={{ 
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Download PDF Report
            </Button>
          )}
        </Box>
        
        {/* If verifying, show loading state */}
        {isVerifying ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Verifying Report...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we analyze your sustainability report
            </Typography>
          </Box>
        ) : esgData ? (
          /* If data exists, show Summary cards */
          <Box sx={{ 
            display: 'grid',
            gridTemplateRows: 'repeat(2, 120px)',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
            mb: (theme) => theme.spacing(2),
            minWidth: 'fit-content',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.mode === 'light' ? '#f1f1f1' : '#333',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'light' ? '#c1c1c1' : '#666',
              borderRadius: '4px',
              '&:hover': {
                background: theme.palette.mode === 'light' ? '#a8a8a8' : '#888',
              },
            },
          }}>
            {[...summaryCardsRow1, ...summaryCardsRow2].map((item, idx) => {
              const isSelected = selectedCard === item.label;
              const isClickable = !item.highlight; // Don't make highlight cards clickable (Greenwashing Risk, Compliant Rate)
              
              return (
                <Card 
                  key={idx}
                  variant="outlined" 
                  onClick={isClickable ? () => handleCardClick(item.label) : undefined}
                  sx={{ 
                    height: '100%',
                    width: '100%',
                    minWidth: 120,
                    position: 'relative',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.2s ease-in-out',
                    ...(item.highlight && {
                      bgcolor: theme.palette.mode === 'light' ? '#f8f6ff' : 'rgba(124, 93, 250, 0.1)',
                    }),
                    ...(item.warning && {
                      borderLeft: '4px solid #ff9800',
                      borderTop: `1px solid ${theme.palette.divider}`,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }),
                    ...(isClickable && {
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'light' 
                          ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                          : '0 4px 12px rgba(255, 255, 255, 0.1)',
                        borderColor: theme.palette.primary.main,
                      }
                    }),
                    ...(isSelected && {
                      bgcolor: theme.palette.mode === 'light' 
                        ? 'rgba(25, 118, 210, 0.08)' 
                        : 'rgba(25, 118, 210, 0.2)',
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: theme.palette.mode === 'light' 
                        ? '0 2px 8px rgba(25, 118, 210, 0.3)' 
                        : '0 2px 8px rgba(25, 118, 210, 0.4)',
                    })
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography 
                      variant="body2" 
                      color={isSelected ? 'primary' : 'primary'} 
                      fontWeight={700} 
                      noWrap
                    >
                      {item.label}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={item.highlight ? 'primary' : (isSelected ? 'primary' : 'text.primary')} 
                      fontWeight={700}
                    >
                      {item.value}
                    </Typography>
                    {item.sub && <Typography variant="caption" color={item.subColor} fontWeight={600}>{item.sub}</Typography>}
                    {isSelected && (
                      <Typography variant="caption" color="primary" fontWeight={600} sx={{ mt: 0.5 }}>
                        ✓ Selected
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          /* Initial state: show no content */
          null
        )}

        {/* If no data and not verifying, show prompt message */}
        {!esgData && !isVerifying && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Upload your sustainability report to get started
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please upload a PDF report (required) and optionally add custom metrics, then click "Verify Report"
            </Typography>
          </Box>
        )}
      </Box>

      {/* Details Section */}
      {(esgData || isVerifying) && (
        <Box id="details">
          {/* Details Cards Area */}
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Details
          </Typography>
          
          {/* If verifying, show loading state */}
          {isVerifying ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Analyzing Report Details...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We are processing your sustainability report and extracting detailed ESG criteria information
              </Typography>
            </Box>
          ) : esgData ? (
            /* If data exists, show Details content */
            <>
              {/* ESG Criteria Details - Full width */}
              <Card variant="outlined" sx={{ height: 600, mb: 2 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, flexShrink: 0 }}>ESG Criteria Details</Typography>
                  
                  {/* Filter controls */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 2, 
                    flexShrink: 0,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    {/* Selected card indicator */}
                    {selectedCard && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        px: 2,
                        py: 1,
                        bgcolor: theme.palette.mode === 'light' 
                          ? 'rgba(25, 118, 210, 0.08)' 
                          : 'rgba(25, 118, 210, 0.2)',
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.primary.main}`,
                        flexShrink: 0
                      }}>
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          Filtering by: {selectedCard}
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={() => setSelectedCard(null)}
                          sx={{ 
                            minWidth: 'auto', 
                            p: 0.5,
                            fontSize: '0.75rem',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.1)'
                            }
                          }}
                        >
                          ✕
                        </Button>
                      </Box>
                    )}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        input={<OutlinedInput label="Category" />}
                      >
                        <MenuItem value="">
                          <em>All Categories</em>
                        </MenuItem>
                        {getUniqueCategories().map(category => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      size="small"
                      label="Criteria"
                      value={filters.criteria}
                      onChange={(e) => handleFilterChange('criteria', e.target.value)}
                      placeholder="Search criteria..."
                      sx={{ minWidth: 200 }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Result</InputLabel>
                      <Select
                        value={filters.result}
                        onChange={(e) => handleFilterChange('result', e.target.value)}
                        input={<OutlinedInput label="Result" />}
                      >
                        <MenuItem value="">
                          <em>All Results</em>
                        </MenuItem>
                        {getUniqueResults().map(result => (
                          <MenuItem key={result} value={result}>
                            {result}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={clearFilters}
                      sx={{ height: 40 }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                  
                  <Box sx={{ 
                    flex: 1, 
                    overflow: 'hidden',
                    minHeight: 0 // Important: ensure flex children can shrink
                  }}>
                    <Box sx={{ 
                      height: '100%',
                      overflow: 'auto',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: theme.palette.mode === 'light' ? '#f1f1f1' : '#333',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.mode === 'light' ? '#c1c1c1' : '#666',
                        borderRadius: '4px',
                        '&:hover': {
                          background: theme.palette.mode === 'light' ? '#a8a8a8' : '#888',
                        },
                      },
                    }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        minWidth: '600px'
                      }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr style={{ 
                            background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                          }}>
                            <th style={{ 
                              padding: 8, 
                              border: `1px solid ${theme.palette.divider}`, 
                              fontWeight: 700, 
                              width: '10%',
                              background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                            }}>Category</th>
                            <th style={{ 
                              padding: 8, 
                              border: `1px solid ${theme.palette.divider}`, 
                              fontWeight: 700, 
                              width: '20%',
                              background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                            }}>Criteria</th>
                            <th style={{ 
                              padding: 8, 
                              border: `1px solid ${theme.palette.divider}`, 
                              fontWeight: 700, 
                              width: '10%',
                              background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                            }}>Result</th>
                            <th style={{ 
                              padding: 8, 
                              border: `1px solid ${theme.palette.divider}`, 
                              fontWeight: 700, 
                              width: '60%',
                              background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                            }}>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredData = getFilteredData();
                            return Object.keys(filteredData).map((category, categoryIndex) => {
                              const criteria = filteredData[category];
                              return Object.keys(criteria).map((subCategory, subCategoryIndex) => {
                                return Object.keys(criteria[subCategory]).map((criterion, criterionIndex) => {
                                  const [criteriaName, result, details, value] = criteria[subCategory][criterion];
                                  const isCompliant = result.toLowerCase() === 'yes' || result.toLowerCase() === 'few';
                                  const isRisk = result.toLowerCase() === 'no';
                                  
                                  return (
                                    <tr key={`${categoryIndex}-${subCategoryIndex}-${criterionIndex}`}>
                                      <td style={{ 
                                        padding: 8, 
                                        border: `1px solid ${theme.palette.divider}`, 
                                        fontWeight: 500,
                                        fontSize: '0.8rem',
                                        verticalAlign: 'top',
                                        background: theme.palette.mode === 'light' ? '#fafafa' : '#2d2d2d',
                                        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#fafafa'
                                      }}>
                                        {mapCategoryToDisplay(category)}
                                      </td>
                                      <td style={{ 
                                        padding: 8, 
                                        border: `1px solid ${theme.palette.divider}`,
                                        fontSize: '0.8rem',
                                        verticalAlign: 'top'
                                      }}>
                                        {criteriaName}
                                      </td>
                                      <td style={{ 
                                        padding: 8, 
                                        border: `1px solid ${theme.palette.divider}`,
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        color: isCompliant ? 'success.main' : 'error.main',
                                        fontSize: '0.8rem'
                                      }}>
                                        {result}
                                      </td>
                                      <td style={{ 
                                        padding: 8, 
                                        border: `1px solid ${theme.palette.divider}`,
                                        fontSize: '0.75rem',
                                        verticalAlign: 'top',
                                        maxWidth: 200,
                                        wordWrap: 'break-word'
                                      }}>
                                        {details ? (
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ 
                                              mb: 0.5,
                                              lineHeight: 1.2,
                                              maxHeight: '3.6em', // 3 rows height (1.2 * 3)
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              display: '-webkit-box',
                                              WebkitLineClamp: 3,
                                              WebkitBoxOrient: 'vertical'
                                            }}>
                                              {details}
                                            </Typography>
                                            {details.length > 150 && (
                                              <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="primary"
                                                sx={{ 
                                                  fontSize: '0.7rem', 
                                                  py: 0.5, 
                                                  px: 1, 
                                                  minWidth: 'auto',
                                                  height: '20px',
                                                  borderRadius: '4px',
                                                  textTransform: 'none',
                                                  fontWeight: 600,
                                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                  '&:hover': {
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                                    transform: 'translateY(-1px)'
                                                  },
                                                  transition: 'all 0.2s ease-in-out'
                                                }}
                                                onClick={() => handleDetailExpand(criteriaName, details)}
                                              >
                                                View Full
                                              </Button>
                                            )}
                                          </Box>
                                        ) : (
                                          <Typography variant="caption" color="text.secondary">
                                            No details available
                                          </Typography>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                });
                              });
                            });
                          })()}
                        </tbody>
                      </table>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Two-column layout below - Commented out AASB S2 and Materiality Matrix */}
              <Grid container spacing={2} columns={12}>
                {/* AASB S2 and Materiality Matrix - 6 columns - Commented out */}
                {/* <Grid size={{ xs: 12, lg: 6 }} id="materiality-matrix">
                  <Card variant="outlined" sx={{ height: 400 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>AASB S2 and Materiality Matrix</Typography>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Title 1</Typography>
                        <Button size="small" variant="outlined" sx={{ ml: 1, fontSize: 12 }}>Metric 1</Button>
                      </Box>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Box sx={{ height: 16, bgcolor: theme.palette.mode === 'light' ? '#ede7f6' : 'rgba(124, 93, 250, 0.2)', borderRadius: 1, mb: 1 }}>
                          <Box sx={{ width: '85%', height: '100%', bgcolor: '#7c5dfa', borderRadius: 1 }} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mt: 1 }}>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}></Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>A</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>B</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>C</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>D</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>E</Box>
                          {[
                            { label: 'Data 1', values: [86, 56, 21, 18, 67] },
                            { label: 'Data 2', values: [46, 30, 77, 69, 20] },
                            { label: 'Data 3', values: [87, 93, 47, 56, 44] },
                            { label: 'Data 4', values: [24, 34, 10, 100, 15] },
                            { label: 'Data 5', values: [65, 69, 29, 96, 78] },
                          ].map((row, i) => (
                            <React.Fragment key={i}>
                              <Box sx={{ p: 1, fontSize: 10, fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                                {row.label}
                              </Box>
                              {row.values.map((value, j) => {
                                const intensity = Math.min(100, Math.max(0, value));
                                const bgColor = `hsl(260, 70%, ${100 - intensity * 0.6}%)`;
                                return (
                                  <Box
                                    key={j}
                                    sx={{
                                      p: 1,
                                      fontSize: 10,
                                      textAlign: 'center',
                                      bgcolor: bgColor,
                                      color: intensity > 50 ? 'white' : 'text.primary',
                                      borderRadius: 0.5,
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minHeight: 24,
                                    }}
                                  >
                                    {value}
                                  </Box>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid> */}
                
                {/* Recommendations - 12 columns (full width) */}
                <Grid size={{ xs: 12 }} id="ai-recommendations">
                  <LLMRecommendations 
                    esgData={esgData} 
                    complianceData={complianceData} 
                    height={400}
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            /* Initial state: show no content */
            null
          )}
        </Box>
      )}

      {/* Detail dialog */}
      <Dialog open={detailDialog.open} onClose={handleDetailClose} maxWidth="md" fullWidth>
        <DialogTitle>{detailDialog.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {detailDialog.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 