import React, { useState, useEffect } from 'react';
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
import { fetchData } from '../../components/FetchData';
import { OpportunityUrl } from '../../services/ApiUrls';
import { SuccessAlert, AlertType } from '../../components/Button/SuccessAlert';
import { DialogModal } from '../../components/DialogModal';

// Helper function to capitalize the first letter of each word in a string
const capitalizeFirstLetter = (string: string | undefined | null): string => {
  if (!string) return '';

  // For URL links, don't capitalize
  if (string.startsWith('http')) return string;

  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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

  // Comment functionality states
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [commentsToShow, setCommentsToShow] = useState(5);
  const [opportunityComments, setOpportunityComments] = useState(opportunity?.comments || []);
  
  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('success');
  
  // Add Note modal states
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);

  // Update comments when opportunity data changes
  useEffect(() => {
    setOpportunityComments(opportunity?.comments || []);
  }, [opportunity?.comments]);

  // Open add note dialog
  const handleAddNoteClick = () => {
    if (!note.trim()) {
      setNoteError('Note cannot be empty');
      return;
    }

    // Clear any previous errors
    setNoteError('');

    // Open confirmation dialog
    setAddNoteDialogOpen(true);
  };

  // Submit note after confirmation
  const submitNote = () => {
    // Close the dialog first
    setAddNoteDialogOpen(false);

    setNoteSubmitting(true);

    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    const data = JSON.stringify({
      comment: note,
    });

    fetchData(`${OpportunityUrl}/${opportunity?.id}/comment/`, 'POST', data, Header)
      .then((res) => {
        if (!res.error) {
          // Refresh the opportunity comments by fetching updated data
          fetchOpportunityDetails();
          setNote('');
          setNoteError('');

          // Show success alert
          setAlertMessage('Note added successfully');
          setAlertType('success');
          setAlertOpen(true);
        } else {
          // Show error alert
          setAlertMessage(res.errors || 'Failed to add note');
          setAlertType('error');
          setAlertOpen(true);
        }
      })
      .catch((err) => {
        console.error('Error submitting note:', err);
        setNoteError('Failed to submit note. Please try again.');

        // Show error alert
        setAlertMessage('Failed to add note. Please try again.');
        setAlertType('error');
        setAlertOpen(true);
      })
      .finally(() => {
        setNoteSubmitting(false);
      });
  };

  // Fetch updated opportunity details
  const fetchOpportunityDetails = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    fetchData(`${OpportunityUrl}/${opportunity?.id}/`, 'GET', null as any, Header)
      .then((res) => {
        if (!res.error) {
          setOpportunityComments(res?.comments || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching opportunity details:', err);
      });
  };

  const handleShowMoreComments = () => {
    setCommentsToShow((prev) => prev + 5);
  };

  // Handler for closing the alert
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

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
      {/* Success/Error Alert */}
      <SuccessAlert
        open={alertOpen}
        message={alertMessage}
        onClose={handleAlertClose}
        type={alertType}
        autoHideDuration={4000}
        showCloseButton={true}
      />

      {/* Add Note Dialog */}
      <DialogModal
        isDelete={addNoteDialogOpen}
        onClose={() => setAddNoteDialogOpen(false)}
        onConfirm={submitNote}
        modalDialog={`Are you sure you want to add a note to ${name || ''}'s opportunity?`}
        confirmText="Add"
        cancelText="Cancel"
      />

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
            <Box
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                bgcolor: 'white',
                height: 'fit-content'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Activities and Notes
              </Typography>

              {/* Note input field */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Write a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  error={!!noteError}
                  helperText={noteError}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddNoteClick}
                    disabled={noteSubmitting || !note.trim()}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {noteSubmitting ? 'Submitting...' : 'Add note'}
                  </Button>
                </Box>
              </Box>

              {/* Activity items */}
              <Box sx={{ mt: 3 }}>
                {/* Display comments from API response */}
                {opportunityComments && opportunityComments.length > 0 ? (
                  <>
                    {[...opportunityComments]
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.commented_on).getTime() -
                          new Date(a.commented_on).getTime()
                      )
                      .slice(0, commentsToShow)
                      .map((comment: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{ mr: 1, width: 32, height: 32 }}
                            src={comment.commented_by_user?.profile_pic}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {capitalizeFirstLetter(
                                comment.commented_by_user?.first_name
                              ) || ''}{' '}
                              {capitalizeFirstLetter(
                                comment.commented_by_user?.last_name
                              ) || ''}
                            </Typography>
                            <Typography variant="body2">
                              {comment.comment}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 'auto' }}
                          >
                            {new Date(
                              comment.commented_on
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}

                    {/* Show More button for pagination */}
                    {opportunityComments.length > commentsToShow && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleShowMoreComments}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          Show more
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      justifyContent: 'center',
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No notes yet. Add a note to start.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}