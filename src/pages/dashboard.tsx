import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { fetchData } from '../components/FetchData';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { DashboardSummaryUrl } from '../services/ApiUrls';

// Цвета для лидов
const leadStatusColors: Record<string, string> = {
  new: '#339AF0',
  qualified: '#51CF66',
  recycled: '#FFD43B',
  disqualified: '#FA5252',
};

// Цвета для оппорчунити (все ключи в нижнем регистре)
const opportunityStatusColors: Record<string, string> = {
  qualification: '#51CF66',
  identify_decision_makers: '#FFA94D',
  proposal: '#339AF0',
  negotiation: '#845EF7',
};

function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [leadStatus, setLeadStatus] = useState<string | undefined>();
  const [opportunityStage, setOpportunityStage] = useState<
    string | undefined
  >();
  const [days, setDays] = useState<number>(7);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('Token') || '';
      const org = localStorage.getItem('org') || '';
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        org: org,
      };
      const params = new URLSearchParams();
      if (leadStatus) params.append('lead_status', leadStatus);
      if (opportunityStage)
        params.append('opportunity_stage', opportunityStage);
      if (days) params.append('days', days.toString());

      try {
        const res = await fetchData(
          `${DashboardSummaryUrl}?${params.toString()}`,
          'GET',
          null as any,
          headers
        );
        setData(res);
        // Временная отладка для проверки структуры данных
        console.log('Lead statuses:', Object.keys(res.leads_by_status || {}));
        console.log(
          'Opportunity stages:',
          Object.keys(res.opportunities_by_stage || {})
        );
        console.log('Sample lead:', res.recent_leads?.[0]);
        console.log('Sample opportunity:', res.recent_opportunities?.[0]);
      } catch (e) {
        setData(null);
      }
    };
    fetchDashboard();
  }, [leadStatus, opportunityStage, days]);

  if (!data) return null;

  // Для лидов используем leadStatusColors с нормализацией регистра
  const leadsPie = Object.entries(data.leads_by_status || {}).map(
    ([name, value]) => ({
      name,
      value,
      color: leadStatusColors[name.toLowerCase()] || '#eee',
    })
  );

  // Для оппорчунити используем opportunityStatusColors с нормализацией регистра
  const oppsPie = Object.entries(data.opportunities_by_stage || {}).map(
    ([name, value]) => ({
      name,
      value,
      color: opportunityStatusColors[name.toLowerCase()] || '#eee',
    })
  );

  const opportunityStages = Object.keys(data.opportunities_by_stage || {});

  function capitalize(str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return (
    <Box sx={{ p: 2, mt: 8, pr: 4 }}>
      {/* ВЕРХНИЕ КАРТОЧКИ */}
      <Grid container spacing={4} mb={2}>
        {' '}
        {/* Используем mb для большего отступа между карточками вверзу и нижними */}{' '}
        {[
          { label: 'Companies', value: data.companies_count },
          { label: 'Contacts', value: data.contacts_count },
          { label: 'Leads', value: data.leads_count },
          { label: 'Opportunities', value: data.opportunities_count },
          { label: 'Accounts', value: data.accounts_count || 140 },
          {
            label: 'Pipeline Value',
            value: `$${Number(data.total_pipeline_value).toLocaleString()}`,
          },
        ].map((item, idx) => (
          <Grid item xs={2} key={item.label}>
            <Paper
              sx={{
                width: '92%',
                minWidth: 100,
                height: 90,
                background: '#fff',
                boxShadow:
                  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px rgba(0,0,0,0.14),0px 1px 3px rgba(0,0,0,0.12)',
                borderRadius: 1,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Roboto',
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#1A3353',
                  mb: 0.3,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Roboto',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#339AF0',
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={600} mb={2}>
              Leads ({data.leads_count})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 500, mr: 1 }}>by</Typography>
              <FormControl size="small" sx={{ minWidth: 136 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={leadStatus || ''}
                  label="Status"
                  onChange={(e) => setLeadStatus(e.target.value || undefined)}
                >
                  <MenuItem value="">All</MenuItem>
                  {data.lead_status_choices?.map((status: any) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography sx={{ fontWeight: 500, ml: 2, mr: 1 }}>
                last
              </Typography>
              <FormControl size="small" sx={{ minWidth: 136 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={days}
                  label="Period"
                  onChange={(e) => setDays(Number(e.target.value))}
                >
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={leadsPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    // вычисляем координаты для текста
                    const safeMidAngle = midAngle ?? 0;
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-safeMidAngle * RADIAN);
                    const y = cy + radius * Math.sin(-safeMidAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#fff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight={600}
                      >
                        {`${((percent ?? 0) * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {leadsPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="square"
                  formatter={(value: string) => capitalize(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* <Grid item xs={6} sx={{ marginLeft: 'auto' }}></Grid> */}
        <Grid item xs={6} sx={{ ml: 0, pl: 7 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={600} mb={2}>
              Opportunities ({data.opportunities_count})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 500, mr: 2 }}>by</Typography>
              <FormControl size="small" sx={{ minWidth: 136 }}>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={opportunityStage || ''}
                  label="Stage"
                  onChange={(e) =>
                    setOpportunityStage(e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {data.opportunity_stage_choices?.map((stage: any) => (
                    <MenuItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography sx={{ fontWeight: 500, ml: 2, mr: 1 }}>
                last
              </Typography>
              <FormControl size="small">
                <InputLabel>Period</InputLabel>
                <Select
                  value={days}
                  label="Period"
                  onChange={(e) => setDays(Number(e.target.value))}
                >
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={oppsPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const safeMidAngle = midAngle ?? 0;
                    const x = cx + radius * Math.cos(-safeMidAngle * RADIAN);
                    const y = cy + radius * Math.sin(-safeMidAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#fff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight={600}
                      >
                        {`${((percent ?? 0) * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {oppsPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="square"
                  formatter={(value: string) => capitalize(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={600} mb={2}>
              Recent Leads
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Lead Name</TableCell>
                  <TableCell>Last Update Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recent_leads?.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{lead.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lead.company_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{lead.updated_at}</TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        sx={{
                          background:
                            leadStatusColors[lead.status?.toLowerCase()] ||
                            '#eee',
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={600} mb={2}>
              Recent Opportunities
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Opportunity Name</TableCell>
                  <TableCell>Last Update Date</TableCell>
                  <TableCell>Stage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recent_opportunities?.map((opp: any) => (
                  <TableRow key={opp.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{opp.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {opp.company_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{opp.updated_at}</TableCell>
                    <TableCell>
                      <Chip
                        label={opp.stage_display || opp.stage}
                        sx={{
                          background:
                            opportunityStatusColors[opp.stage] || '#eee',
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
