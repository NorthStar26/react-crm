// import React, { useEffect, useState } from 'react';
// import { Card, Box, Avatar, Typography, Button } from '@mui/material';
// import { CustomAppBar } from '../../components/CustomAppBar';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { CompaniesUrl } from '../../services/ApiUrls';
// import { fetchData } from '../../components/FetchData';
// import { Spinner } from '../../components/Spinner';
// import { useUser } from '../../context/UserContext';
// import EditIcon from '@mui/icons-material/Edit';
// import LanguageIcon from '@mui/icons-material/Language';
// import EmailIcon from '@mui/icons-material/Email';
// import PhoneIcon from '@mui/icons-material/Phone';
// import BusinessIcon from '@mui/icons-material/Business';
// import chartsImage from '../../assets/images/chart.png';
// import { EditButton } from '../../components/Button';

// type CompanyDetailsType = {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   website: string;
//   industry: string;
//   billing_street: string;
//   billing_address_number: string;
//   billing_city: string;
//   billing_state: string;
//   billing_postcode: string;
//   billing_country: string;
//   logo_url?: string;
//   created_by?: {
//     id: string;
//     email: string;
//     profile_pic?: string;
//   };
// };

// export default function CompanyDetails() {
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const { companyId } = useParams<{ companyId: string }>();
//   const { user } = useUser();
//   const [companyDetails, setCompanyDetails] =
//     useState<CompanyDetailsType | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const id = companyId || state?.companyId?.id;
//     if (id) {
//       getCompanyDetail(id);
//     } else {
//       setError('Company ID is missing');
//       setLoading(false);
//     }
//   }, [companyId, state?.companyId?.id]);

//   const getCompanyDetail = (id: string) => {
//     const token = localStorage.getItem('Token');
//     const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';

//     const headers = {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
//       org: localStorage.getItem('org') || '',
//     };

//     fetchData(`${CompaniesUrl}${id}/`, 'GET', null as any, headers)
//       .then((res) => {
//         console.log('Company details response:', res);
//         if (!res.error) {
//           const data = res.data || res;
//           setCompanyDetails(data);
//         } else {
//           setError('Failed to load company details');
//         }
//       })
//       .catch((err) => {
//         console.error('Error fetching company details:', err);
//         setError('An error occurred while loading company details');
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   const editHandle = () => {
//     const id = companyId || state?.companyId?.id;
//     navigate(`/app/companies/edit-company/${id}`);
//   };

//   const backToCompanies = () => {
//     navigate('/app/companies');
//   };

//   if (loading) {
//     return (
//       <Box sx={{ mt: '120px', display: 'flex', justifyContent: 'center' }}>
//         <Spinner />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ mt: '120px', p: 3, textAlign: 'center' }}>
//         <Typography color="error" variant="h6">
//           {error}
//         </Typography>
//         <Button variant="contained" onClick={backToCompanies} sx={{ mt: 2 }}>
//           Back to Companies
//         </Button>
//       </Box>
//     );
//   }

//   if (!companyDetails) {
//     return (
//       <Box sx={{ mt: '120px', p: 3, textAlign: 'center' }}>
//         <Typography variant="h6">No company details found</Typography>
//         <Button variant="contained" onClick={backToCompanies} sx={{ mt: 2 }}>
//           Back to Companies
//         </Button>
//       </Box>
//     );
//   }

//   const module = 'Companies';
//   const crntPage = companyDetails?.name || 'Company Details';

//   return (
//     <Box sx={{ mt: '60px' }}>
//       <CustomAppBar
//         module={module}
//         crntPage={crntPage}
//         variant="view" // Явно указываем, что это страница просмотра
//       />

//       <Box sx={{ mt: '120px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
//         <div style={{ padding: '10px' }}>
//           {/* Company Header Card */}
//           <Card
//             sx={{
//               borderRadius: 2,
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//               p: 4,
//               mb: 3,
//             }}
//           >
//             <Box
//               sx={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'flex-start',
//               }}
//             >
//               <Box sx={{ display: 'flex', gap: 3 }}>
//                 {/* Company Logo */}
//                 <Avatar
//                   sx={{
//                     width: 120,
//                     height: 120,
//                     backgroundColor: '#f0f0f0',
//                     border: '3px solid #e0e0e0',
//                     fontSize: 48,
//                     color: '#666',
//                   }}
//                 >
//                   {companyDetails.logo_url ? (
//                     <img
//                       src={companyDetails.logo_url}
//                       alt={companyDetails.name}
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'cover',
//                       }}
//                     />
//                   ) : (
//                     companyDetails.name?.charAt(0).toUpperCase() || 'C'
//                   )}
//                 </Avatar>

//                 {/* Company Info */}
//                 <Box>
//                   <Typography
//                     variant="h4"
//                     sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}
//                   >
//                     {companyDetails.name}
//                   </Typography>

//                   <Box
//                     sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
//                   >
//                     {companyDetails.website && (
//                       <Box
//                         sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
//                       >
//                         <LanguageIcon sx={{ fontSize: 20, color: '#666' }} />
//                         <Typography variant="body1" sx={{ color: '#333' }}>
//                           {companyDetails.website}
//                         </Typography>
//                       </Box>
//                     )}

//                     <Box sx={{ display: 'flex', gap: 4 }}>
//                       {companyDetails.email && (
//                         <Box
//                           sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
//                         >
//                           <EmailIcon sx={{ fontSize: 20, color: '#666' }} />
//                           <Typography variant="body1" sx={{ color: '#333' }}>
//                             {companyDetails.email}
//                           </Typography>
//                         </Box>
//                       )}

//                       {companyDetails.phone && (
//                         <Box
//                           sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
//                         >
//                           <PhoneIcon sx={{ fontSize: 20, color: '#666' }} />
//                           <Typography variant="body1" sx={{ color: '#333' }}>
//                             {companyDetails.phone}
//                           </Typography>
//                         </Box>
//                       )}

//                       {companyDetails.industry && (
//                         <Box
//                           sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
//                         >
//                           <BusinessIcon sx={{ fontSize: 20, color: '#666' }} />
//                           <Typography variant="body1" sx={{ color: '#333' }}>
//                             {companyDetails.industry}
//                           </Typography>
//                         </Box>
//                       )}
//                     </Box>
//                   </Box>
//                 </Box>
//               </Box>

//               {/* Edit Button - Show for ADMIN/MANAGER always, or for USER only if they created the company */}
//               {(user?.role === 'ADMIN' ||
//                 user?.role === 'MANAGER' ||
//                 (user?.role === 'USER' &&
//                   user?.user_details?.id ===
//                     companyDetails?.created_by?.id)) && (
//                 <EditButton onClick={editHandle}>Edit Company</EditButton>
//               )}
//             </Box>
//           </Card>

//           {/* Address Card */}
//           <Card
//             sx={{
//               borderRadius: 2,
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//               p: 4,
//               mb: 3,
//             }}
//           >
//             <Typography
//               variant="h5"
//               sx={{
//                 fontWeight: 600,
//                 mb: 3,
//                 color: '#2c3e50',
//                 borderBottom: '2px solid #e0e0e0',
//                 pb: 2,
//               }}
//             >
//               Address
//             </Typography>

//             <Box
//               sx={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(4, 1fr)',
//                 gap: 4,
//                 rowGap: 5,
//               }}
//             >
//               {/* First Row */}
//               <Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
//                 >
//                   House
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: '#333' }}>
//                   {companyDetails.billing_address_number || '---'}
//                 </Typography>
//               </Box>

