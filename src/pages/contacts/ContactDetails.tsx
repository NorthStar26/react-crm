import React, { useEffect, useState } from 'react';
import {
  Card,
  Link,
  Avatar,
  Box,
  Typography,
  Grid,
  Stack,
  Container,
} from '@mui/material';
import {
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaEdit,
  FaPhoneSlash,
  FaTimes,
} from 'react-icons/fa';
import { CustomAppBar } from '../../components/CustomAppBar';
import { EditButton } from '../../components/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { ContactUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { useUser } from '../../context/UserContext';
import {
  DoNotCallChip,
  ContactDetailCard,
  LanguageChip,
} from '../../styles/CssStyled';
import vectorImage from '../../assets/images/Vector.png';
type ContactResponse = {
  id: string;
  salutation: string;
  salutation_display: string;
  first_name: string;
  last_name: string;
  title: string;
  primary_email: string;
  mobile_number: string;
  language: string;
  language_display: string;
  do_not_call: boolean;
  description: string;
  company: any; // Объект компании
  company_name: string; // Имя компании
  country: string;
  country_name: string;
  department: string;
  created_by: { id: string; };
};

export const formatDate = (dateString: any) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function ContactDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useUser();
  const [contactDetails, setContactDetails] = useState<ContactResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.contactId?.id) {
      getContactDetail(state.contactId.id);
    } else {
      setError('Contact ID not provided');
      setLoading(false);
    }
  }, [state]);

  const getContactDetail = (id: any) => {
    setLoading(true);
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    fetchData(`${ContactUrl}/${id}/`, 'GET', null as any, Header)
      .then((res) => {
        console.log('Contact API response:', res);

        if (!res.error && res.contact) {
          setContactDetails(res.contact);
        } else {
          setError(res.errors || 'Failed to fetch contact details');
        }
      })
      .catch((err) => {
        console.error('Error fetching contact:', err);
        setError('Failed to fetch contact details');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const backbtnHandle = () => {
    navigate('/app/contacts');
  };

  const editHandle = () => {
    if (!contactDetails) return;

    navigate('/app/contacts/edit-contact', {
      state: {
        value: {
          salutation: contactDetails.salutation,
          first_name: contactDetails.first_name,
          last_name: contactDetails.last_name,
          primary_email: contactDetails.primary_email,
          mobile_number: contactDetails.mobile_number,
          title: contactDetails.title,
          language: contactDetails.language,
          do_not_call: contactDetails.do_not_call,
          department: contactDetails.department,
          country: contactDetails.country,
          description: contactDetails.description,
          company: contactDetails.company?.id,
        },
        id: state?.contactId?.id,
        countries: state?.countries,
      },
    });
  };

  const module = 'Contacts';
  const crntPage = 'Contact Detail';
  const backBtn = 'Back To Contacts';

  const fullName = contactDetails
    ? `${contactDetails.first_name || ''} ${
        contactDetails.last_name || ''
      }`.trim()
    : 'Loading...';

  if (loading) {
    return (
      <Box sx={{ mt: '120px', display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading contact details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: '120px', display: 'flex', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: '60px', backgroundColor: '#FAFAFB', minHeight: '100vh' }}>
      {/* Header */}
      <CustomAppBar module={module} crntPage={crntPage} variant="view" />

      <Container maxWidth="lg" sx={{ mt: '120px', py: 3 }}>
        {/* Main Contact Card */}
        <ContactDetailCard
          sx={{
            mb: 3,
            boxShadow:
              '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Box sx={{ p: 4 }}>
            {/* Header Section */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 4,
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: 'Roboto',
                    fontWeight: 700,
                    color: '#101828',
                    mb: 1,
                    fontSize: '30px',
                    lineHeight: '36px',
                  }}
                >
                  {fullName}
                </Typography>
              </Box>

              {/* Edit Button */}
              {((user?.role === 'ADMIN' || user?.role === 'MANAGER') || 
                (user?.role === 'USER' && contactDetails?.created_by?.id === user?.user_details?.id)) && (
                <EditButton onClick={editHandle}>
                  <FaEdit style={{ marginRight: 8 }} />
                  Edit Contact
                </EditButton>
              )}
            </Box>
            {/* Contact Info Section */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {/* Email -  */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: '#F9FAFB',
                    borderRadius: '4px',
                    height: '40px',
                    pl: 2,
                  }}
                >
                  <FaEnvelope style={{ fontSize: '20px', color: '#4A5565' }} />
                  <Typography
                    component="a"
                    href={`mailto:${contactDetails?.primary_email}`}
                    sx={{
                      fontFamily: 'Roboto',
                      fontSize: '15px',
                      fontWeight: 500,
                      lineHeight: '18px',
                      color: '#1A3353',
                      textDecoration: 'none',
                    }}
                  >
                    {contactDetails?.primary_email || 'No email'}
                  </Typography>
                </Box>
              </Grid>

              {/* Phone - справа */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    height: '40px',
                    borderRadius: '4px',
                    bgcolor: '#F9FAFB',
                    pl: 2,
                  }}
                >
                  {contactDetails?.do_not_call ? (
                    <FaPhoneSlash
                      style={{ fontSize: '20px', color: '#d32f2f' }}
                    />
                  ) : (
                    <FaPhone style={{ fontSize: '20px', color: '#4A5565' }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: 'Roboto',
                      fontSize: '15px',
                      fontWeight: 500,
                      lineHeight: '18px',
                      color: contactDetails?.do_not_call
                        ? '#d32f2f'
                        : '#1A3353',
                    }}
                  >
                    {contactDetails?.mobile_number || 'No phone'}
                  </Typography>

                  {/*   Do Not Call - справа от номера телефона */}
                  {contactDetails?.do_not_call && (
                    <Box
                      component="img"
                      src={vectorImage}
                      alt="Do not call"
                      sx={{
                        width: 24,
                        height: 24,
                        ml: 1,
                        bgcolor: '#F9FAFB',
                      }}
                    />
                  )}
                  <FaTimes style={{ fontSize: '14px', color: 'white' }} />
                </Box>
              </Grid>
            </Grid>
            {/* Company, Department, Job Title Grid */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {/* Company Name */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Roboto',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280',
                    }}
                  >
                    Company
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      height: '40px',
                      borderRadius: '4px',
                      bgcolor: '#F9FAFB',
                      pl: 2,
                    }}
                  >
                    <FaBuilding
                      style={{ fontSize: '16px', color: '#4A5565' }}
                    />
                    <Typography
                      sx={{
                        fontFamily: 'Roboto',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#1A3353',
                      }}
                    >
                      {contactDetails?.company_name || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Department */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Roboto',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280',
                    }}
                  >
                    Department
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      height: '40px',
                      borderRadius: '4px',
                      bgcolor: '#F9FAFB',
                      pl: 2,
                    }}
                  >
                    <FaBuilding
                      style={{ fontSize: '16px', color: '#4A5565' }}
                    />
                    <Typography
                      sx={{
                        fontFamily: 'Roboto',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#1A3353',
                      }}
                    >
                      {contactDetails?.department || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Job Title */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Roboto',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280',
                    }}
                  >
                    Job Title
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      height: '40px',
                      borderRadius: '4px',
                      bgcolor: '#F9FAFB',
                      pl: 2,
                    }}
                  >
                    <FaBriefcase
                      style={{ fontSize: '16px', color: '#4A5565' }}
                    />
                    <Typography
                      sx={{
                        fontFamily: 'Roboto',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#1A3353',
                      }}
                    >
                      {contactDetails?.title || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            {/* Country */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Roboto',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280',
                    }}
                  >
                    Country
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      height: '40px',
                      borderRadius: '4px',
                      bgcolor: '#F9FAFB',
                      pl: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Roboto',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#1A3353',
                      }}
                    >
                      {contactDetails?.country_name || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>{' '}
            {/* Languages Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontFamily: 'Roboto',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#6B7280',
                  mb: 1,
                }}
              >
                Languages
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {contactDetails?.language ? (
                  <LanguageChip
                    sx={{
                      fontFamily: 'Roboto',
                      fontWeight: 500,
                      fontSize: '15px',
                      lineHeight: '18px',
                      bgcolor: '#F9FAFB',
                      color: '#1A3353',
                    }}
                  >
                    {contactDetails.language_display || contactDetails.language}
                  </LanguageChip>
                ) : (
                  <LanguageChip
                    sx={{
                      fontFamily: 'Roboto',
                      fontWeight: 500,
                      fontSize: '15px',
                      lineHeight: '18px',
                      bgcolor: '#F9FAFB',
                      color: '#1A3353',
                    }}
                  >
                    Not specified
                  </LanguageChip>
                )}
              </Stack>
            </Box>
            {/* Description Section */}
            <Box>
              <Typography
                sx={{
                  fontFamily: 'Roboto',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#6B7280',
                  mb: 1,
                }}
              >
                Description
              </Typography>
              <Box
                sx={{
                  p: 2,
                  minHeight: '70px',
                  borderRadius: '4px',
                  border: '1px solid #E0E0E0',
                  bgcolor: '#F9FAFB',
                }}
              >
                {contactDetails?.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: contactDetails.description,
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      color: '#6B7280',
                      fontStyle: 'italic',
                    }}
                  >
                    No description provided
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </ContactDetailCard>
      </Container>
    </Box>
  );
}
