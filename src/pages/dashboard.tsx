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
} from '@mui/material';
import { fetchData } from '../components/FetchData';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

import { DashboardSummaryUrl } from '../services/ApiUrls';

const COLORS = [
  '#339AF0',
  '#51CF66',
  '#FFD43B',
  '#FF6B6B',
  '#845EF7',
  '#63E6BE',
];

const statusColors: Record<string, string> = {
  NEW: '#339AF0',
  Qualified: '#51CF66',
  Recycled: '#FFD43B',
  Disqualified: '#FF6B6B',
  Proposed: '#339AF0',
  'Identified DM': '#FFD43B',
  Negotiated: '#845EF7',
};

function Dashboard() {
  const [data, setData] = useState<any>(null);

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
      try {
        const res = await fetchData(
          DashboardSummaryUrl,
          'GET',
          null as any,
          headers
        );
        setData(res);
      } catch (e) {
        setData(null);
      }
    };
    fetchDashboard();
  }, []);

  if (!data) return null;

  // Преобразуем данные для диаграмм
  const leadsPie = Object.entries(data.leads_by_status || {}).map(
    ([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    })
  );
  const oppsPie = Object.entries(data.opportunities_by_stage || {}).map(
    ([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    })
  );

  return (
    <Box sx={{ p: 2, mt: 8, pr: 4 }}>
      <Grid container spacing={4} mb={2}>
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
                width: '100%',
                minWidth: 100,
                height: 85, // уменьшили высоту
                background: '#fff',
                boxShadow:
                  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px rgba(0,0,0,0.14),0px 1px 3px rgba(0,0,0,0.12)',
                borderRadius: 2,
                p: 1, // уменьшили внутренний отступ
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
                  fontSize: 12, // уменьшили размер шрифта
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
                  fontSize: 16, // уменьшили размер шрифта
                  color: '#339AF0',
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Диаграммы */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={600} mb={2}>
              Leads ({data.leads_count})
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={leadsPie}
                  dataKey="value"
                  nameKey="name"
                  cx="35%" // сдвигает график влево, чтобы справа было место для легенды
                  cy="50%"
                  outerRadius={70}
                  label={({ percent }) =>
                    `${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {leadsPie.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={600} mb={2}>
              Opportunities ({data.opportunities_count})
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={oppsPie}
                  dataKey="value"
                  nameKey="name"
                  cx="35%"
                  cy="50%"
                  outerRadius={70}
                  label={({ percent }) =>
                    `${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {oppsPie.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Таблицы */}
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
                          background: statusColors[lead.status] || '#eee',
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
                          background: statusColors[opp.stage_display] || '#eee',
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
