import * as React from 'react';
import { Typography, Button, Grid, Box, TextField, MenuItem, Select, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput, Card, CardContent, useTheme } from '@mui/material';

const metricsOptions = ['Metric 1', 'Metric 2', 'Metric 3'];
const esgOptions = ['ESG Standard 1', 'ESG Standard 2', 'ESG Standard 3'];

export default function SYDashboardContent() {
  const theme = useTheme();
  const [metrics, setMetrics] = React.useState([]);
  const [esg, setEsg] = React.useState([]);
  const [date1, setDate1] = React.useState('2023-05-23');
  const [date2, setDate2] = React.useState('2023-07-16');

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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  type="date"
                  size="small"
                  value={date1}
                  onChange={e => setDate1(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="date"
                  size="small"
                  value={date2}
                  onChange={e => setDate2(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Upload Metrics */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Upload Metrics</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Metrics</InputLabel>
                <Select
                  multiple
                  value={metrics}
                  onChange={e => setMetrics(e.target.value)}
                  input={<OutlinedInput label="Metrics" />}
                  renderValue={selected => selected.join(', ')}
                >
                  {metricsOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={metrics.indexOf(option) > -1} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {[
          { label: 'SCOPE', value: '3 out of 4' },
          { label: 'Governance', value: '8 out of 10' },
          { label: 'Strategy', value: '5 out of 6' },
          { label: 'Climate-related Risk and Opportunities', value: '5 out of 5' },
          { label: 'Business Model and Value Chain', value: '2 out of 2' },
          { label: 'Strategy and Decision Making', value: '7 out of 8' },
          { label: 'Greenwashing Risk', value: '5.75%', highlight: true, warning: true },
          { label: 'Financial position, Financial Performance', value: '15 out of 15' },
          { label: 'Climate Resilience', value: '7 out of 8' },
          { label: 'Risk Management', value: '11 out of 12' },
          { label: 'Metrics and Targets', value: '2 out of 3' },
          { label: 'Climate-related Metrics', value: '15 out of 17' },
          { label: 'Climate-related Targets', value: '22 out of 22' },
          { label: 'Compliant Rate', value: '85%', highlight: true, warning: true, sub: 'vs prev 11.6K (+10%)', subColor: 'success.main' },
        ].map((item, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
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
                <Typography variant="body2" color={item.highlight ? 'primary' : 'text.secondary'} fontWeight={500} noWrap>{item.label}</Typography>
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
          <Card variant="outlined" sx={{ height: '100%', minHeight: 350 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>AASB Scope2</Typography>
              <Box sx={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', flex: 1 }}>
                  <thead>
                    <tr style={{ 
                      background: theme.palette.mode === 'light' ? '#f8f6ff' : 'rgba(37, 16, 104, 0.5) !important',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(37, 16, 104, 0.5)' : undefined
                    }}>
                      <th style={{ padding: 8, border: `1px solid ${theme.palette.divider}`, fontWeight: 700 }}>Criteria</th>
                      <th style={{ padding: 8, border: `1px solid ${theme.palette.divider}`, fontWeight: 700 }}>Included</th>
                      <th style={{ padding: 8, border: `1px solid ${theme.palette.divider}`, fontWeight: 700 }}>Excluded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['SCOPE', 'data', 'data', 'data', 'data', 'data', 'data', 'data', 'data'].map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8, border: `1px solid ${theme.palette.divider}` }}>{row}</td>
                        <td style={{ padding: 8, border: `1px solid ${theme.palette.divider}` }}>data</td>
                        <td style={{ padding: 8, border: `1px solid ${theme.palette.divider}` }}>data</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* 右侧信息区 */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {/* Latest AASB S2 Standard Update 卡片 */}
            <Card variant="outlined" sx={{ flex: 0.5 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Latest AASB S2 Standard Update</Typography>
                <Typography variant="body2" color="text.secondary">Edit text in left pane...</Typography>
              </CardContent>
            </Card>
            
            {/* AASB S2 and Materiality Matrix 卡片 */}
            <Card variant="outlined" sx={{ flex: 2 }}>
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
            <Card variant="outlined" sx={{ flex: 0.5 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Recommendations</Typography>
                <Typography variant="body2" color="text.secondary">Edit text in left pane...</Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 