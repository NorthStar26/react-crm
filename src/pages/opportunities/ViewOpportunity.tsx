import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  Tooltip,
} from '@mui/material';

import { CustomAppBar } from '../../components/CustomAppBar';

const getStageColor = (stage: string): string => {
  const stageColors: { [key: string]: string } = {
    'NEGOTIATION': '#7a4ec6ff',
    'QUALIFICATION': '#51CF66',
    'IDENTIFY_DECISION_MAKERS': '#FF9800',
    'CLOSED WON': '#4CAF50',
    'CLOSED LOST': '#F44336',
    'PROPOSAL': '#339Af0',
    'CLOSE': '#3F51B5',
  };

  return stageColors[stage?.trim().toUpperCase()] || '#757575';
};

const InfoBox = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <Box sx={{ mb: 2 }}>
    {label && (
      <Typography
        variant="subtitle2"
        sx={{ 
          fontWeight: 'bold', 
          color: '#0a3b72ff',
          mb: 0.5 
        }}
      >
        {label}
      </Typography>
    )}
    <Box
      sx={{
        p: 1.2,
        pl: icon ? 1 : 1.2,
        pr: 1.2,
        borderRadius: '8px',
        backgroundColor: '#f1f1f1',
        color: '#000',
        fontSize: '0.95rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {icon && <Box>{icon}</Box>}
      <span>{value || '---'}</span>
    </Box>
  </Box>
);

export default function ViewOpportunity() {
  const location = useLocation();
  const navigate = useNavigate();
  const opportunity = location.state?.opportunityData;

  if (!opportunity) {
    return (
      <Box sx={{ mt: '120px', p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No opportunity data found</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/app/opportunities')}
          sx={{ mt: 2 }}
        >
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
    feedback,
    comments = [],
    meeting_date,
    attachment_links = [],
  } = opportunity;

  // Define stage conditions
  const showMeetingDate = [
    'NEGOTIATION',
    'CLOSE',
    'CLOSED WON',
    'CLOSED LOST'
  ].includes(stage?.trim().toUpperCase());

  const showFeedback = [
    'NEGOTIATION',
    'CLOSE',
    'CLOSED WON',
    'CLOSED LOST'
  ].includes(stage?.trim().toUpperCase());

  const showAttachments = [
    'PROPOSAL',
    'NEGOTIATION',
    'CLOSE',
    'CLOSED WON',
    'CLOSED LOST'
  ].includes(stage?.trim().toUpperCase());

  const handleDownload = (url: string, fileName: string, fileExtension: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `attachment.${fileExtension || 'file'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <CustomAppBar
        module="Opportunities"
        crntPage={name}
        variant="view"
        backBtn="Back To List"
        backbtnHandle={() => navigate('/app/opportunities')}
      />

      <Box
        sx={{
          pt: '130px',
          px: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Header Card */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000' }}>
                  {name}
                </Typography>
                <Chip
                  label={stage?.trim() || 'Stage'}
                  sx={{
                    backgroundColor: getStageColor(stage),
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    px: 2,
                  }}
                />
              </Box>

              {/* Company and Contact in first half of row */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 2,
                width: '50%',
                minWidth: 0,
              }}>
                <Box sx={{ flex: 1 }}>
                  <Button
                    fullWidth
                    startIcon={<BusinessIcon />}
                    variant="outlined"
                    disabled
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      color: '#000',
                      borderColor: '#e0e0e0',
                      backgroundColor: '#f5f5f5',
                      '&:hover': {
                        backgroundColor: '#eeeeee',
                      },
                    }}
                  >
                    <Typography noWrap>
                      {company?.name || 'Company Name'}
                    </Typography>
                  </Button>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Button
                    fullWidth
                    startIcon={<PersonIcon />}
                    variant="outlined"
                    disabled
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      color: '#000',
                      borderColor: '#e0e0e0',
                      backgroundColor: '#f5f5f5',
                      '&:hover': {
                        backgroundColor: '#eeeeee',
                      },
                    }}
                  >
                    <Typography noWrap>
                      {contact ? `${contact.first_name} ${contact.last_name}` : 'Contact'}
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Card>

            {/* Financial Details */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  fontFamily: 'inherit',
                  fontWeight: '700 !important',
                  color: '#0a3b72ff',
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1,
                  mb: 2,
                  fontSize: '1.25rem',
                  lineHeight: 1.6
                }}
              >
                Financial Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoBox label="Amount" value={amount ?? '---'} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoBox label="Probability" value={probability ? `${probability}%` : '---'} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoBox label="Expected Result" value={expected_revenue ?? '---'} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoBox
                    label="Assigned To"
                    value={assigned_to?.[0]?.user_details?.first_name || '---'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoBox label="Days To Close" value={days_to_close ?? '---'} />
                </Grid>
                {showMeetingDate && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoBox
                      label="Meeting Date"
                      value={
                        meeting_date
                          ? new Date(meeting_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '---'
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Card>

            {/* Opportunity Information */}
            <Card sx={{ p: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  fontFamily: 'inherit',
                  fontWeight: '700 !important',
                  color: '#0a3b72ff',
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1,
                  mb: 2,
                  fontSize: '1.25rem'
                }}
              >
                Opportunity Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoBox label="Lead Source" value={lead_source || '---'} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoBox
                    label="Created"
                    value={
                      created_at
                        ? new Date(created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '---'
                    }
                  />
                </Grid>
                {showAttachments && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: '#0a3b72ff',
                        mb: 0.5,
                        fontSize: '0.875rem' 
                      }}
                    >
                      {stage?.trim().toUpperCase() === 'PROPOSAL' ? 'Proposed Documents' : 'Attachments'}
                    </Typography>
                    {attachment_links.length === 0 ? (
                      <Box sx={{
                        p: 1.2,
                        borderRadius: '8px',
                        backgroundColor: '#f1f1f1',
                        color: '#000',
                      }}>
                        ---
                      </Box>
                    ) : (
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        {attachment_links.map((file: any) => {
                          const fileName = file.file_name;
                          const fileExtension = file.url.split('.').pop()?.toLowerCase();

                          let IconComponent = DescriptionIcon;
                          let bgColor = '#9E9E9E';

                          if (fileExtension === 'pdf') {
                            IconComponent = PictureAsPdfIcon;
                            bgColor = '#F44336';
                          } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                            IconComponent = DescriptionIcon;
                            bgColor = '#1976d2';
                          } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
                            IconComponent = TableChartIcon;
                            bgColor = '#388e3c';
                          }

                          return (
                            <Box 
                              key={file.attachment_id}
                              onClick={() => handleDownload(file.url, fileName, fileExtension || '')}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 0.8
                                }
                              }}
                            >
                              <Stack direction="column" alignItems="center" spacing={0.5}>
                                <Box
                                  sx={{
                                    backgroundColor: bgColor,
                                    color: 'white',
                                    p: 1.5,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '48px',
                                    height: '48px',
                                  }}
                                >
                                  <IconComponent sx={{ fontSize: '52px' }} />
                                </Box>
                                <Tooltip title={fileName}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      maxWidth: '80px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center',
                                      color: '#333',
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                </Tooltip>
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Grid>
                )}

                <Grid item xs={12}>
                  <InfoBox label="Description" value={description || '—'} />
                </Grid>
                {showFeedback && (
                  <Grid item xs={12}>
                    <InfoBox label="Feedback" value={feedback || '—'} />
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography 
                variant="h6"
                sx={{
                  fontFamily: 'inherit',
                  fontWeight: '700 !important',
                  color: '#0a3b72ff',
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1,
                  mb: 2,
                  fontSize: '1.25rem'
                }}
              >
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