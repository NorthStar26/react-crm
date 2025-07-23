import React, { useEffect, useState } from 'react';
import { Card, Box, Avatar, Typography, Button } from '@mui/material';
import { CustomAppBar } from '../../components/CustomAppBar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CompaniesUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { Spinner } from '../../components/Spinner';
import EditIcon from '@mui/icons-material/Edit';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import chartsImage from '../../assets/images/chart.png';
import { EditButton } from '../../components/Button';

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
};

export default function CompanyDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { companyId } = useParams<{ companyId: string }>();
  const [companyDetails, setCompanyDetails] =
    useState<CompanyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = companyId || state?.companyId?.id;
    if (id) {
      getCompanyDetail(id);
    } else {
      setError('Company ID is missing');
      setLoading(false);
    }
  }, [companyId, state?.companyId?.id]);

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
      <CustomAppBar
        module={module}
        crntPage={crntPage}
        variant="view" // Явно указываем, что это страница просмотра
      />

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
              <EditButton onClick={editHandle}>Edit Company</EditButton>
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

          {/* Charts Image */}
          <Box sx={{ mt: 3, textAlign: 'center', mb: 3 }}>
            <img
              src={chartsImage}
              alt="Contacts and Leads Charts"
              style={{
                width: '100%',
                maxWidth: '1200px',
                height: 'auto',
                display: 'inline-block',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
          </Box>
        </div>
      </Box>
    </Box>
  );
}
