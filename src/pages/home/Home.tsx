import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from '../../components/Sidebar';
import Organization from '../organization/Organization';
import { useUser } from '../../context/UserContext';
import { Spinner } from '../../components/Spinner';

export const Home = (props: any) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, hasToken } = useUser();
  const [open, setOpen] = useState(true);
  const [org, setOrg] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('Token');
    const orgId = localStorage.getItem('org');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (!orgId) {
      setOrg(false);
    } else {
      setOrg(true);
    }
  }, [navigate, isAuthenticated]);

  // Show loading only if we have both token and org and are loading profile
  if (isLoading && hasToken() && localStorage.getItem('org')) {
    return <Spinner />;
  }

  // If no token at all, redirect to login
  if (!hasToken()) {
    navigate('/login');
    return null;
  }
  return (
    <Box sx={{}}>
      {org ? (
        <Sidebar
          open={open}
        />
      ) : (
        <Organization />
      )}
    </Box>
  );
};
