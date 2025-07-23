import * as React from 'react';
import { Typography, Button, Grid, Box, TextField, MenuItem, Select, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput, Card, CardContent, useTheme, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { fetchESGReportData, fetchComplianceAnalysis, fetchRecommendations, sendReportToServer } from '../services/apiService';
import LLMRecommendations from './LLMRecommendations';

const metricsOptions = ['Metric 1', 'Metric 2', 'Metric 3'];
const esgOptions = ['ESG Standard 1', 'ESG Standard 2', 'ESG Standard 3'];

// Data processing function
const processData = (data) => {
  const results = {};
  
  // Iterate through each category (metric and standard)
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    results[category] = {};
    
    // Iterate through each subcategory
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      let totalCriteria = 0;
      let compliantCriteria = 0;
      
      // Iterate through each standard
      Object.keys(subCategoryData).forEach(criterion => {
        const [result, details] = subCategoryData[criterion];
        totalCriteria++;
        
        // If result is "yes", consider it compliant
        if (result.toLowerCase() === 'yes') {
          compliantCriteria++;
        }
      });
      
      results[category][subCategory] = {
        total: totalCriteria,
        compliant: compliantCriteria,
        ratio: `${compliantCriteria} out of ${totalCriteria}`
      };
    });
  });
  
  return results;
};

// Calculate compliance rate
const calculateComplianceRate = (data) => {
  let totalCriteria = 0;
  let compliantCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      Object.keys(subCategoryData).forEach(criterion => {
        const [result, details] = subCategoryData[criterion];
        totalCriteria++;
        if (result.toLowerCase() === 'yes') {
          compliantCriteria++;
        }
      });
    });
  });
  
  return totalCriteria > 0 ? Math.round((compliantCriteria / totalCriteria) * 100) : 0;
};

