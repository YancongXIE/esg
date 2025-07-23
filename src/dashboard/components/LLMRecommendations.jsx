import * as React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  generateLLMRecommendations,
  generateFallbackRecommendations
} from '../services/llmService';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';

const PriorityChip = ({ priority }) => {
  const theme = useTheme();
  
  const getPriorityColor = () => {
    switch (priority) {
      case 'High':
        return { bg: theme.palette.error.main, color: 'white' };
      case 'Medium':
        return { bg: theme.palette.warning.main, color: 'white' };
      case 'Low':
        return { bg: theme.palette.success.main, color: 'white' };
      default:
        return { bg: theme.palette.grey[500], color: 'white' };
    }
  };

  const colors = getPriorityColor();
  
  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 20
      }}
    />
  );
};

const CategoryChip = ({ category }) => {
  const theme = useTheme();
  
  const getCategoryColor = () => {
    switch (category) {
      case 'Governance':
        return { bg: theme.palette.primary.main, color: 'white' };
      case 'Environment':
        return { bg: theme.palette.success.main, color: 'white' };
      case 'Social':
        return { bg: theme.palette.secondary.main, color: 'white' };
      default:
        return { bg: theme.palette.grey[500], color: 'white' };
    }
  };

  const colors = getCategoryColor();
  
  return (
    <Chip
      label={category}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 20
      }}
    />
  );
};

export default function LLMRecommendations({ esgData, complianceData, height = 400 }) {
  const theme = useTheme();
  const [recommendations, setRecommendations] = React.useState(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [useLLM, setUseLLM] = React.useState(true);
  const [detailDialog, setDetailDialog] = React.useState({
    open: false,
    recommendation: null
  });

  // Generate recommendations
  const generateRecommendations = async (useLLMService = true) => {
    if (!esgData || !complianceData) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      let result;
      
      if (useLLMService) {
        // Try to use LLM service
        const apiKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;
        
        if (apiKey) {
          result = await generateLLMRecommendations(esgData, complianceData, apiKey);
        } else {
          // If no API key, use fallback
          result = generateFallbackRecommendations(complianceData);
        }
      } else {
        // Use fallback directly
        result = generateFallbackRecommendations(complianceData);
      }
      
      if (result.success) {
        setRecommendations(result.data);
        setUseLLM(useLLMService);
      } else {
        // If LLM fails, try fallback
        const fallbackResult = generateFallbackRecommendations(complianceData);
        setRecommendations(fallbackResult.data);
        setUseLLM(false);
        setError(`AI service unavailable: ${result.error}. Using rule-based recommendations.`);
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      const fallbackResult = generateFallbackRecommendations(complianceData);
      setRecommendations(fallbackResult.data);
      setUseLLM(false);
      setError('Failed to generate AI recommendations. Using rule-based recommendations.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate recommendations when data changes
  React.useEffect(() => {
    if (esgData && complianceData) {
      generateRecommendations();
    }
  }, [esgData, complianceData]);

  // Handle detail expansion
  const handleDetailExpand = (recommendation) => {
    setDetailDialog({
      open: true,
      recommendation
    });
  };

  // Close detail dialog
  const handleDetailClose = () => {
    setDetailDialog({
      open: false,
      recommendation: null
    });
  };

  return (
    <>
      <Card variant="outlined" sx={{ height }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexShrink: 0 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              AI Recommendations
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!useLLM && (
                <Tooltip title="Using fallback recommendations (LLM unavailable)">
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              )}
              <Tooltip title="Regenerate recommendations">
                <IconButton
                  size="small"
                  onClick={() => generateRecommendations(useLLM)}
                  disabled={isGenerating}
                  sx={{ p: 0.5 }}
                >
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
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
              {isGenerating ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {useLLM ? 'Generating AI recommendations...' : 'Generating recommendations...'}
                  </Typography>
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : recommendations ? (
                <>
                  <Box sx={{ mb: 2, p: 1, bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                      {recommendations.summary.totalRecommendations} recommendations • {recommendations.summary.highPriorityCount} high priority
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {recommendations.summary.overallAssessment}
                    </Typography>
                  </Box>
                  
                  {recommendations.recommendations.map((rec, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2, 
                        p: 1.5, 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        bgcolor: theme.palette.mode === 'light' ? '#ffffff' : 'rgba(255,255,255,0.02)',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.05)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, fontSize: '0.8rem', flex: 1 }}>
                          {rec.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                          <PriorityChip priority={rec.priority} />
                          <CategoryChip category={rec.category} />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1, lineHeight: 1.4 }}>
                        <strong>Problem:</strong> {rec.problem}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1, lineHeight: 1.4 }}>
                        <strong>Suggestion:</strong> {rec.suggestion}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        <strong>Expected Outcome:</strong> {rec.expectedOutcome}
                      </Typography>
                      
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          mt: 1, 
                          fontSize: '0.7rem', 
                          py: 0.5, 
                          px: 1,
                          height: '24px'
                        }}
                        onClick={() => handleDetailExpand(rec)}
                      >
                        View Details
                      </Button>
                    </Box>
                  ))}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4, textAlign: 'center', py: 4 }}>
                  No recommendations available. Please verify a report first.
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={detailDialog.open} onClose={handleDetailClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {detailDialog.recommendation?.title}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <PriorityChip priority={detailDialog.recommendation?.priority} />
              <CategoryChip category={detailDialog.recommendation?.category} />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {detailDialog.recommendation && (
            <Box sx={{ py: 1 }}>
              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
                Problem Description
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                {detailDialog.recommendation.problem}
              </Typography>
              
              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
                Specific Suggestion
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                {detailDialog.recommendation.suggestion}
              </Typography>
              
              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
                Expected Outcome
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {detailDialog.recommendation.expectedOutcome}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 