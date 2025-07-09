import * as React from 'react';
import { Typography, Button, Grid, Box, TextField, MenuItem, Select, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput, Card, CardContent, useTheme, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { fetchESGReportData, fetchComplianceAnalysis, fetchRecommendations } from '../services/apiService';

const metricsOptions = ['Metric 1', 'Metric 2', 'Metric 3'];
const esgOptions = ['ESG Standard 1', 'ESG Standard 2', 'ESG Standard 3'];

// 数据处理函数
const processData = (data) => {
  const results = {};
  
  // 遍历每个类别
  Object.keys(data).forEach(category => {
    const criteria = data[category];
    let totalCriteria = 0;
    let compliantCriteria = 0;
    
    // 遍历每个标准
    criteria.forEach(criterion => {
      criterion.forEach(item => {
        const [specificCriterion, auditResult, resultsData] = item;
        totalCriteria++;
        
        // 如果审计结果不是"no"，则认为是合规的
        if (auditResult.toLowerCase() !== 'no') {
          compliantCriteria++;
        }
      });
    });
    
    results[category] = {
      total: totalCriteria,
      compliant: compliantCriteria,
      ratio: `${compliantCriteria} out of ${totalCriteria}`
    };
  });
  
  return results;
};

// 计算合规率
const calculateComplianceRate = (data) => {
  let totalCriteria = 0;
  let compliantCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const criteria = data[category];
    criteria.forEach(criterion => {
      criterion.forEach(item => {
        const [specificCriterion, auditResult, resultsData] = item;
        totalCriteria++;
        if (auditResult.toLowerCase() !== 'no') {
          compliantCriteria++;
        }
      });
    });
  });
  
  return totalCriteria > 0 ? Math.round((compliantCriteria / totalCriteria) * 100) : 0;
};

// 计算绿洗风险（基于"Few"和"No"结果的比例）
const calculateGreenwashingRisk = (data) => {
  let totalCriteria = 0;
  let riskCriteria = 0;
  
  Object.keys(data).forEach(category => {
    const criteria = data[category];
    criteria.forEach(criterion => {
      criterion.forEach(item => {
        const [specificCriterion, auditResult, resultsData] = item;
        totalCriteria++;
        if (auditResult.toLowerCase() === 'few' || auditResult.toLowerCase() === 'no') {
          riskCriteria++;
        }
      });
    });
  });
  
  return totalCriteria > 0 ? Math.round((riskCriteria / totalCriteria) * 100 * 10) / 10 : 0;
};

