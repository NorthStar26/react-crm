import React, { useEffect, useState } from 'react';
import { Card, Box, Avatar, Typography, Button } from '@mui/material';
import { CustomAppBar } from '../../components/CustomAppBar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CompaniesUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { Spinner } from '../../components/Spinner';
import { useUser } from '../../context/UserContext';
import EditIcon from '@mui/icons-material/Edit';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { EditButton } from '../../components/Button';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
type CompanyDetailsType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  billing_street: string;
  billing_address_number: string;
  billing_city: string;
  billing_state: string;
  billing_postcode: string;
  billing_country: string;
  logo_url?: string;
  created_by?: {
    id: string;
    email: string;
    profile_pic?: string;
  };
};

const jobTitleColors = [
  '#339AF0', // Синий
  '#51CF66', // Зеленый
  '#FFA94D', // Оранжевый
  '#845EF7', // Фиолетовый
  '#FF6B6B', // Красный
  '#22B8CF', // Голубой
  '#FAB005', // Желтый
  '#5C7CFA', // Индиго
  '#BE4BDB', // Пурпурный
  '#20C997', // Бирюзовый
];

// Lead status colors - matching dashboard colors
const leadStatusColors: Record<string, string> = {
  new: '#339AF0',
  qualified: '#51CF66',
  recycled: '#FFA94D',
  disqualified: '#FA5252',
};

