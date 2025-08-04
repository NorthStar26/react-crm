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
import '../styles/table-styles.css';

// Цвета для лидов
const leadStatusColors: Record<string, string> = {
  new: '#339AF0',
  qualified: '#51CF66',
  recycled: '#FFA94D',
  disqualified: '#FA5252',
};

// Цвета для оппорчунити (все ключи в нижнем регистре)
const opportunityStatusColors: Record<string, string> = {
  qualification: '#51CF66',
  identify_decision_makers: '#FFA94D',
  proposal: '#339AF0',
  negotiation: '#845EF7',
};
const opportunityStageOrder = [
  'qualification',
  'identify_decision_makers',
  'negotiation',
  'proposal',
];
const opportunityStageShortNames: Record<string, string> = {
  qualification: 'Qualification',
  identify_decision_makers: 'Identified DM',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
};
// function formatDate(dateStr: string) {
//   if (!dateStr) return '';
//   const date = new Date(dateStr);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = date.toLocaleString('en', { month: 'long' }); // Месяц буквами
//   const year = date.getFullYear();
//   return `${day} ${month} ${year}`;
// }
function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en', { month: 'long' }); // Месяц буквами
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
}
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
  const oppsPie = Object.entries(data.opportunities_by_stage || {})
    .filter(([name]) => {
      const lower = name.toLowerCase();
      return lower !== 'close' && lower !== 'closed won';
    })
    .map(([name, value]) => ({
      name,
      value,
      color: opportunityStatusColors[name.toLowerCase()] || '#eee',
    }));

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
            value: `€${Number(data.total_pipeline_value).toLocaleString()}`,
            isPipeline: true,
          },
        ].map((item, idx) => (
          <Grid item xs={2} key={item.label}>
            <Paper
              sx={{
                width: '95%',
                minWidth: 100,
                height: 90,
                background: '#fff',
                boxShadow:
                  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px rgba(0,0,0,0.14),0px 1px 3px rgba(0,0,0,0.12)',
                borderRadius: 1,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Roboto',
                  fontWeight: 600,
                  fontSize: 16,
                  color: '#1A3353',
                  mb: 0.3,
                  // textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Roboto',
                  fontWeight: 700,
                  fontSize: String(item.value).length > 10 ? 18 : 24,
                  color: '#339AF0',
                  textAlign: String(item.value).length > 3 ? 'center' : 'right',
                  mt: 'auto',
                  width: '100%',
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
                  wrapperStyle={{ width: 130 }}
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
                      {opportunityStageShortNames[stage.value?.toLowerCase()] ||
                        capitalize(stage.label)}
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
                  wrapperStyle={{ width: 130 }}
                  formatter={(value: string) =>
                    opportunityStageShortNames[value.toLowerCase()] ||
                    capitalize(value)
                  }
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
            <Box
              className="ag-theme-alpine leads-ag-theme"
              sx={{
                width: '100%',
                // Стили темы AG Grid
                '--ag-header-background-color': '#2E4258',
                '--ag-header-foreground-color': '#FFFFFF',
                '--ag-header-border-color': '#D9EBFE',
                '--ag-odd-row-background-color': '#FFFFFF',
                '--ag-even-row-background-color': '#F9FAFB',
                '--ag-row-border-color': '#D9EBFE',
                '--ag-cell-horizontal-padding': '4px',
                '--ag-header-cell-padding': '8px 20px',
                '& .ag-header-cell': {
                  paddingLeft: '20px',
                  paddingRight: '20px',
                },
                '& .ag-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                },
                '& .ag-header-cell-label': {
                  justifyContent: 'flex-start', // Выравнивание заголовков по левому краю
                },
              }}
            >
              <Table size="small">
                <TableHead
                  sx={{
                    borderRadius: '8px 8px 0 0',
                    overflow: 'hidden',
                    '& .MuiTableRow-root': {
                      borderRadius: '8px 8px 0 0',
                    },
                  }}
                >
                  <TableRow>
                    <TableCell
                      width="40%"
                      sx={{
                        background: '#2E4258',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        fontFamily: 'Roboto',
                        fontSize: 16,
                        borderBottom: '1px solid #D9EBFE',
                        padding: '12px 20px',
                        paddingLeft: '20px',
                        '&:first-of-type': {
                          borderRadius: '8px 0 0 0',
                        },
                      }}
                    >
                      Lead Name
                    </TableCell>
                    <TableCell
                      width="30%"
                      align="left"
                      sx={{
                        background: '#2E4258',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        fontFamily: 'Roboto',
                        fontSize: 16,
                        borderBottom: '1px solid #D9EBFE',
                        padding: '12px 20px',
                      }}
                    >
                      Last Update Date
                    </TableCell>
                    <TableCell
                      width="30%"
                      align="center"
                      sx={{
                        background: '#2E4258',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        fontFamily: 'Roboto',
                        fontSize: 16,
                        borderBottom: '1px solid #D9EBFE',
                        padding: '12px 20px',
                        paddingLeft: '20px',
                        '&:last-of-type': {
                          borderRadius: '0 8px 0 0',
                        },
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recent_leads?.map((lead: any, index: number) => (
                    <TableRow
                      key={lead.id}
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                        '&:hover': { backgroundColor: '#F3F8FF' },
                        borderBottom: '1px solid #D9EBFE',
                        height: '80px',
                      }}
                    >
                      <TableCell sx={{ border: 'none' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography
                            fontWeight={500}
                            fontSize={16}
                            color="#1A3353"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { color: '#1976d2' },
                            }}
                          >
                            {lead.company_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontSize={14}
                            color="#1A3353"
                            sx={{ mt: 0.5 }}
                          >
                            {lead.contact_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{ border: 'none', color: '#1A3353', fontSize: 16 }}
                      >
                        {formatDate(lead.updated_at)}
                      </TableCell>
                      <TableCell
                        sx={{
                          border: 'none',
                          textAlign: 'right',
                          paddingRight: '20px',
                        }}
                      >
                        <Chip
                          label={lead.status}
                          sx={{
                            background:
                              leadStatusColors[lead.status?.toLowerCase()] ||
                              '#eee',
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: 14,
                            minWidth: 110,
                            height: 30,
                            borderRadius: '1.67772e+07px',
                            justifyContent: 'center',
                            boxShadow:
                              'inset 0px 0px 0px 2px rgba(0, 153, 102, 0.2)',
                            padding: '4px 12px',
                            border: '1px solid transparent',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
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
                    <TableCell>{formatDate(opp.updated_at)}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          opportunityStageShortNames[
                            (opp.stage_display || opp.stage)?.toLowerCase()
                          ] || capitalize(opp.stage_display || opp.stage)
                        }
                        sx={{
                          background:
                            opportunityStatusColors[opp.stage] || '#eee',
                          color: '#fff',
                          fontWeight: 600,
                          minWidth: 110,
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
