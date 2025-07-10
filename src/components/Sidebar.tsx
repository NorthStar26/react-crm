import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FaAddressBook,
  FaBars,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaCog,
  FaDiceD6,
  FaHandshake,
  FaIndustry,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUserFriends,
  FaUsers,
  FaUser,
} from 'react-icons/fa';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { fetchData } from './FetchData';
import { ProfileUrl } from '../services/ApiUrls';
import { Header1 } from './FetchData';
import OrganizationModal from '../pages/organization/OrganizationModal';
import Company from '../pages/company/Company';
import AddCompany from '../pages/company/AddCompany';
import CompanyDetails from '../pages/company/CompanyDetails';
import EditCompany from '../pages/company/EditCompany';
import Leads from '../pages/leads/Leads';
import AddContacts from '../pages/contacts/AddContacts';
import { EditLead } from '../pages/leads/EditLead';
import LeadDetails from '../pages/leads/LeadDetails';
import Contacts from '../pages/contacts/Contacts';
import EditContact from '../pages/contacts/EditContacts';
import ContactDetails from '../pages/contacts/ContactDetails';
import Users from '../pages/users/Users';
import Opportunities from '../pages/opportunities/Opportunities';
import Cases from '../pages/cases/Cases';
import { AddLeads } from '../pages/leads/AddLeads';
import Accounts from '../pages/accounts/Accounts';
import { AddAccount } from '../pages/accounts/AddAccount';
import { EditAccount } from '../pages/accounts/EditAccount';
import { AccountDetails } from '../pages/accounts/AccountDetails';
import { AddUsers } from '../pages/users/AddUsers';
import { EditUser } from '../pages/users/EditUser';
import UserDetails from '../pages/users/UserDetails';
import { AddOpportunity } from '../pages/opportunities/AddOpportunity';
import { EditOpportunity } from '../pages/opportunities/EditOpportunity';
import { OpportunityDetails } from '../pages/opportunities/OpportunityDetails';
import { AddCase } from '../pages/cases/AddCase';
import { EditCase } from '../pages/cases/EditCase';
import { CaseDetails } from '../pages/cases/CaseDetails';
import ButtonDemo from '../pages/demo/ButtonDemo';
import logo from '../assets/images/auth/img_logo.png';
import { StyledListItemButton, StyledListItemText } from '../styles/CssStyled';
import MyContext from '../context/Context';
import { logout } from '../services/AuthService';
import ProfileComponent from '../pages/profile/Profile';
import { useUser } from '../context/UserContext';

