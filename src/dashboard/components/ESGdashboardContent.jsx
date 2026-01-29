import * as React from 'react';
import { Typography, Button, Grid, Box, TextField, MenuItem, Select, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput, Card, CardContent, useTheme, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { fetchESGReportData, fetchComplianceAnalysis, fetchRecommendations, sendReportToServer } from '../services/apiService';
import LLMRecommendations from './LLMRecommendations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

const metricsOptions = ['Metric 1', 'Metric 2', 'Metric 3'];
const esgOptions = ['GRI', 'AASB S2', 'AASB Scope 3'];

// Data processing function
const processData = (data) => {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  const results = {};
  
  // Iterate through each category (metric and standard)
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    
    // Validate category data
    if (!categoryData || typeof categoryData !== 'object') {
      return;
    }
    
    results[category] = {};
    
    // Iterate through each subcategory
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      
      // Validate subcategory data
      if (!subCategoryData || typeof subCategoryData !== 'object') {
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
    return 0;
  }
  
  let totalCriteria = 0;
  let compliantCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    
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
        
        // Validate criterion data format
        if (!criterionData) {
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
    return 0;
  }
  
  let totalCriteria = 0;
  let riskCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    
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
        
        // Validate criterion data format
        if (!criterionData) {
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
  
  // Data state - 分别存储不同标准的数据
  const [esgData, setEsgData] = React.useState(null); // 保留用于兼容性（合并数据）
  const [griData, setGriData] = React.useState(null); // GRI 标准数据
  const [s2Data, setS2Data] = React.useState(null); // AASB S2 标准数据
  const [s3Data, setS3Data] = React.useState(null); // AASB Scope 3 标准数据
  const [griComplianceData, setGriComplianceData] = React.useState(null); // GRI 合规数据
  const [s2ComplianceData, setS2ComplianceData] = React.useState(null); // S2 合规数据
  const [s3ComplianceData, setS3ComplianceData] = React.useState(null); // S3 合规数据
  const [complianceData, setComplianceData] = React.useState(null); // 保留用于兼容性（合并数据）
  const [rawStandardsData, setRawStandardsData] = React.useState(null); // 保存原始数据供 LLM 使用
  
  // Verification status
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationError, setVerificationError] = React.useState(null);
  
  // Detail dialog state
  const [detailDialog, setDetailDialog] = React.useState({
    open: false,
    title: '',
    content: ''
  });

  // Filter state - 为每个标准创建独立的状态
  const [griFilters, setGriFilters] = React.useState({
    category: '',
    criteria: '',
    result: ''
  });
  const [s2Filters, setS2Filters] = React.useState({
    category: '',
    criteria: '',
    result: ''
  });
  const [s3Filters, setS3Filters] = React.useState({
    category: '',
    criteria: '',
    result: ''
  });

  // Card selection state for filtering - 为每个标准创建独立的状态
  const [griSelectedCard, setGriSelectedCard] = React.useState(null);
  const [s2SelectedCard, setS2SelectedCard] = React.useState(null);
  const [s3SelectedCard, setS3SelectedCard] = React.useState(null);
  
  // 辅助函数：根据标准名称获取对应的过滤器和选中卡片
  const getFiltersForStandard = (standardName) => {
    switch(standardName) {
      case 'GRI': return griFilters;
      case 'S2': return s2Filters;
      case 'S3': return s3Filters;
      default: return { category: '', criteria: '', result: '' };
    }
  };
  
  const getSelectedCardForStandard = (standardName) => {
    switch(standardName) {
      case 'GRI': return griSelectedCard;
      case 'S2': return s2SelectedCard;
      case 'S3': return s3SelectedCard;
      default: return null;
    }
  };
  
  const setFiltersForStandard = (standardName, filters) => {
    switch(standardName) {
      case 'GRI': setGriFilters(filters); break;
      case 'S2': setS2Filters(filters); break;
      case 'S3': setS3Filters(filters); break;
    }
  };
  
  const setSelectedCardForStandard = (standardName, card) => {
    switch(standardName) {
      case 'GRI': setGriSelectedCard(card); break;
      case 'S2': setS2SelectedCard(card); break;
      case 'S3': setS3SelectedCard(card); break;
    }
  };

  // ===================== 新结果结构适配（服务器返回 { gri, s2, s3 }） =====================
  // 归一化函数：将不同标准的数据转换成统一的嵌套结构
  // 统一结构: { category: { subCategory: { criterionKey: [criteriaName, result, details, value] } } }
  
  // 归一化 S2 数据（数组格式）
  // 格式：results.s2.Scope = [[criteriaName, result, details, value], ...]
  const normalizeS2Data = (s2Data) => {
    if (!s2Data || typeof s2Data !== 'object') {
      return null;
    }

    const normalized = {};

    Object.keys(s2Data).forEach((categoryName) => {
      const items = s2Data[categoryName];
      if (!Array.isArray(items)) {
        return;
      }

      const subCategoryName = categoryName;
      const subCategoryObj = {};

      items.forEach((item, idx) => {
        // 直接处理数组格式：[criteriaName, result, details, value]
        if (!Array.isArray(item) || item.length < 2) {
          return;
        }

        const [criteriaName, result, details = '', value = ''] = item;
        if (!criteriaName || result === undefined || result === null) {
          return;
        }

        const key = `${categoryName}_${idx}`;
        subCategoryObj[key] = [criteriaName, result, details, value];
      });

      if (Object.keys(subCategoryObj).length > 0) {
        if (!normalized[categoryName]) {
          normalized[categoryName] = {};
        }
        normalized[categoryName][subCategoryName] = subCategoryObj;
      }
    });

    return normalized;
  };

  // 归一化 GRI 数据（嵌套对象格式）
  // 格式：results.gri.Environmental.Energy = [[criteriaName, result, details, value], ...]
  const normalizeGRIData = (griData) => {
    if (!griData || typeof griData !== 'object') {
      return null;
    }

    const normalized = {};

    Object.keys(griData).forEach((categoryName) => {
      // 大类：Environmental, Social, Governance
      const categoryData = griData[categoryName];
      if (!categoryData || typeof categoryData !== 'object') {
        return;
      }

      normalized[categoryName] = {};

      Object.keys(categoryData).forEach((subCategoryName) => {
        // 小类：Energy, Water, Waste, etc.
        const subCategoryData = categoryData[subCategoryName];
        
        // GRI 数据格式：subCategoryData 是一个数组，每个元素是 [criteriaName, result, details, value]
        if (!Array.isArray(subCategoryData)) {
          return;
        }

        const subCategoryObj = {};

        subCategoryData.forEach((item, idx) => {
          // 每个 item 是数组格式：[criteriaName, result, details, value]
          if (!Array.isArray(item) || item.length < 2) {
            return;
          }

          const [criteriaName, result, details = '', value = ''] = item;
          if (!criteriaName || result === undefined || result === null) {
            return;
          }

          const key = `${subCategoryName}_${idx}`;
          subCategoryObj[key] = [criteriaName, result, details, value];
        });

        if (Object.keys(subCategoryObj).length > 0) {
          normalized[categoryName][subCategoryName] = subCategoryObj;
        }
      });
    });

    return normalized;
  };

  // 归一化 Scope 3 数据（数组格式，类似 S2）
  // 格式：results.scope3["Scope 3 Categories"] = [[criteriaName, result, details, value], ...]
  const normalizeS3Data = (s3Data) => {
    if (!s3Data || typeof s3Data !== 'object') {
      return null;
    }

    const normalized = {};

    Object.keys(s3Data).forEach((categoryName) => {
      const items = s3Data[categoryName];
      
      if (!Array.isArray(items)) {
        return;
      }

      const subCategoryName = categoryName;
      const subCategoryObj = {};

      items.forEach((item, idx) => {
        // 直接处理数组格式：[criteriaName, result, details, value]
        if (!Array.isArray(item) || item.length < 2) {
          return;
        }

        const [criteriaName, result, details = '', value = ''] = item;
        if (!criteriaName || result === undefined || result === null) {
          return;
        }

        const key = `${categoryName}_${idx}`;
        subCategoryObj[key] = [criteriaName, result, details, value];
      });

      if (Object.keys(subCategoryObj).length > 0) {
        if (!normalized[categoryName]) {
          normalized[categoryName] = {};
        }
        normalized[categoryName][subCategoryName] = subCategoryObj;
      }
    });

    return normalized;
  };

  // 合并多个标准的数据
  const mergeStandardsData = (standardsData) => {
    const merged = {};

    Object.keys(standardsData).forEach((standardName) => {
      const normalizedData = standardsData[standardName];
      if (!normalizedData || typeof normalizedData !== 'object') {
        return;
      }

      // 合并到统一结构，使用标准名作为前缀避免冲突
      Object.keys(normalizedData).forEach((categoryName) => {
        const prefixedCategory = `${standardName.toUpperCase()}_${categoryName}`;
        merged[prefixedCategory] = normalizedData[categoryName];
      });
    });

    return merged;
  };

  // Monitor filter changes (已分离为各标准独立状态，此 useEffect 不再需要)
  // React.useEffect(() => {
  //   // Filter state changed
  // }, [griFilters, s2Filters, s3Filters, griSelectedCard, s2SelectedCard, s3SelectedCard]);

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

    // Validate that at least one ESG standard is selected
    if (!esg || esg.length === 0) {
      setVerificationError('Please select at least one ESG standard');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      // New API call: send PDF + array of selected standard names
      // e.g., if user selects ["GRI", "AASB S2"], it will send ["gri", "s2"]
      const result = await sendReportToServer(uploadedFile, esg);
      
      if (result.success) {
        // Extract the actual data from the server response
        // 新服务器返回结构: { gri: {...}, s2: {...}, s3: {...} }
        const serverData = result.data;
        
        // Check if data has the expected structure
        if (serverData && typeof serverData === 'object') {
          // 保存原始数据供 LLM 使用
          setRawStandardsData(serverData);
          
          // 归一化所有标准的数据，分别存储
          let hasValidData = false;
          
          // 处理 S2 数据
          if (serverData.s2) {
            const normalizedS2 = normalizeS2Data(serverData.s2);
            if (normalizedS2 && Object.keys(normalizedS2).length > 0) {
              setS2Data(normalizedS2);
              const s2Compliance = calculateComplianceFromData(normalizedS2);
              setS2ComplianceData(s2Compliance);
              hasValidData = true;
            } else {
              // 如果归一化失败，尝试直接使用原始数据
              if (serverData.s2 && typeof serverData.s2 === 'object' && Object.keys(serverData.s2).length > 0) {
                setS2Data(serverData.s2);
                hasValidData = true;
              }
            }
          }
          
          // 处理 GRI 数据
          if (serverData.gri) {
            const normalizedGRI = normalizeGRIData(serverData.gri);
            if (normalizedGRI && Object.keys(normalizedGRI).length > 0) {
              setGriData(normalizedGRI);
              const griCompliance = calculateComplianceFromData(normalizedGRI);
              setGriComplianceData(griCompliance);
              hasValidData = true;
            }
          }
          
          // 处理 Scope 3 数据（支持 scope3 和 s3 两种字段名）
          const s3DataRaw = serverData.scope3 || serverData.s3;
          if (s3DataRaw && !s3DataRaw.error) {
            const normalizedS3 = normalizeS3Data(s3DataRaw);
            if (normalizedS3 && Object.keys(normalizedS3).length > 0) {
              setS3Data(normalizedS3);
              const s3Compliance = calculateComplianceFromData(normalizedS3);
              setS3ComplianceData(s3Compliance);
              hasValidData = true;
            } else {
              // 如果归一化失败，尝试直接使用原始数据
              if (s3DataRaw && typeof s3DataRaw === 'object' && Object.keys(s3DataRaw).length > 0) {
                setS3Data(s3DataRaw);
                hasValidData = true;
              }
            }
          }
          
          // 为了兼容性，也保存合并的数据（用于 LLM 等）
          if (hasValidData) {
            const normalizedStandards = {};
            if (serverData.s2) {
              const normalizedS2 = normalizeS2Data(serverData.s2);
              if (normalizedS2) normalizedStandards.s2 = normalizedS2;
            }
            if (serverData.gri) {
              const normalizedGRI = normalizeGRIData(serverData.gri);
              if (normalizedGRI) normalizedStandards.gri = normalizedGRI;
            }
            const s3DataRaw = serverData.scope3 || serverData.s3;
            if (s3DataRaw && !s3DataRaw.error) {
              const normalizedS3 = normalizeS3Data(s3DataRaw);
              if (normalizedS3) normalizedStandards.scope3 = normalizedS3;
            }
            
            const mergedData = mergeStandardsData(normalizedStandards);
            setEsgData(mergedData);
            
            // 计算合并的合规数据（用于总体统计）
            const complianceResult = calculateComplianceFromData(mergedData);
            setComplianceData(complianceResult);
          } else {
            setVerificationError('No valid ESG standard data found in server response');
          }
        } else {
          setVerificationError('Invalid data structure received from server');
        }
      } else {
        setVerificationError(result.error || 'Failed to verify report');
      }
    } catch (error) {
      setVerificationError(error.message || 'An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  // Generate and download PDF report
  const generatePDFReport = () => {
    if (!esgData || !complianceData) {
      alert('No analysis data available. Please run the analysis first.');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const valueColumnX = pageWidth - margin; // 右对齐的数值列
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
      // Overall Compliance Rate
      doc.text('Overall Compliance Rate: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.complianceRate}%`, valueColumnX, yPosition, { align: 'right' });
      yPosition += 8;
      
      // Greenwashing Risk
      doc.setFont('helvetica', 'normal');
      doc.text('Greenwashing Risk: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.greenwashingRisk}%`, valueColumnX, yPosition, { align: 'right' });
      yPosition += 8;
      
      // Total Criteria
      doc.setFont('helvetica', 'normal');
      doc.text('Total Criteria: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.totalCriteria}`, valueColumnX, yPosition, { align: 'right' });
      yPosition += 8;
      
      // Compliant Criteria
      doc.setFont('helvetica', 'normal');
      doc.text('Compliant Criteria: ', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(`${complianceData.overall.compliantCriteria}`, valueColumnX, yPosition, { align: 'right' });
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
            const categoryText = `${mapCategoryToDisplay(category)} - ${subCategory}`;
            const ratioParts = summary.ratio.split(' out of ');
            const ratioText = ratioParts.length === 2
              ? `${ratioParts[0]} out of ${ratioParts[1]}`
              : summary.ratio;

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
              doc.text(ratioText, valueColumnX, yPosition, { align: 'right' });
              doc.setFont('helvetica', 'normal');
            } else {
              // Short text, single line
              doc.text(categoryText + ': ', margin, yPosition);
              doc.setFont('helvetica', 'bold');
              doc.text(ratioText, valueColumnX, yPosition, { align: 'right' });
              doc.setFont('helvetica', 'normal');
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

      // Prepare table data (PDF should show all data, no filtering)
      const tableData = [];
      const filteredData = esgData || {}; // Use all data for PDF export
      
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
      doc.save(fileName);
    } catch (error) {
      alert('Error generating PDF report. Please try again.');
    }
  };

  // Calculate compliance from API returned data
  const calculateComplianceFromData = (data) => {
    // Validate data structure
    if (!data || typeof data !== 'object') {
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
          
          // Validate criterion data format
          if (!criterionData) {
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

  // Filter data (旧函数，已废弃，保留用于兼容性，但不使用过滤器)
  // 注意：此函数已不再使用，因为我们现在使用 getFilteredDataForStandard
  // PDF 导出时直接使用 esgData，不进行过滤
  const getFilteredData = () => {
    // 返回所有数据，不进行过滤（用于 PDF 导出）
    return esgData || {};
  };

  // Handle filter change (支持标准名称)
  const handleFilterChange = (filterType, value, standardName) => {
    setFiltersForStandard(standardName, prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters (支持标准名称)
  const clearFilters = (standardName) => {
    setFiltersForStandard(standardName, {
      category: '',
      criteria: '',
      result: ''
    });
    setSelectedCardForStandard(standardName, null);
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

  // Process data for S2
  const processedS2Data = s2Data ? processData(s2Data) : {};
  const s2ComplianceRate = s2ComplianceData?.overall?.complianceRate || 0;
  const s2GreenwashingRisk = s2ComplianceData?.overall?.greenwashingRisk || 0;

  // Process data for GRI
  const processedGriData = griData ? processData(griData) : {};
  const griComplianceRate = griComplianceData?.overall?.complianceRate || 0;
  const griGreenwashingRisk = griComplianceData?.overall?.greenwashingRisk || 0;

  // Process data for Scope 3
  const processedS3Data = s3Data ? processData(s3Data) : {};
  const s3ComplianceRate = s3ComplianceData?.overall?.complianceRate || 0;
  const s3GreenwashingRisk = s3ComplianceData?.overall?.greenwashingRisk || 0;

  // Helper function to get ratio from processed data (for S2)
  const getRatioFromS2Data = (categoryName) => {
    if (!processedS2Data || Object.keys(processedS2Data).length === 0) return '0 out of 0';
    
    // Try different possible data structures
    const possiblePaths = [
      processedS2Data[categoryName]?.[categoryName]?.ratio,
      processedS2Data[categoryName]?.ratio,
      // Try with mapped category names
      Object.values(processedS2Data).find(cat => 
        Object.keys(cat).some(subCat => 
          subCat.toLowerCase().includes(categoryName.toLowerCase())
        )
      )?.ratio
    ];
    
    for (const path of possiblePaths) {
      if (path) return path;
    }
    
    // If no direct match, try to find by partial name matching
    for (const category in processedS2Data) {
      for (const subCategory in processedS2Data[category]) {
        if (subCategory.toLowerCase().includes(categoryName.toLowerCase())) {
          return processedS2Data[category][subCategory].ratio;
        }
      }
    }
    
    return '0 out of 0';
  };

  // Helper function to get ratio from GRI data (计算不是 "No" 的 criteria 百分比)
  const getRatioFromGriData = (categoryName) => {
    if (!griData || Object.keys(griData).length === 0) return '0 out of 0';
    
    // GRI 数据结构：{ Environmental: {...}, Social: {...}, Governance: {...} }
    // 直接查找 categoryName
    let targetCategory = null;
    
    // 精确匹配
    if (griData[categoryName]) {
      targetCategory = griData[categoryName];
    } else {
      // 部分匹配
      for (const category in griData) {
        if (category.toLowerCase().includes(categoryName.toLowerCase())) {
          targetCategory = griData[category];
          break;
        }
      }
    }
    
    if (!targetCategory || typeof targetCategory !== 'object') {
      return '0 out of 0';
    }
    
    // 遍历该类别下的所有子类别和 criteria
    let totalCriteria = 0;
    let notNoCriteria = 0; // 不是 "No" 的 criteria 数量
    
    Object.keys(targetCategory).forEach(subCategory => {
      const subCategoryData = targetCategory[subCategory];
      
      if (!subCategoryData || typeof subCategoryData !== 'object') {
        return;
      }
      
      // 遍历每个 criterion
      Object.keys(subCategoryData).forEach(criterionKey => {
        const criterionData = subCategoryData[criterionKey];
        
        if (criterionData === null || criterionData === undefined) {
          return;
        }
        
        // 提取 result 值
        let result = null;
        if (Array.isArray(criterionData)) {
          // 数组格式：[criteriaName, result, details, value]
          if (criterionData.length >= 2) {
            result = criterionData[1];
          }
        } else if (typeof criterionData === 'object') {
          // 对象格式：{ result, details, ... }
          result = criterionData.result || criterionData.compliance;
        } else {
          result = criterionData;
        }
        
        if (result !== undefined && result !== null) {
          totalCriteria++;
          
          // 检查结果是否不是 "No"（不区分大小写）
          const resultStr = String(result).toLowerCase().trim();
          if (resultStr !== 'no') {
            notNoCriteria++;
          }
        }
      });
    });
    
    if (totalCriteria > 0) {
      return `${notNoCriteria} out of ${totalCriteria}`;
    }
    
    return '0 out of 0';
  };

  // Define S2 summary card data
  const s2SummaryCardsRow1 = [
    { label: 'Scope', value: getRatioFromS2Data('Scope') },
    { label: 'Governance', value: getRatioFromS2Data('Governance') },
    { label: 'Strategy', value: getRatioFromS2Data('Strategy') },
    { label: 'Climate-related Risk and Opportunities', value: getRatioFromS2Data('Climate-related risk and opportunities') },
    { label: 'Business Model and Value Chain', value: getRatioFromS2Data('Business model and value chain') },
    { label: 'Strategy and Decision Making', value: getRatioFromS2Data('Strategy and decision-making') },
    { label: 'Greenwashing Risk', value: `${s2GreenwashingRisk}%`, highlight: true, warning: true },
  ];

  const s2SummaryCardsRow2 = [
    { label: 'Financial Position and Financial Performance', value: getRatioFromS2Data('Financial position, financial performance and cash flows') },
    { label: 'Climate Resilience', value: getRatioFromS2Data('Climate resilience') },
    { label: 'Risk Management', value: getRatioFromS2Data('Risk Management') },
    { label: 'Metrics and Targets', value: getRatioFromS2Data('Metrics and Targets') },
    { label: 'Climate-related Metrics', value: getRatioFromS2Data('Climate-related metrics') },
    { label: 'Climate-related Targets', value: getRatioFromS2Data('Climate-related targets') },
    { label: 'Compliant Rate', value: `${s2ComplianceRate}%`, highlight: true, warning: true, sub: 'vs prev 11.6K (+10%)', subColor: 'success.main' },
  ];

  // Helper function to get ratio from Scope 3 data (类似 S2)
  const getRatioFromS3Data = (categoryName) => {
    if (!processedS3Data || Object.keys(processedS3Data).length === 0) return '0 out of 0';
    
    // Try different possible data structures
    const possiblePaths = [
      processedS3Data[categoryName]?.[categoryName]?.ratio,
      processedS3Data[categoryName]?.ratio,
      // Try with mapped category names
      Object.values(processedS3Data).find(cat => 
        Object.keys(cat).some(subCat => 
          subCat.toLowerCase().includes(categoryName.toLowerCase())
        )
      )?.ratio
    ];
    
    for (const path of possiblePaths) {
      if (path) return path;
    }
    
    // If no direct match, try to find by partial name matching
    for (const category in processedS3Data) {
      for (const subCategory in processedS3Data[category]) {
        if (subCategory.toLowerCase().includes(categoryName.toLowerCase())) {
          return processedS3Data[category][subCategory].ratio;
        }
      }
    }
    
    return '0 out of 0';
  };

  // Define GRI summary card data (Environmental, Social, Governance)
  const griSummaryCards = [
    { label: 'Environmental', value: getRatioFromGriData('Environmental') },
    { label: 'Social', value: getRatioFromGriData('Social') },
    { label: 'Governance', value: getRatioFromGriData('Governance') },
    { label: 'Greenwashing Risk', value: `${griGreenwashingRisk}%`, highlight: true, warning: true },
    { label: 'Compliant Rate', value: `${griComplianceRate}%`, highlight: true, warning: true, sub: 'vs prev 11.6K (+10%)', subColor: 'success.main' },
  ];

  // Define Scope 3 summary card data
  const s3SummaryCards = [
    { label: 'Scope 3 Categories', value: getRatioFromS3Data('Scope 3 Categories') },
    { label: 'Greenhouse Gas Protocol', value: getRatioFromS3Data('Greenhouse Gas Protocol') },
    { label: 'Measurement Approach', value: getRatioFromS3Data('Measurement Approach, inputs and assumptions') },
    { label: 'Scope 3 Emissions', value: getRatioFromS3Data('Scope 3 greenhouse gas emissions') },
    { label: 'Measurement Framework', value: getRatioFromS3Data('Scope 3 meaurement framework') },
    { label: 'Data Disclosure', value: getRatioFromS3Data('Disclosure of inputs to Scope 3 greenhouse gas emissions') },
    { label: 'Greenwashing Risk', value: `${s3GreenwashingRisk}%`, highlight: true, warning: true },
    { label: 'Compliant Rate', value: `${s3ComplianceRate}%`, highlight: true, warning: true, sub: 'vs prev 11.6K (+10%)', subColor: 'success.main' },
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

  // 渲染 Summary Cards 的通用组件
  const renderSummaryCards = (cards, standardName, onCardClick, selectedCardState) => {
    const cardCount = cards.length;
    const rows = Math.ceil(cardCount / 7);
    
    return (
      <Box sx={{ 
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 120px)`,
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
        {cards.map((item, idx) => {
          const isSelected = selectedCardState === item.label;
          const isClickable = !item.highlight;
          
          return (
            <Card 
              key={`${standardName}-${idx}`}
              variant="outlined" 
              onClick={isClickable && onCardClick ? () => onCardClick(item.label, standardName) : undefined}
              sx={{ 
                height: '100%',
                width: '100%',
                minWidth: 120,
                position: 'relative',
                cursor: isClickable && onCardClick ? 'pointer' : 'default',
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
                ...(isClickable && onCardClick && {
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
    );
  };

  // 获取过滤后的数据（支持指定标准）
  const getFilteredDataForStandard = (data, standardName) => {
    if (!data) return {};
    
    // 获取当前标准对应的过滤器和选中卡片
    const filters = getFiltersForStandard(standardName);
    const currentSelectedCard = getSelectedCardForStandard(standardName);
    
    return Object.keys(data).reduce((filtered, category) => {
      const categoryData = data[category];
      
      if (!categoryData || typeof categoryData !== 'object') {
        return filtered;
      }
      
      // 应用 category 过滤器
      // 对于 GRI: category 是 "Environmental", "Social", "Governance"
      // 对于 S2: category 是 "Scope", "Governance", "Strategy" 等
      // 对于 S3: category 是 "Scope 3 Categories", "Greenhouse Gas Protocol" 等
      const mappedCategory = mapCategoryToDisplay(category);
      
      // 如果选中了卡片，检查是否匹配
      if (currentSelectedCard) {
        // 对于 S2，需要特殊处理卡片到类别的映射
        if (standardName === 'S2') {
          const cardToCategoryMap = {
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
          const expectedCategory = cardToCategoryMap[currentSelectedCard];
          if (expectedCategory && category !== expectedCategory) {
            return filtered;
          }
        } else {
          // 对于 GRI 和 S3，直接比较 category（不区分大小写）
          const categoryMatch = category.toLowerCase() === currentSelectedCard.toLowerCase() || 
                               mappedCategory.toLowerCase() === currentSelectedCard.toLowerCase();
          if (!categoryMatch) {
            return filtered;
          }
        }
      } else if (filters.category) {
        // 如果没有选中卡片，使用 filters.category（不区分大小写）
        const categoryMatch = category.toLowerCase() === filters.category.toLowerCase() || 
                             mappedCategory.toLowerCase() === filters.category.toLowerCase();
        if (!categoryMatch) {
          return filtered;
        }
      }
      
      const filteredCategoryData = {};
      
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        
        if (!subCategoryData || typeof subCategoryData !== 'object') {
          return;
        }
        
        const filteredSubCategoryData = {};
        
        Object.keys(subCategoryData).forEach(criterion => {
          const criterionData = subCategoryData[criterion];
          
          if (criterionData === null || criterionData === undefined) {
            return;
          }
          
          let criteriaName, result, details, value;
          if (Array.isArray(criterionData)) {
            if (criterionData.length >= 4) {
              [criteriaName, result, details, value] = criterionData;
            } else if (criterionData.length === 2) {
              [result, details] = criterionData;
              criteriaName = criterion;
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
          
          // 应用 criteria 过滤器
          if (filters.criteria && criteriaName && !criteriaName.toLowerCase().includes(filters.criteria.toLowerCase())) {
            return;
          }
          
          // 应用 result 过滤器
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

  // 获取唯一类别（支持指定标准）
  const getUniqueCategoriesForStandard = (data) => {
    if (!data) return [];
    const categories = new Set();
    Object.keys(data).forEach(category => {
      // 对于 GRI，直接使用 category 名称（Environmental, Social, Governance）
      // 对于 S2 和 S3，使用 mapCategoryToDisplay 映射
      const displayCategory = mapCategoryToDisplay(category);
      categories.add(displayCategory);
      // 同时添加原始 category 名称，以便过滤时能匹配
      if (displayCategory !== category) {
        categories.add(category);
      }
    });
    return Array.from(categories).sort();
  };

  // 获取唯一结果（支持指定标准）
  const getUniqueResultsForStandard = (data) => {
    if (!data) return [];
    const results = new Set();
    Object.keys(data).forEach(category => {
      const categoryData = data[category];
      if (!categoryData || typeof categoryData !== 'object') return;
      
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        if (!subCategoryData || typeof subCategoryData !== 'object') return;
        
        Object.keys(subCategoryData).forEach(criterion => {
          const criterionData = subCategoryData[criterion];
          if (criterionData === null || criterionData === undefined) return;
          
          let result;
          if (Array.isArray(criterionData)) {
            result = criterionData.length >= 2 ? criterionData[1] : criterionData[0];
          } else if (typeof criterionData === 'object') {
            result = criterionData.compliance || criterionData.result;
          } else {
            result = criterionData;
          }
          
          if (result !== undefined && result !== null) {
            results.add(result);
          }
        });
      });
    });
    return Array.from(results).sort();
  };

  // 处理卡片点击（支持标准名称）
  const handleCardClickWithStandard = (cardLabel, standardName) => {
    const currentSelectedCard = getSelectedCardForStandard(standardName);
    
    // 如果点击的是已选中的卡片，则取消选择
    if (currentSelectedCard === cardLabel) {
      setSelectedCardForStandard(standardName, null);
      setFiltersForStandard(standardName, prev => ({
        ...prev,
        category: ''
      }));
    } else {
      // 否则选择新卡片并设置过滤器
      setSelectedCardForStandard(standardName, cardLabel);
      setFiltersForStandard(standardName, prev => ({
        ...prev,
        category: cardLabel,
        criteria: '',
        result: ''
      }));
    }
  };

  // 渲染 Details 表格的通用组件
  const renderDetailsTable = (data, standardName) => {
    const filteredData = getFilteredDataForStandard(data, standardName);
    const uniqueCategories = getUniqueCategoriesForStandard(data);
    const uniqueResults = getUniqueResultsForStandard(data);
    const filters = getFiltersForStandard(standardName);
    const currentSelectedCard = getSelectedCardForStandard(standardName);

    return (
      <>
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
          {currentSelectedCard && (
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
                Filtering by: {currentSelectedCard}
              </Typography>
              <Button
                size="small"
                variant="text"
                color="primary"
                onClick={() => {
                  setSelectedCardForStandard(standardName, null);
                  setFiltersForStandard(standardName, prev => ({ ...prev, category: '' }));
                }}
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
              onChange={(e) => handleFilterChange('category', e.target.value, standardName)}
              input={<OutlinedInput label="Category" />}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {uniqueCategories.map(category => (
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
            onChange={(e) => handleFilterChange('criteria', e.target.value, standardName)}
            placeholder="Search criteria..."
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Result</InputLabel>
            <Select
              value={filters.result}
              onChange={(e) => handleFilterChange('result', e.target.value, standardName)}
              input={<OutlinedInput label="Result" />}
            >
              <MenuItem value="">
                <em>All Results</em>
              </MenuItem>
              {uniqueResults.map(result => (
                <MenuItem key={result} value={result}>
                  {result}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => clearFilters(standardName)}
            sx={{ height: 40 }}
          >
            Clear Filters
          </Button>
        </Box>
        
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden',
          minHeight: 0
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
                  // 检查是否有数据
                  const hasData = Object.keys(filteredData).length > 0;
                  
                  if (!hasData) {
                    return (
                      <tr>
                        <td colSpan={4} style={{ 
                          padding: 24, 
                          textAlign: 'center', 
                          color: theme.palette.text.secondary,
                          border: `1px solid ${theme.palette.divider}`
                        }}>
                          <Typography variant="body2">
                            {Object.keys(data || {}).length === 0 
                              ? 'No data available for this standard'
                              : 'No results match the current filters'}
                          </Typography>
                        </td>
                      </tr>
                    );
                  }
                  
                  return Object.keys(filteredData).map((category, categoryIndex) => {
                    const criteria = filteredData[category];
                    if (!criteria || typeof criteria !== 'object') return null;
                    return Object.keys(criteria).map((subCategory, subCategoryIndex) => {
                      if (!criteria[subCategory] || typeof criteria[subCategory] !== 'object') return null;
                      return Object.keys(criteria[subCategory]).map((criterion, criterionIndex) => {
                        const criterionData = criteria[subCategory][criterion];
                        if (!Array.isArray(criterionData) || criterionData.length < 2) return null;
                        const [criteriaName, result, details, value] = criterionData;
                        const isCompliant = result && typeof result === 'string' && (result.toLowerCase() === 'yes' || result.toLowerCase() === 'few');
                        const isRisk = result && typeof result === 'string' && result.toLowerCase() === 'no';
                        
                        return (
                          <tr key={`${standardName}-${categoryIndex}-${subCategoryIndex}-${criterionIndex}`}>
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
                              color: isCompliant ? theme.palette.success.main : (isRisk ? theme.palette.error.main : 'inherit'),
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
                                    maxHeight: '3.6em',
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
      </>
    );
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
          {(griData || s2Data || s3Data) && !isVerifying && (
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
        ) : (
          <>
            {/* AASB S2 Summary Section */}
            {s2Data && esg.includes('AASB S2') && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  AASB S2 (Climate-related Financial Disclosures)
                </Typography>
                {renderSummaryCards(
                  [...s2SummaryCardsRow1, ...s2SummaryCardsRow2],
                  'S2',
                  handleCardClickWithStandard,
                  getSelectedCardForStandard('S2')
                )}
              </Box>
            )}

            {/* GRI Summary Section */}
            {griData && esg.includes('GRI') && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  GRI (Global Reporting Initiative)
                </Typography>
                {renderSummaryCards(
                  griSummaryCards,
                  'GRI',
                  handleCardClickWithStandard,
                  getSelectedCardForStandard('GRI')
                )}
              </Box>
            )}

            {/* AASB Scope 3 Summary Section */}
            {s3Data && esg.includes('AASB Scope 3') && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  AASB Scope 3 (Greenhouse Gas Emissions)
                </Typography>
                {renderSummaryCards(
                  s3SummaryCards,
                  'S3',
                  handleCardClickWithStandard,
                  getSelectedCardForStandard('S3')
                )}
              </Box>
            )}

            {/* If no data and not verifying, show prompt message */}
            {!griData && !s2Data && !s3Data && !isVerifying && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Upload your sustainability report to get started
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please upload a PDF report, select at least one ESG standard, then click "Verify Report"
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Details Section */}
      {(griData || s2Data || s3Data || isVerifying) && (
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
          ) : (
            <>
              {/* AASB S2 Details Section */}
              {s2Data && esg.includes('AASB S2') && (
                <Card variant="outlined" sx={{ height: 600, mb: 2 }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, flexShrink: 0 }}>
                      AASB S2 Criteria Details
                    </Typography>
                    {renderDetailsTable(s2Data, 'S2')}
                  </CardContent>
                </Card>
              )}

              {/* GRI Details Section */}
              {griData && esg.includes('GRI') && (
                <Card variant="outlined" sx={{ height: 600, mb: 2 }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, flexShrink: 0 }}>
                      GRI Criteria Details
                    </Typography>
                    {renderDetailsTable(griData, 'GRI')}
                  </CardContent>
                </Card>
              )}

              {/* AASB Scope 3 Details Section */}
              {s3Data && esg.includes('AASB Scope 3') && (
                <Card variant="outlined" sx={{ height: 600, mb: 2 }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, flexShrink: 0 }}>
                      AASB Scope 3 Criteria Details
                    </Typography>
                    {renderDetailsTable(s3Data, 'S3')}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Box>
      )}

      {/* AI Recommendations Section */}
      {(griData || s2Data || s3Data) && !isVerifying && (
        <Box id="ai-recommendations" sx={{ mt: 4 }}>
          <Grid container spacing={2} columns={12}>
            <Grid size={{ xs: 12 }}>
              <LLMRecommendations 
                esgData={esgData} 
                complianceData={complianceData}
                rawStandardsData={rawStandardsData}
                height={400}
              />
            </Grid>
          </Grid>
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