//               <Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
//                 >
//                   Street
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: '#333' }}>
//                   {companyDetails.billing_street || '---'}
//                 </Typography>
//               </Box>

//               <Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
//                 >
//                   City
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: '#333' }}>
//                   {companyDetails.billing_city || '---'}
//                 </Typography>
//               </Box>

//               <Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
//                 >
//                   State
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: '#333' }}>
//                   {companyDetails.billing_state || '---'}
//                 </Typography>
//               </Box>

//               {/* Second Row */}
//               <Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
//                 >
//                   Country
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: '#333' }}>
//                   {companyDetails.billing_country || '---'}
//                 </Typography>
//               </Box>

//               <Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ color: '#666', mb: 0.5, fontWeight: 500 }}
//                 >
//                   Zip
//                 </Typography>
//                 <Typography variant="body1" sx={{ color: '#333' }}>
//                   {companyDetails.billing_postcode || '---'}
//                 </Typography>
//               </Box>
//             </Box>
//           </Card>

//           {/* Charts Image */}
//           <Box sx={{ mt: 3, textAlign: 'center', mb: 3 }}>
//             <img
//               src={chartsImage}
//               alt="Contacts and Leads Charts"
//               style={{
//                 width: '100%',
//                 maxWidth: '1200px',
//                 height: 'auto',
//                 display: 'inline-block',
//                 borderRadius: '8px',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//               }}
//             />
//           </Box>
//         </div>
//       </Box>
//     </Box>
//   );
// }
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
import { EditButton } from '../../components/Button';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

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

export default function CompanyDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useUser();
  const [companyDetails, setCompanyDetails] =
    useState<CompanyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для данных диаграммы - убрали jobTitlesLimit, т.к. бэкенд всегда возвращает топ-5
  const [jobTitlesData, setJobTitlesData] = useState<any[]>([]);
  const [jobTitlesLoading, setJobTitlesLoading] = useState<boolean>(true);
  const [contactsCount, setContactsCount] = useState<number>(0);

  useEffect(() => {
    const id = companyId || state?.companyId?.id;
    if (id) {
      getCompanyDetail(id);
      fetchJobTitlesData(id);
    } else {
      setError('Company ID is missing');
      setLoading(false);
    }
  }, [companyId, state?.companyId?.id]);

  // Функция для получения данных о распределении должностей
  const fetchJobTitlesData = async (id: string) => {
    setJobTitlesLoading(true);
    const token = localStorage.getItem('Token');
    const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
      org: localStorage.getItem('org') || '',
    };

    try {
      // Используем правильный URL для API без параметра limit, т.к. бэкенд возвращает только топ-5
      const url = `${CompaniesUrl}job-titles/?company=${id}`;

      const response = await fetchData(url, 'GET', null as any, headers);

      if (!response.error) {
        setJobTitlesData(response.job_titles || []);
        setContactsCount(response.total_contacts || 0);
      } else {
        console.error('Failed to load job titles data:', response);
      }
    } catch (err) {
      console.error('Error fetching job titles data:', err);
    } finally {
      setJobTitlesLoading(false);
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

  // Форматируем данные для диаграммы
  const formatJobTitlesForPieChart = () => {
    return jobTitlesData.map((item, index) => ({
      name: item.title,
      value: item.count,
      percentage: item.percentage,
      color: jobTitleColors[index % jobTitleColors.length],
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

          {/* Contacts by Job Title Chart */}
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              p: 4,
              mb: 3,
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

            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 500, mr: 1 }}>by</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WorkIcon sx={{ fontSize: 18, color: '#666' }} />
                <Typography sx={{ fontWeight: 500 }}>
                  Top 5 Job Titles
                </Typography>
              </Box>
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
                      const x = cx + radius * Math.cos(-safeMidAngle * RADIAN);
                      const y = cy + radius * Math.sin(-safeMidAngle * RADIAN);

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
        </div>
      </Box>
    </Box>
  );
}