// Calculate greenwashing risk (based on "Few" and "No" result ratios)
const calculateGreenwashingRisk = (data) => {
  let totalCriteria = 0;
  let riskCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const categoryData = data[category];
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      Object.keys(subCategoryData).forEach(criterion => {
        const [result, details] = subCategoryData[criterion];
        totalCriteria++;
        if (result.toLowerCase() === 'few' || result.toLowerCase() === 'no') {
          riskCriteria++;
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

export default function SYDashboardContent() {
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
        // Process returned data
        setEsgData(result.data);
        
        // Calculate compliance data
        const complianceResult = calculateComplianceFromData(result.data);
        setComplianceData(complianceResult);
        
        console.log('Verification completed successfully:', result.data);
        console.log('Processed data:', processData(result.data));
        console.log('Compliance result:', complianceResult);
      } else {
        setVerificationError(result.error || 'Failed to verify report');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError(error.message || 'An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  // Calculate compliance from API returned data
  const calculateComplianceFromData = (data) => {
    let totalCriteria = 0;
    let compliantCriteria = 0;
    let riskCriteria = 0;
    
    // Iterate through metric and standard data
    Object.keys(data).forEach(category => {
      const categoryData = data[category];
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        Object.keys(subCategoryData).forEach(criterion => {
          const [result, details] = subCategoryData[criterion];
          totalCriteria++;
          
          if (result.toLowerCase() === 'yes') {
            compliantCriteria++;
          } else if (result.toLowerCase() === 'few' || result.toLowerCase() === 'no') {
            riskCriteria++;
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
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        Object.keys(subCategoryData).forEach(criterion => {
          const [result, details] = subCategoryData[criterion];
          results.add(result);
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
      const filteredCategoryData = {};
      
      Object.keys(categoryData).forEach(subCategory => {
        const subCategoryData = categoryData[subCategory];
        const filteredSubCategoryData = {};
        
        Object.keys(subCategoryData).forEach(criterion => {
          const [result, details] = subCategoryData[criterion];
          
          // Category filter
          if (filters.category && mapCategoryToDisplay(category) !== filters.category) {
            return;
          }
          
          // Criteria filter
          if (filters.criteria && !criterion.toLowerCase().includes(filters.criteria.toLowerCase())) {
            return;
          }
          
          // Result filter
          if (filters.result && result !== filters.result) {
            return;
          }
          
          filteredSubCategoryData[criterion] = [result, details];
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

  // Define summary card data
  const summaryCardsRow1 = [
    { label: 'Scope', value: processedData['standard']?.Scope?.ratio || '0 out of 0' },
    { label: 'Governance', value: processedData['standard']?.Governance?.ratio || '0 out of 0' },
    { label: 'Strategy', value: processedData['standard']?.Strategy?.ratio || '0 out of 0' },
    { label: 'Climate-related Risk and Opportunities', value: processedData['standard']?.['Climate-related risk and opportunities']?.ratio || '0 out of 0' },
    { label: 'Business Model and Value Chain', value: processedData['standard']?.['Business model and value chain']?.ratio || '0 out of 0' },
    { label: 'Strategy and Decision Making', value: processedData['standard']?.['Strategy and decision-making']?.ratio || '0 out of 0' },
    { label: 'Greenwashing Risk', value: `${greenwashingRisk}%`, highlight: true, warning: true },
  ];

  const summaryCardsRow2 = [
    { label: 'Financial Position and Financial Performance', value: processedData['standard']?.['Financial position, financial performance and cash flows']?.ratio || '0 out of 0' },
    { label: 'Climate Resilience', value: processedData['standard']?.['Climate resilience']?.ratio || '0 out of 0' },
    { label: 'Risk Management', value: processedData['standard']?.['Risk Management']?.ratio || '0 out of 0' },
    { label: 'Metrics and Targets', value: processedData['standard']?.['Metrics and Targets']?.ratio || '0 out of 0' },
    { label: 'Climate-related Metrics', value: processedData['standard']?.['Climate-related metrics']?.ratio || '0 out of 0' },
    { label: 'Climate-related Targets', value: processedData['standard']?.['Climate-related targets']?.ratio || '0 out of 0' },
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
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Inputs
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {/* Sustainability Report */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                      📄 Upload Report
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
                      📄 {uploadedFile.name}
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
        {/* Upload Metrics */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Upload Metrics (Optional)</Typography>
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
                      📊 Upload Metrics
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      JSON (optional - will merge with standard criteria)
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
                      📊 {uploadedMetricsFile.name}
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
        </Grid>
        {/* Select ESG Standards */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
      
      {/* Latest AASB S2 Standard Update */}
      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 3 }}>
        Latest AASB S2 Standard Update
      </Typography>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">Edit text in left pane...</Typography>
        </CardContent>
      </Card>
      
      {/* Summary Cards Area */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Summary
      </Typography>
      
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
          {[...summaryCardsRow1, ...summaryCardsRow2].map((item, idx) => (
            <Card 
              key={idx}
              variant="outlined" 
              sx={{ 
                height: '100%',
                width: '100%',
                minWidth: 120,
                position: 'relative',
                ...(item.highlight && {
                  bgcolor: theme.palette.mode === 'light' ? '#f8f6ff' : 'rgba(124, 93, 250, 0.1)',
                }),
                ...(item.warning && {
                  borderLeft: '4px solid #ff9800',
                  borderTop: `1px solid ${theme.palette.divider}`,
                  borderRight: `1px solid ${theme.palette.divider}`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                })
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="primary" fontWeight={700} noWrap>{item.label}</Typography>
                <Typography variant="h6" color={item.highlight ? 'primary' : 'text.primary'} fontWeight={700}>
                  {item.value}
                </Typography>
                {item.sub && <Typography variant="caption" color={item.subColor} fontWeight={600}>{item.sub}</Typography>}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        /* Initial state: show no content */
        null
      )}

      {/* If no data and not verifying, show prompt message */}
      {!esgData && !isVerifying && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Upload your sustainability report and metrics to get started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please upload a PDF report and JSON metrics file, then click "Verify Report"
          </Typography>
        </Box>
      )}

      {/* Details Section */}
      {(esgData || isVerifying) && (
        <>
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
                              width: '30%',
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
                              width: '50%',
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
                                  const [result, details] = criteria[subCategory][criterion];
                                  const isCompliant = result.toLowerCase() !== 'no';
                                  const isRisk = result.toLowerCase() === 'few' || result.toLowerCase() === 'no';
                                  
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
                                        {criterion}
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
                                                onClick={() => handleDetailExpand(criterion, details)}
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

              {/* Two-column layout below */}
              <Grid container spacing={2} columns={12}>
                {/* AASB S2 and Materiality Matrix - 6 columns */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card variant="outlined" sx={{ height: 400 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>AASB S2 and Materiality Matrix</Typography>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Title 1</Typography>
                        <Button size="small" variant="outlined" sx={{ ml: 1, fontSize: 12 }}>Metric 1</Button>
                      </Box>
                      {/* Heatmap */}
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Box sx={{ height: 16, bgcolor: theme.palette.mode === 'light' ? '#ede7f6' : 'rgba(124, 93, 250, 0.2)', borderRadius: 1, mb: 1 }}>
                          <Box sx={{ width: '85%', height: '100%', bgcolor: '#7c5dfa', borderRadius: 1 }} />
                        </Box>
                        {/* Heatmap grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mt: 1 }}>
                          {/* Header */}
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}></Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>A</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>B</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>C</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>D</Box>
                          <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>E</Box>
                          
                          {/* Data rows */}
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
                                // Calculate color intensity based on value (0-100)
                                const intensity = Math.min(100, Math.max(0, value));
                                const bgColor = `hsl(260, 70%, ${100 - intensity * 0.6}%)`; // From light purple to dark purple
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
                </Grid>
                
                {/* Recommendations - 6 columns */}
                <Grid size={{ xs: 12, lg: 6 }}>
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
        </>
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