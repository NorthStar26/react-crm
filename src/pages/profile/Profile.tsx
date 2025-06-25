import React, { useEffect, useState } from 'react';
import {
  Card,
  Avatar,
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormControl,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { FaChevronDown } from 'react-icons/fa';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { fetchData } from '../../components/FetchData';
import { UserUrl } from '../../services/ApiUrls';
import { COUNTRIES } from '../../data/countries';

type Response = {
  user_details: {
    email: string;
    profile_pic: string;
  };
  address: {
    address_line: string;
    number: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    country_display: string;
  };
  phone: string;
  alternate_phone: string;
};

export default function Profile() {
  const [user, setUser] = useState<Response | null>(null);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return console.error('User ID not found');

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || ''
    };

    fetchData(`${UserUrl}/${userId}/`, 'GET', null as any, headers).then((res) => {
      console.log('API response:', res);
      if (!res.error) setUser(res.data.user_obj);
    });
  }, []);

  const inputStyles = {
    width: '313px',
    '& .MuiOutlinedInput-root': {
      height: '40px',
      borderRadius: '4px'
    }
  };

  const labelStyles = {
    width: 110,
    fontWeight: 500,
    color: '#1A3353',
    textAlign: 'right' as const,
    mr: 2,
    whiteSpace: 'nowrap'
  };

  const saveButtonSx = {
    width: 100,
    height: 40,
    borderRadius: '4px',
    background: 'var(--color-azure-46, #1976D2)',
    boxShadow:
      '0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033'
  };

  const cancelButtonSx = {
    width: 100,
    height: 40,
    borderRadius: '4px',
    background: 'var(--color-azure-31, #2B5075)',
    boxShadow:
      '0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033'
  };

  return (
    <Box sx={{ mt: 8, px: 2 }}>
      <Box
        sx={{
          height: 50,
          backgroundColor: 'var(--color-azure-21, #1A3353)',
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center',
          px: 2
        }}
      >
        <Typography variant="subtitle1" sx={{ color: '#FFFFFF !important' }}>
          My Profile
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="contained" sx={cancelButtonSx}>
            Cancel
          </Button>
          <Button variant="contained" sx={saveButtonSx}>
            Save
          </Button>
        </Box>
      </Box>

      <Card
        sx={{
          borderRadius: '0 0 4px 4px',
          backgroundColor: 'var(--color-white-solid, #FFFFFF)',
          p: 4
        }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<FaChevronDown />}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Roboto',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '27px',
                letterSpacing: '0.17px',
                verticalAlign: 'middle'
              }}
            >
              User Information
            </Typography>
          </AccordionSummary>
          <Divider sx={{ height: '2px', backgroundColor: 'rgba(0,0,0,0.12)', mx: 4, mb: 2 }} />
          <AccordionDetails>
            <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
              <Grid item xs={12} container justifyContent="center">
                <Avatar
                  src={user?.user_details.profile_pic}
                  sx={{ width: 140, height: 140, border: '2px solid', borderColor: 'grey.400' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>First Name</Typography>
                    <TextField value={''} InputProps={{ readOnly: true }} placeholder="—" sx={inputStyles} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                    <Typography sx={labelStyles}>Email</Typography>
                    <Typography>{user?.user_details.email || 'sample@example.com'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Phone Number</Typography>
                    <TextField
                      value={user?.phone || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Last Name</Typography>
                    <TextField value={''} InputProps={{ readOnly: true }} placeholder="—" sx={inputStyles} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                    <Typography sx={labelStyles}>Password</Typography>
                    <Button
                      variant="contained"
                      sx={{
                        width: 180,
                        height: 40,
                        borderRadius: '4px',
                        background: '#1976D2',
                        boxShadow:
                          '0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033'
                      }}
                    >
                      Change Password
                    </Button>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Alternate Phone</Typography>
                    <TextField
                      value={user?.alternate_phone || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded sx={{ mt: 3, backgroundColor: 'var(--color-white-solid, #FFFFFF)' }}>
          <AccordionSummary expandIcon={<FaChevronDown />}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Roboto',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '27px',
                letterSpacing: '0.17px',
                verticalAlign: 'middle'
              }}
            >
              Address
            </Typography>
          </AccordionSummary>
          <Divider sx={{ height: '2px', backgroundColor: 'rgba(0,0,0,0.12)', mx: 4, mb: 2 }} />
          <AccordionDetails>
            <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Address Lane</Typography>
                    <TextField
                      value={user?.address.address_line || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>City</Typography>
                    <TextField
                      value={user?.address.city || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Postcode</Typography>
                    <TextField
                      value={user?.address.postcode || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Number</Typography>
                    <TextField
                      value={user?.address.number || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>State</Typography>
                    <TextField
                      value={user?.address.state || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Country</Typography>
                    <FormControl sx={{ ...inputStyles, position: 'relative' }}>
                      <Select
                        value={user?.address.country || ''}
                        open={countrySelectOpen}
                        onClick={() => setCountrySelectOpen(!countrySelectOpen)}
                        displayEmpty
                        inputProps={{ readOnly: true }}
                        IconComponent={() => (
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              height: '100%',
                              width: '36px',
                              backgroundColor: '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderTopRightRadius: '4px',
                              borderBottomRightRadius: '4px',
                              pointerEvents: 'none'
                            }}
                          >
                            <FiChevronDown style={{ fontSize: '20px', color: '#333' }} />
                          </Box>
                        )}
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            height: '40px',
                            paddingRight: '36px'
                          }
                        }}
                      >
                        {COUNTRIES.map(([code, name]) => (
                          <MenuItem key={code} value={code}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{user?.address.country_display || ''}</FormHelperText>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Card>
    </Box>
  );
}
