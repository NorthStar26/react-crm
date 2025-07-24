import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  Button,
  Avatar,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

export default function ViewOpportunity() {
  const location = useLocation();
  const navigate = useNavigate();
  const opportunity = location.state?.opportunityData;

  if (!opportunity) {
    return (
      <Box sx={{ mt: '120px', p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No opportunity data found</Typography>
        <Button variant="contained" onClick={() => navigate('/app/opportunities')} sx={{ mt: 2 }}>
          Back to Opportunities
        </Button>
      </Box>
    );
  }

  const {
    name,
    stage,
    company,
    contact,
    amount,
    probability,
    expected_revenue,
    assigned_to,
    days_to_close,
    lead_source,
    created_at,
    description,
    comments = [],
  } = opportunity;

  return (
    <Box sx={{ mt: '60px' }}>
      {/* Custom Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1A3353',
          color: 'white',
          padding: '10px 24px',
          marginTop: '64px',
          height: '50px',
        }}
      >
        {/* Breadcrumbs */}
        <Box>
          <Typography
            component="span"
            sx={{ cursor: 'pointer', color: 'lightgray', fontWeight: 600, mr: 1 }}
            onClick={() => navigate('/app/dashboard')}
          >
            Dashboard
          </Typography>
          <Typography
            component="span"
            sx={{ color: 'lightgray', fontWeight: 600, mr: 1 }}
          >
            /
          </Typography>
          <Typography
            component="span"
            sx={{ cursor: 'pointer', color: 'lightgray', fontWeight: 600, mr: 1 }}
            onClick={() => navigate('/app/opportunities')}
          >
            Opportunities
          </Typography>
          <Typography component="span" sx={{ color: 'white', fontWeight: 600 }}>
            / {name}
          </Typography>
        </Box>

        {/* Back Button */}
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate('/app/opportunities')}
          startIcon={<ArrowBackIcon />}
          sx={{
            backgroundColor: 'white',
            color: '#1A3353',
            fontWeight: 'bold',
            textTransform: 'capitalize',
            '&:hover': { backgroundColor: '#f0f0f0' },
          }}
        >
          Back To List
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ mt: '24px', px: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Header Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Typography variant="h5" fontWeight={600}>
                  {name}
                </Typography>
                <Chip label={stage || 'Stage'} color="success" />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mt: 2 }}>
                <Button startIcon={<BusinessIcon />} variant="outlined" disabled>
                  {company?.name || 'Company Name'}
                </Button>
                <Button startIcon={<PersonIcon />} variant="outlined" disabled>
                  {contact ? `${contact.first_name} ${contact.last_name}` : 'Contact'}
                </Button>
              </Box>
            </Card>

            {/* Financial Details */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Financial Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2">Amount</Typography>
                  <Typography>{amount ?? '---'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2">Probability</Typography>
                  <Typography>{probability ? `${probability}%` : '---'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2">Expected Result</Typography>
                  <Typography>{expected_revenue ?? '---'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2">Assigned To</Typography>
                  <Typography>{assigned_to?.[0]?.user_details?.first_name || '---'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2">Days To Close</Typography>
                  <Typography>{days_to_close ?? '---'}</Typography>
                </Grid>
              </Grid>
            </Card>

            {/* Opportunity Information */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Opportunity Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Lead Source</Typography>
                  <Typography>{lead_source || '---'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Created</Typography>
                  <Typography>
                    {created_at
                      ? new Date(created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '---'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography>{description || '---'}</Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Activities & Notes
              </Typography>

              <TextField
                multiline
                minRows={3}
                maxRows={6}
                placeholder="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button fullWidth variant="contained" sx={{ mb: 3 }}>
                + Add Note
              </Button>

              {comments.length === 0 ? (
                <Typography>No comments available.</Typography>
              ) : (
                comments.map((comment: any, index: number) => (
                  <Box key={index} mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.commented_by?.first_name?.[0] || 'U'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="bold">
                          {comment.commented_by?.email || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.commented_on).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography sx={{ ml: 5 }}>{comment.comment}</Typography>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                ))
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