export default function CompanyDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useUser();
  const [companyDetails, setCompanyDetails] =
    useState<CompanyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для данных диаграммы контактов
  const [jobTitlesData, setJobTitlesData] = useState<any[]>([]);
  const [jobTitlesLoading, setJobTitlesLoading] = useState<boolean>(true);
  const [contactsCount, setContactsCount] = useState<number>(0);
  const [jobTitlesLimit, setJobTitlesLimit] = useState<number>(5);

  // Состояние для данных диаграммы лидов
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState<boolean>(true);
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<string>('all');
  const [leadStatusChoices, setLeadStatusChoices] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const id = companyId || state?.companyId?.id;
    if (id) {
      getCompanyDetail(id);
      fetchJobTitlesAndLeadsData(id, selectedLeadStatus, jobTitlesLimit);
    } else {
      setError('Company ID is missing');
      setLoading(false);
    }
  }, [companyId, state?.companyId?.id, selectedLeadStatus, jobTitlesLimit]);

  // Функция для получения данных о распределении должностей и лидов
  const fetchJobTitlesAndLeadsData = async (
    id: string,
    status: string = 'all',
    limit: number = 5
  ) => {
    setJobTitlesLoading(true);
    setLeadsLoading(true);

    const token = localStorage.getItem('Token');
    const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
      org: localStorage.getItem('org') || '',
    };

    try {
      // Добавляем параметры статуса и лимита
      const statusParam = status !== 'all' ? `&status=${status}` : '';
      const limitParam = `&limit=${limit}`;
      const url = `${CompaniesUrl}job-titles/?company=${id}${statusParam}${limitParam}`;
      console.log('Requesting data from URL:', url);

      const response = await fetchData(url, 'GET', null as any, headers);
      console.log('API Response:', response);

      if (!response.error) {
        // Set contacts data
        setJobTitlesData(response.job_titles || []);
        setContactsCount(response.total_contacts || 0);

        // Set leads data
        setLeadsData(response.leads_by_status || []);
        setLeadsCount(response.total_leads || 0);

        // Сохраняем варианты статусов
        if (response.lead_status_choices) {
          setLeadStatusChoices(response.lead_status_choices);
        }
      } else {
        console.error('Failed to load data:', response);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setJobTitlesLoading(false);
      setLeadsLoading(false);
    }
  };

  const getCompanyDetail = (id: string) => {
    const token = localStorage.getItem('Token');
    const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
      org: localStorage.getItem('org') || '',
    };

    fetchData(`${CompaniesUrl}${id}/`, 'GET', null as any, headers)
      .then((res) => {
        console.log('Company details response:', res);
        if (!res.error) {
          const data = res.data || res;
          setCompanyDetails(data);
        } else {
          setError('Failed to load company details');
        }
      })
      .catch((err) => {
        console.error('Error fetching company details:', err);
        setError('An error occurred while loading company details');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const status = event.target.value;
    setSelectedLeadStatus(status);

    const id = companyId || state?.companyId?.id;
    if (id) {
      fetchJobTitlesAndLeadsData(id, status);
    }
  };

  const handleJobTitlesLimitChange = (event: SelectChangeEvent<number>) => {
    const limit = event.target.value as number;
    setJobTitlesLimit(limit);

    const id = companyId || state?.companyId?.id;
    if (id) {
      fetchJobTitlesAndLeadsData(id, selectedLeadStatus, limit);
    }
  };

  // Форматируем данные для диаграммы контактов
  const formatJobTitlesForPieChart = () => {
    return jobTitlesData.map((item, index) => ({
      name: item.title,
      value: item.count,
      percentage: item.percentage,
      color: jobTitleColors[index % jobTitleColors.length],
    }));
  };

  // Форматируем данные для диаграммы лидов
  const formatLeadsForPieChart = () => {
    return leadsData.map((item) => ({
      name: item.status,
      value: item.count,
      percentage: item.percentage,
      color: leadStatusColors[item.status.toLowerCase()] || '#cccccc',
    }));
  };

  // Функция для капитализации строки
  function capitalize(str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const editHandle = () => {
    const id = companyId || state?.companyId?.id;
    navigate(`/app/companies/edit-company/${id}`);
  };

  const backToCompanies = () => {
    navigate('/app/companies');
  };

  if (loading) {
    return (
      <Box sx={{ mt: '120px', display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: '120px', p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button variant="contained" onClick={backToCompanies} sx={{ mt: 2 }}>
          Back to Companies
        </Button>
      </Box>
    );
  }

  if (!companyDetails) {
    return (
      <Box sx={{ mt: '120px', p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No company details found</Typography>
        <Button variant="contained" onClick={backToCompanies} sx={{ mt: 2 }}>
          Back to Companies
        </Button>
      </Box>
    );
  }

  const module = 'Companies';
  const crntPage = companyDetails?.name || 'Company Details';

  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar module={module} crntPage={crntPage} variant="view" />

      <Box sx={{ mt: '120px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ padding: '10px' }}>
          {/* Company Header Card */}
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              p: 4,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Company Logo */}
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    backgroundColor: '#f0f0f0',
                    border: '3px solid #e0e0e0',
                    fontSize: 48,
                    color: '#666',
                  }}
                >
                  {companyDetails.logo_url ? (
                    <img
                      src={companyDetails.logo_url}
                      alt={companyDetails.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    companyDetails.name?.charAt(0).toUpperCase() || 'C'
                  )}
                </Avatar>

                {/* Company Info */}
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}
                  >
                    {companyDetails.name}
                  </Typography>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                  >
                    {companyDetails.website && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <LanguageIcon sx={{ fontSize: 20, color: '#666' }} />
                        <Typography variant="body1" sx={{ color: '#333' }}>
                          {companyDetails.website}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 4 }}>
                      {companyDetails.email && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <EmailIcon sx={{ fontSize: 20, color: '#666' }} />
                          <Typography variant="body1" sx={{ color: '#333' }}>
                            {companyDetails.email}
                          </Typography>
                        </Box>
                      )}

                      {companyDetails.phone && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <PhoneIcon sx={{ fontSize: 20, color: '#666' }} />
                          <Typography variant="body1" sx={{ color: '#333' }}>
                            {companyDetails.phone}
                          </Typography>
                        </Box>
                      )}

                      {companyDetails.industry && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <BusinessIcon sx={{ fontSize: 20, color: '#666' }} />
                          <Typography variant="body1" sx={{ color: '#333' }}>
                            {companyDetails.industry}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Edit Button */}
              {(user?.role === 'ADMIN' ||
                user?.role === 'MANAGER' ||
                (user?.role === 'USER' &&
                  user?.user_details?.id ===
                    companyDetails?.created_by?.id)) && (
                <EditButton onClick={editHandle}>Edit Company</EditButton>
              )}
            </Box>
          </Card>

          {/* Address Card */}
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              p: 4,
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#2c3e50',
                borderBottom: '2px solid #e0e0e0',
                pb: 2,
              }}
            >
              Address
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 4,
                rowGap: 5,
              }}
            >
              {/* First Row */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
                >
                  House
                </Typography>
                <Typography variant="body1" sx={{ color: '#333' }}>
                  {companyDetails.billing_address_number || '---'}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
                >
                  Street
                </Typography>
                <Typography variant="body1" sx={{ color: '#333' }}>
                  {companyDetails.billing_street || '---'}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
                >
                  City
                </Typography>
                <Typography variant="body1" sx={{ color: '#333' }}>
                  {companyDetails.billing_city || '---'}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
                >
                  State
                </Typography>
                <Typography variant="body1" sx={{ color: '#333' }}>
                  {companyDetails.billing_state || '---'}
                </Typography>
              </Box>

              {/* Second Row */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
                >
                  Country
                </Typography>
                <Typography variant="body1" sx={{ color: '#333' }}>
                  {companyDetails.billing_country || '---'}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
                >
                  Zip
                </Typography>
                <Typography variant="body1" sx={{ color: '#333' }}>
                  {companyDetails.billing_postcode || '---'}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Charts Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {/* Contacts by Job Title Chart */}
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                p: 4,
                mb: 3,
                flex: 1,
              }}
            >
              <Typography
                fontWeight={600}
                mb={2}
                sx={{
                  fontSize: '1.25rem',
                  color: '#2c3e50',
                }}
              >
                Contacts ({contactsCount})
              </Typography>

              <Box
                sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
              >
                <Typography sx={{ fontWeight: 500, mr: 1 }}>by</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="job-title-limit-select-label">
                    Job Titles
                  </InputLabel>
                  <Select
                    labelId="job-title-limit-select-label"
                    id="job-title-limit-select"
                    value={jobTitlesLimit}
                    label="Job Titles"
                    onChange={handleJobTitlesLimitChange}
                    startAdornment={
                      <WorkIcon sx={{ fontSize: 18, color: '#666', mr: 1 }} />
                    }
                  >
                    <MenuItem value={5}>Top 5</MenuItem>
                    <MenuItem value={10}>Top 10</MenuItem>
                    <MenuItem value={15}>Top 15</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {jobTitlesLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: 220,
                    alignItems: 'center',
                  }}
                >
                  <Spinner />
                </Box>
              ) : jobTitlesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={formatJobTitlesForPieChart()}
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
                        const safeMidAngle = midAngle ?? 0;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x =
                          cx + radius * Math.cos(-safeMidAngle * RADIAN);
                        const y =
                          cy + radius * Math.sin(-safeMidAngle * RADIAN);

                        const safePercent = percent ?? 0;
                        return safePercent > 0.05 ? (
                          <text
                            x={x}
                            y={y}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={14}
                            fontWeight={600}
                          >
                            {`${(safePercent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}
                    >
                      {formatJobTitlesForPieChart().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No contacts found for this company
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Leads by Status Chart */}
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                p: 4,
                mb: 3,
                flex: 1,
              }}
            >
              <Typography
                fontWeight={600}
                mb={2}
                sx={{
                  fontSize: '1.25rem',
                  color: '#2c3e50',
                }}
              >
                Leads ({leadsCount})
              </Typography>

              <Box
                sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
              >
                <Typography sx={{ fontWeight: 500, mr: 1 }}>by</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="lead-status-select-label">Status</InputLabel>
                  <Select
                    labelId="lead-status-select-label"
                    id="lead-status-select"
                    value={selectedLeadStatus}
                    label="Status"
                    onChange={handleStatusChange}
                    startAdornment={
                      <AssignmentIcon
                        sx={{ fontSize: 18, color: '#666', mr: 1 }}
                      />
                    }
                  >
                    <MenuItem value="all">Status</MenuItem>
                    {leadStatusChoices.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {leadsLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: 220,
                    alignItems: 'center',
                  }}
                >
                  <Spinner />
                </Box>
              ) : leadsData.length > 0 && leadsCount > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={formatLeadsForPieChart()}
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
                        const safeMidAngle = midAngle ?? 0;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x =
                          cx + radius * Math.cos(-safeMidAngle * RADIAN);
                        const y =
                          cy + radius * Math.sin(-safeMidAngle * RADIAN);

                        const safePercent = percent ?? 0;
                        return safePercent > 0.05 ? (
                          <text
                            x={x}
                            y={y}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={14}
                            fontWeight={600}
                          >
                            {`${(safePercent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}
                    >
                      {formatLeadsForPieChart().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="square"
                      wrapperStyle={{ width: 220, marginLeft: -40 }}
                      formatter={(value: string) => capitalize(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No leads found for this company
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        </div>
      </Box>
    </Box>
  );
}