// 数据映射函数 - 将JSON中的类别名称映射到显示名称
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
  
  // 文件上传状态
  const [uploadedFile, setUploadedFile] = React.useState(null);
  const [uploadedMetricsFile, setUploadedMetricsFile] = React.useState(null);
  
  // 数据状态
  const [esgData, setEsgData] = React.useState(null);
  const [complianceData, setComplianceData] = React.useState(null);
  const [recommendations, setRecommendations] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // 详情对话框状态
  const [detailDialog, setDetailDialog] = React.useState({
    open: false,
    title: '',
    content: ''
  });

  // 加载数据
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 并行加载数据
        const [esgResult, complianceResult] = await Promise.all([
          fetchESGReportData('QAN_2024', { start: date1, end: date2 }),
          fetchComplianceAnalysis()
        ]);
        
        if (esgResult.success && complianceResult.success) {
          setEsgData(esgResult.data);
          setComplianceData(complianceResult.data);
          
          // 加载建议
          const recommendationsResult = await fetchRecommendations(complianceResult.data);
          if (recommendationsResult.success) {
            setRecommendations(recommendationsResult.data);
          }
        } else {
          throw new Error(esgResult.error || complianceResult.error || 'Failed to load data');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [date1, date2]);

  // 处理数据
  const processedData = esgData ? processData(esgData) : {};
  const complianceRate = complianceData?.overall?.complianceRate || 0;
  const greenwashingRisk = complianceData?.overall?.greenwashingRisk || 0;

  // 定义summary区域的卡片数据
  const summaryCardsRow1 = [
    { label: 'Scope', value: processedData['Scope']?.ratio || '0 out of 0' },
    { label: 'Governance', value: processedData['Governance']?.ratio || '0 out of 0' },
    { label: 'Strategy', value: processedData['Strategy']?.ratio || '0 out of 0' },
    { label: 'Climate-related Risk and Opportunities', value: processedData['Climate-related risk and opportunities']?.ratio || '0 out of 0' },
    { label: 'Business Model and Value Chain', value: processedData['Business model and value chain']?.ratio || '0 out of 0' },
    { label: 'Strategy and Decision Making', value: processedData['Strategy and decision-making']?.ratio || '0 out of 0' },
    { label: 'Greenwashing Risk', value: `${greenwashingRisk}%`, highlight: true, warning: true },
  ];

  const summaryCardsRow2 = [
    { label: 'Financial Position and Financial Performance', value: processedData['Financial position, financial performance and cash flows']?.ratio || '0 out of 0' },
    { label: 'Climate Resilience', value: processedData['Climate resilience']?.ratio || '0 out of 0' },
    { label: 'Risk Management', value: processedData['Risk Management']?.ratio || '0 out of 0' },
    { label: 'Metrics and Targets', value: processedData['Metrics and Targets']?.ratio || '0 out of 0' },
    { label: 'Climate-related Metrics', value: processedData['Climate-related metrics']?.ratio || '0 out of 0' },
    { label: 'Climate-related Targets', value: processedData['Climate-related targets']?.ratio || '0 out of 0' },
    { label: 'Compliant Rate', value: `${complianceRate}%`, highlight: true, warning: true, sub: 'vs prev 11.6K (+10%)', subColor: 'success.main' },
  ];

  // 处理详情展开
  const handleDetailExpand = (criterion, resultsData) => {
    setDetailDialog({
      open: true,
      title: criterion,
      content: resultsData
    });
  };

  // 关闭详情对话框
  const handleDetailClose = () => {
    setDetailDialog({
      open: false,
      title: '',
      content: ''
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Inputs 区 */}
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
                        setUploadedFile(file);
                        console.log('Uploaded file:', file.name);
                        // 这里可以添加文件处理逻辑
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
                          setUploadedFile(file);
                          console.log('Re-uploaded file:', file.name);
                          // 这里可以添加文件处理逻辑
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
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Upload Metrics</Typography>
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
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadedMetricsFile(file);
                        console.log('Uploaded metrics file:', file.name);
                        // 这里可以添加文件处理逻辑
                      }
                    }}
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📊 Upload Metrics
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CSV, XLSX, XLS
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
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploadedMetricsFile(file);
                          console.log('Re-uploaded metrics file:', file.name);
                          // 这里可以添加文件处理逻辑
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
              <Button variant="contained" color="primary" sx={{ width: '100%', height: 56, fontWeight: 700, fontSize: 18 }}>
                Verify Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Summary Cards 区 */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Summary
      </Typography>
      
      {/* 第一行 - 7个卡片 */}
      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        {summaryCardsRow1.map((item, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 1.7 }}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                minHeight: 100,
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
                <Typography variant="body2" color="primary" fontWeight={500} noWrap>{item.label}</Typography>
                <Typography variant="h6" color={item.highlight ? 'primary' : 'text.primary'} fontWeight={700}>
                  {item.value}
                </Typography>
                {item.sub && <Typography variant="caption" color={item.subColor} fontWeight={600}>{item.sub}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* 第二行 - 7个卡片 */}
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {summaryCardsRow2.map((item, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 1.7 }}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                minHeight: 100,
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
                <Typography variant="body2" color="primary" fontWeight={500} noWrap>{item.label}</Typography>
                <Typography variant="h6" color={item.highlight ? 'primary' : 'text.primary'} fontWeight={700}>
                  {item.value}
                </Typography>
                {item.sub && <Typography variant="caption" color={item.subColor} fontWeight={600}>{item.sub}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Details Cards 区 */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Details
      </Typography>
      <Grid container spacing={2} columns={12}>
        {/* 左侧表格 */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined" sx={{ height: 800 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, flexShrink: 0 }}>ESG Criteria Details</Typography>
              <Box sx={{ 
                flex: 1, 
                overflow: 'hidden',
                minHeight: 0 // 重要：确保flex子元素可以收缩
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
                          width: '20%',
                          background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                        }}>Category</th>
                        <th style={{ 
                          padding: 8, 
                          border: `1px solid ${theme.palette.divider}`, 
                          fontWeight: 700, 
                          width: '40%',
                          background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                        }}>Criteria</th>
                        <th style={{ 
                          padding: 8, 
                          border: `1px solid ${theme.palette.divider}`, 
                          fontWeight: 700, 
                          width: '15%',
                          background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                        }}>Result</th>
                        <th style={{ 
                          padding: 8, 
                          border: `1px solid ${theme.palette.divider}`, 
                          fontWeight: 700, 
                          width: '25%',
                          background: theme.palette.mode === 'light' ? '#f8f6ff' : '#1e1e1e',
                          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f6ff'
                        }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {esgData && Object.keys(esgData).map((category, categoryIndex) => {
                        const criteria = esgData[category];
                        return criteria.map((criterionGroup, criterionIndex) => {
                          return criterionGroup.map((item, itemIndex) => {
                            const [specificCriterion, auditResult, resultsData] = item;
                            const isCompliant = auditResult.toLowerCase() !== 'no';
                            const isRisk = auditResult.toLowerCase() === 'few' || auditResult.toLowerCase() === 'no';
                            
                            return (
                              <tr key={`${categoryIndex}-${criterionIndex}-${itemIndex}`}>
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
                                  {specificCriterion}
                                </td>
                                <td style={{ 
                                  padding: 8, 
                                  border: `1px solid ${theme.palette.divider}`,
                                  textAlign: 'center',
                                  fontWeight: 600,
                                  color: isCompliant ? 'success.main' : 'error.main',
                                  fontSize: '0.8rem'
                                }}>
                                  {auditResult}
                                </td>
                                <td style={{ 
                                  padding: 8, 
                                  border: `1px solid ${theme.palette.divider}`,
                                  fontSize: '0.75rem',
                                  verticalAlign: 'top',
                                  maxWidth: 200,
                                  wordWrap: 'break-word'
                                }}>
                                  {resultsData ? (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        {resultsData.length > 100 ? 
                                          `${resultsData.substring(0, 100)}...` : 
                                          resultsData
                                        }
                                      </Typography>
                                      {resultsData.length > 100 && (
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
                                          onClick={() => handleDetailExpand(specificCriterion, resultsData)}
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
                      })}
                    </tbody>
                  </table>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* 右侧信息区 */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {/* Latest AASB S2 Standard Update 卡片 */}
            <Card variant="outlined" sx={{ flex: 0.3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Latest AASB S2 Standard Update</Typography>
                <Typography variant="body2" color="text.secondary">Edit text in left pane...</Typography>
              </CardContent>
            </Card>
            
            {/* AASB S2 and Materiality Matrix 卡片 */}
            <Card variant="outlined" sx={{ flex: 1.2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>AASB S2 and Materiality Matrix</Typography>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Title 1</Typography>
                  <Button size="small" variant="outlined" sx={{ ml: 1, fontSize: 12 }}>Metric 1</Button>
                </Box>
                {/* 热力图 */}
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Box sx={{ height: 16, bgcolor: theme.palette.mode === 'light' ? '#ede7f6' : 'rgba(124, 93, 250, 0.2)', borderRadius: 1, mb: 1 }}>
                    <Box sx={{ width: '85%', height: '100%', bgcolor: '#7c5dfa', borderRadius: 1 }} />
                  </Box>
                  {/* 热力图网格 */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mt: 1 }}>
                    {/* 表头 */}
                    <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}></Box>
                    <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>A</Box>
                    <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>B</Box>
                    <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>C</Box>
                    <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>D</Box>
                    <Box sx={{ p: 1, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>E</Box>
                    
                    {/* 数据行 */}
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
                          // 根据数值计算颜色强度 (0-100)
                          const intensity = Math.min(100, Math.max(0, value));
                          const bgColor = `hsl(260, 70%, ${100 - intensity * 0.6}%)`; // 从浅紫到深紫
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
            
            {/* Recommendations 卡片 */}
            <Card variant="outlined" sx={{ flex: 0.8 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, flexShrink: 0 }}>Recommendations</Typography>
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'hidden',
                  minHeight: 0
                }}>
                  <Box sx={{ 
                    height: '100%',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: theme.palette.mode === 'light' ? '#f1f1f1' : '#333',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.mode === 'light' ? '#c1c1c1' : '#666',
                      borderRadius: '3px',
                      '&:hover': {
                        background: theme.palette.mode === 'light' ? '#a8a8a8' : '#888',
                      },
                    },
                  }}>
                    {recommendations ? (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
                          {recommendations.summary.totalRecommendations} recommendations available
                        </Typography>
                        {recommendations.recommendations.map((rec, index) => (
                          <Box key={index} sx={{ mb: 1, pb: 1, borderBottom: index < recommendations.recommendations.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, fontSize: '0.75rem', mb: 0.5 }}>
                              {rec.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
                              {rec.description}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {greenwashingRisk > 10 ? 
                          `High greenwashing risk (${greenwashingRisk}%). Focus on improving transparency and disclosure quality.` :
                          `Low greenwashing risk (${greenwashingRisk}%). Continue maintaining high disclosure standards.`
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* 详情对话框 */}
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