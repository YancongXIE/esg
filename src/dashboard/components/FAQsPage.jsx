import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

const FAQsContent = () => {
  const faqs = [
    {
      id: 1,
      question: "What do the priority levels (High, Medium, Low) mean in AI Recommendations?",
      answer: "The AI Recommendations section uses priority levels to help you understand the urgency and importance of each recommendation:",
      details: [
        {
          level: "High Priority",
          color: "error",
          description: "Critical issues that require immediate attention. These recommendations address significant compliance gaps or high-impact areas that could affect your ESG performance or regulatory compliance.",
          examples: [
            "Missing mandatory climate risk disclosures",
            "Incomplete GHG emissions reporting",
            "Lack of governance structure documentation"
          ]
        },
        {
          level: "Medium Priority", 
          color: "warning",
          description: "Important improvements that should be addressed in the near term. These recommendations help enhance your ESG reporting quality and stakeholder confidence.",
          examples: [
            "Improving data collection processes",
            "Enhancing stakeholder engagement documentation",
            "Strengthening risk management frameworks"
          ]
        },
        {
          level: "Low Priority",
          color: "success", 
          description: "Nice-to-have enhancements that can be addressed over time. These recommendations focus on optimization and best practices.",
          examples: [
            "Implementing advanced analytics tools",
            "Enhancing visual presentation of data",
            "Developing additional stakeholder communication channels"
          ]
        }
      ]
    },
    {
      id: 2,
      question: "How are the priority levels determined?",
      answer: "Priority levels are determined based on several factors:",
      details: [
        "Regulatory compliance requirements and deadlines",
        "Materiality assessment of the ESG topic",
        "Current performance gaps compared to industry standards",
        "Potential impact on stakeholder confidence",
        "Resource requirements and implementation complexity"
      ]
    },
    {
      id: 3,
      question: "What should I do with High Priority recommendations?",
      answer: "High Priority recommendations should be your immediate focus:",
      details: [
        "Review each recommendation carefully",
        "Assess current compliance status",
        "Develop action plans with specific timelines",
        "Assign responsibility to appropriate team members",
        "Monitor progress regularly",
        "Consider seeking external expertise if needed"
      ]
    },
    {
      id: 4,
      question: "How often should I check the AI Recommendations?",
      answer: "We recommend checking AI Recommendations:",
      details: [
        "After each new report upload",
        "When ESG standards are updated",
        "Before major reporting deadlines",
        "At least quarterly for ongoing monitoring",
        "When significant business changes occur"
      ]
    }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HelpRoundedIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
          <Typography variant="h5" component="h1" fontWeight={600}>
            Frequently Asked Questions
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Find answers to common questions about using the ESG Dashboard and understanding AI Recommendations.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 3 }}>
          AI Recommendations Priority Levels
        </Typography>
        
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Understanding Priority Levels
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The AI Recommendations section categorizes suggestions into three priority levels to help you prioritize your ESG improvement efforts effectively.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                level: "High Priority",
                color: "error",
                description: "Critical issues requiring immediate attention",
                bgColor: "rgba(211, 47, 47, 0.1)",
                borderColor: "error.main"
              },
              {
                level: "Medium Priority", 
                color: "warning",
                description: "Important improvements for near-term focus",
                bgColor: "rgba(237, 108, 2, 0.1)",
                borderColor: "warning.main"
              },
              {
                level: "Low Priority",
                color: "success", 
                description: "Enhancement opportunities for future consideration",
                bgColor: "rgba(46, 125, 50, 0.1)",
                borderColor: "success.main"
              }
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${item.borderColor}`,
                  bgcolor: item.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Chip 
                  label={item.level} 
                  color={item.color} 
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.primary">
                  {item.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      <Box>
        <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 3 }}>
          Common Questions
        </Typography>
        
        {faqs.map((faq) => (
          <Accordion key={faq.id} sx={{ mb: 2, boxShadow: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Typography variant="h6" fontWeight={500}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'background.default' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {faq.answer}
              </Typography>
              
              {faq.id === 1 ? (
                // Special formatting for priority levels FAQ
                <Box>
                  {faq.details.map((detail, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={detail.level} 
                          color={detail.color} 
                          size="small"
                          sx={{ mr: 2, fontWeight: 600 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {detail.description}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        Examples:
                      </Typography>
                      <List dense>
                        {detail.examples.map((example, exIndex) => (
                          <ListItem key={exIndex} sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={example}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      {index < faq.details.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </Box>
              ) : (
                // Regular list formatting for other FAQs
                <List dense>
                  {faq.details.map((detail, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={`• ${detail}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InfoRoundedIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Need More Help?
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          If you have additional questions or need technical support, please contact our support team or visit our documentation.
        </Typography>
      </Box>
    </Box>
  );
};

export default FAQsContent;