export default function Sidebar(props: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: contextLogout } = useUser();
  const [screen, setScreen] = useState('contacts');
  const [drawerWidth, setDrawerWidth] = useState(200);
  const [headerWidth, setHeaderWidth] = useState(drawerWidth);
  const [userDetail, setUserDetail] = useState('');
  const [organizationModal, setOrganizationModal] = useState(false);
  const organizationModalClose = () => {
    setOrganizationModal(false);
  };

  useEffect(() => {
    toggleScreen();
  }, [navigate]);

  // useEffect(() => {
  // navigate('/leads')
  // if (localStorage.getItem('Token') && localStorage.getItem('org')) {
  //     // setScreen('contacts')
  //     navigate('/contacts')
  // }
  // if (!localStorage.getItem('Token')) {
  //     navigate('/login')
  // }
  // if (!localStorage.getItem('org')) {
  //     navigate('/organization')
  // }
  // toggleScreen()
  // }, [])
  const toggleScreen = () => {
    // console.log(location.pathname.split('/'), 'll')
    if (
      location.pathname.split('/')[1] === '' ||
      location.pathname.split('/')[1] === undefined ||
      location.pathname.split('/')[2] === 'leads'
    ) {
      setScreen('leads');
    } else if (location.pathname.split('/')[2] === 'contacts') {
      setScreen('contacts');
    } else if (location.pathname.split('/')[2] === 'opportunities') {
      setScreen('opportunities');
    } else if (location.pathname.split('/')[2] === 'accounts') {
      setScreen('accounts');
    } else if (location.pathname.split('/')[2] === 'companies') {
      setScreen('companies');
    } else if (location.pathname.split('/')[2] === 'users') {
      setScreen('CRM-Admin Dashboard');
    } else if (location.pathname.split('/')[2] === 'cases') {
      setScreen('cases');
    }
  };

  const userProfile = () => {
    fetchData(`${ProfileUrl}/`, 'GET', null as any, Header1)
      .then((res: any) => {
        if (res?.user_obj) {
          setUserDetail(res?.user_obj);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const navList = [
    'leads',
    'contacts',
    'opportunities',
    'accounts',
    'companies',
    'users',
    'cases',
  ];
  const navIcons = (text: any, screen: any): React.ReactNode => {
    switch (text) {
      case 'leads':
        return screen === 'leads' ? <FaUsers fill="#3e79f7" /> : <FaUsers />;
      case 'contacts':
        return screen === 'contacts' ? (
          <FaAddressBook fill="#3e79f7" />
        ) : (
          <FaAddressBook />
        );
      case 'opportunities':
        return screen === 'opportunities' ? (
          <FaHandshake fill="#3e79f7" />
        ) : (
          <FaHandshake />
        );
      case 'accounts':
        return screen === 'accounts' ? (
          <FaBuilding fill="#3e79f7" />
        ) : (
          <FaBuilding />
        );
      case 'companies':
        return screen === 'companies' ? (
          <FaIndustry fill="#3e79f7" />
        ) : (
          <FaIndustry />
        );
      case 'users':
        return screen === 'users' ? (
          <FaUserFriends fill="#3e79f7" />
        ) : (
          <FaUserFriends />
        );
      case 'cases':
        return screen === 'cases' ? (
          <FaBriefcase fill="#3e79f7" />
        ) : (
          <FaBriefcase />
        );
      default:
        return <FaDiceD6 fill="#3e79f7" />;
    }
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    contextLogout();
    navigate('/login');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const context = { drawerWidth: drawerWidth, screen: screen };
  const clickProfileHandeler = () => {
    navigate('/app/profile');
  };
  return (
    <>
      <Box>
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            height: '60px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            boxShadow: '1px',
          }}
        >
          <Box>
            <Toolbar>
              {drawerWidth === 60 ? (
                <img
                  src={logo}
                  width={'40px'}
                  style={{
                    transform: 'rotate(270deg)',
                    marginLeft: '-15px',
                    marginRight: '10px',
                  }}
                />
              ) : (
                <img
                  src={logo}
                  width={'100px'}
                  style={{ marginLeft: '-5px', marginRight: '30px' }}
                />
              )}
              <IconButton
                sx={{ ml: '-10px' }}
                onClick={() => setDrawerWidth(drawerWidth === 60 ? 200 : 60)}
              >
                <FaBars style={{ height: '20px' }} />
              </IconButton>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: 'black',
                  ml: '20px',
                  textTransform: 'capitalize',
                  fontSize: '20px',
                  mt: '5px',
                }}
              >
                {screen}
              </Typography>
            </Toolbar>
          </Box>
          <Box
            style={{
              marginRight: '10px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <IconButton onClick={handleClick} sx={{ mr: 3 }}>
              <Avatar
                src={user?.user_details?.profile_pic}
                sx={{ height: '27px', width: '27px' }}
              >
                {user?.user_details?.first_name?.[0] ||
                  user?.user_details?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Popover
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
            >
              <List disablePadding>
                <ListItem disablePadding>
                  <StyledListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <FaSignOutAlt fill="#3e79f7" />
                    </ListItemIcon>
                    <StyledListItemText
                      primary={'Sign out'}
                      sx={{ ml: '-20px', color: '#3e79f7' }}
                    />
                  </StyledListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <StyledListItemButton
                    onClick={() => setOrganizationModal(!organizationModal)}
                  >
                    <ListItemIcon>
                      <FaIndustry fill="#3e79f7" />
                    </ListItemIcon>
                    <StyledListItemText
                      primary={'Organization'}
                      sx={{ ml: '-20px', color: '#3e79f7' }}
                    />
                  </StyledListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <StyledListItemButton onClick={clickProfileHandeler}>
                    <ListItemIcon>
                      <FaUser fill="#3e79f7" />
                    </ListItemIcon>
                    <StyledListItemText
                      primary={'Profile'}
                      sx={{ ml: '-20px', color: '#3e79f7' }}
                    />
                  </StyledListItemButton>
                </ListItem>
              </List>
            </Popover>
          </Box>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box>
            <List sx={{ pt: '65px' }}>
              {navList.map((text, index) => (
                <ListItem key={text} disablePadding>
                  <StyledListItemButton
                    sx={{ pt: '6px', pb: '6px' }}
                    onClick={() => {
                      navigate(`/app/${text}`);
                      setScreen(text);
                    }}
                    selected={screen === text}
                  >
                    <ListItemIcon sx={{ ml: '5px' }}>
                      {navIcons(text, screen)}
                    </ListItemIcon>
                    <StyledListItemText
                      primary={text}
                      sx={{ ml: -2, textTransform: 'capitalize' }}
                    />
                  </StyledListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <MyContext.Provider value={context}>
          <Box
            sx={{
              width: 'auto',
              ml: drawerWidth === 60 ? '60px' : '200px',
              overflowX: 'hidden',
            }}
          >
            <Routes>
              <Route index element={<Leads />} />
              <Route path="/app/leads" element={<Leads />} />
              <Route path="/app/leads/add-leads" element={<AddLeads />} />
              <Route path="/app/leads/:leadId/edit" element={<EditLead />} />
              <Route path="/app/leads/:leadId" element={<LeadDetails />} />
              {/* Keep old route for backward compatibility */}
              <Route path="/app/leads/lead-details" element={<LeadDetails />} />
              <Route path="/app/companies" element={<Company />} />
              <Route
                path="/app/companies/add-company"
                element={<AddCompany />}
              />
              <Route
                path="/app/companies/edit-company/:companyId"
                element={<EditCompany />}
              />
              <Route
                path="/app/companies/company-details"
                element={<CompanyDetails />}
              />
              <Route path="/app/contacts" element={<Contacts />} />
              <Route
                path="/app/contacts/add-contacts"
                element={<AddContacts />}
              />
              <Route
                path="/app/contacts/contact-details"
                element={<ContactDetails />}
              />
              <Route
                path="/app/contacts/edit-contact"
                element={<EditContact />}
              />
              <Route path="/app/accounts" element={<Accounts />} />
              <Route
                path="/app/accounts/add-account"
                element={<AddAccount />}
              />
              <Route
                path="/app/accounts/account-details"
                element={<AccountDetails />}
              />
              <Route
                path="/app/accounts/edit-account"
                element={<EditAccount />}
              />
              <Route path="/app/users" element={<Users />} />
              <Route path="/app/users/add-users" element={<AddUsers />} />
              <Route path="/app/users/edit-user" element={<EditUser />} />
              <Route path="/app/users/user-details" element={<UserDetails />} />
              <Route path="/app/opportunities" element={<Opportunities />} />
              <Route
                path="/app/opportunities/add-opportunity"
                element={<AddOpportunity />}
              />
              <Route
                path="/app/opportunities/opportunity-details"
                element={<OpportunityDetails />}
              />
              <Route
                path="/app/opportunities/edit-opportunity"
                element={<EditOpportunity />}
              />
              <Route path="/app/cases" element={<Cases />} />
              <Route path="/app/cases/add-case" element={<AddCase />} />
              <Route path="/app/cases/edit-case" element={<EditCase />} />
              <Route path="/app/cases/case-details" element={<CaseDetails />} />
              <Route path="/app/demo/buttons" element={<ButtonDemo />} />
              <Route path="/app/profile" element={<ProfileComponent />} />
            </Routes>
          </Box>
        </MyContext.Provider>
        <OrganizationModal
          open={organizationModal}
          handleClose={organizationModalClose}
        />
      </Box>
    </>
  );
}
