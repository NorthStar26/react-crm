import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { fetchData } from '../../components/FetchData';
import { OpportunityUrl } from '../../services/ApiUrls';
import { CustomAppBar } from '../../components/CustomAppBar';
import {
  PipelineSaveButton,
  PipelineCancelButton,
} from '../../components/PipelineButtons';

import {
  SectionContainer,
  SectionTitle,
  FieldLabel,
  FieldContainer,
  StyledTextField,
  PageTitle,
  ActivityItem,
  ActivityAuthor,
  ActivityDate,
  ActivityContent,
  AlignedFieldRow,
  iconStyles,
} from '../../styles/OpportunityStyles';
import '../../styles/style.css';
import {
  CompletedStepIcon,
  CurrentStepIcon,
  PendingStepIcon,
  pipelineStepLabelStyles,
  pipelineConnectorStyles,
} from '../../components/PipelineIcons';

// Используем стили PipelineIcons для кастомного коннектора
const CustomConnector = styled(StepConnector)(() => ({
  [`& .MuiStepConnector-line`]: pipelineConnectorStyles.line,
  [`&.Mui-active .MuiStepConnector-line`]: pipelineConnectorStyles.active,
  [`&.Mui-completed .MuiStepConnector-line`]: pipelineConnectorStyles.completed,
}));

// Styles for fields used in renderStageContent
const fieldStyles = {
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    marginTop: '16px',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  fieldTitle: {
    minWidth: '150px',
    textAlign: 'right',
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '15px',
    lineHeight: '18px',
    color: '#1A3353',
  },
  fieldInput: {
    flex: 1,
  },
};

function OpportunityPipeline() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [pipelineMetadata, setPipelineMetadata] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const module = 'Opportunities';
  const crntPage = opportunity?.name || 'Opportunity';

  useEffect(() => {
    if (id) {
      fetchOpportunityData();
    } else {
      setErrorMessage('Opportunity ID is missing');
      setLoading(false);
    }
  }, [id]);

  const fetchOpportunityData = async () => {
    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token || '',
      org: org || '',
    };

    try {
      await fetchData(
        `${OpportunityUrl}/${id}/pipeline/`,
        'GET',
        null as any,
        headers
      ).then((res) => {
        console.log('Pipeline data response:', res);
        if (!res.error) {
          setOpportunity(res.opportunity);
          setPipelineMetadata(res.pipeline_metadata);

          // Initialize form data based on the opportunity data
          setFormData({
            meeting_date: res.opportunity.meeting_date || null,
            proposal_doc: null,
            feedback: res.opportunity.feedback || '',
            expected_close_date: res.opportunity.expected_close_date || null,
            result: res.opportunity.result || '', // Добавляем поле result
          });

          // Set activities if available
          if (res.activities) {
            setActivities(res.activities);
          }
        } else {
          setErrorMessage('Failed to load opportunity data');
        }
      });
    } catch (error) {
      console.error('Error fetching opportunity data:', error);
      setErrorMessage('An error occurred while loading opportunity data');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    try {
      let response;
      let shouldMoveToNextStage = false;
      let nextStage = pipelineMetadata.current_stage;

      // Определяем, нужно ли переходить на следующий этап
      if (
        pipelineMetadata.current_stage === 'QUALIFICATION' &&
        formData.meeting_date
      ) {
        shouldMoveToNextStage = true;
        nextStage = 'IDENTIFY_DECISION_MAKERS';
      }

      // Check if we have a file to upload
      if (formData.proposal_doc instanceof File) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('stage', pipelineMetadata.current_stage);

        // Для IDENTIFY_DECISION_MАКERS отправляем только файл
        if (pipelineMetadata.current_stage === 'IDENTIFY_DECISION_MAKERS') {
          formDataToSend.append('proposal_doc', formData.proposal_doc);
        } else {
          // Для других этапов отправляем соответствующие поля
          Object.keys(formData).forEach((key) => {
            if (
              formData[key] !== null &&
              formData[key] !== undefined &&
              formData[key] !== ''
            ) {
              // check if the field is allowed for the current stage
              const allowedFields = pipelineMetadata.editable_fields || [];
              if (allowedFields.includes(key) || key === 'proposal_doc') {
                formDataToSend.append(key, formData[key]);
              }
            }
          });
        }

        // Make direct fetch call for FormData
        response = await fetch(`${OpportunityUrl}/${id}/pipeline/`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            Authorization: token || '',
            org: org || '',
            // Don't set Content-Type for FormData
          },
          body: formDataToSend,
        });
      } else {
        // Use JSON for regular data
        const dataToSend: any = {
          stage: pipelineMetadata.current_stage, // Всегда отправляем текущий stage
        };

        // Добавляем поля в зависимости от текущего этапа
        if (
          pipelineMetadata.current_stage === 'QUALIFICATION' &&
          formData.meeting_date
        ) {
          dataToSend.meeting_date = formData.meeting_date;
        } else if (
          pipelineMetadata.current_stage === 'PROPOSAL' &&
          formData.feedback
        ) {
          dataToSend.feedback = formData.feedback;
        } else if (
          pipelineMetadata.current_stage === 'NEGOTIATION' &&
          formData.result
        ) {
          dataToSend.result = formData.result;
        }

        const headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token || '',
          org: org || '',
        };

        response = await fetchData(
          `${OpportunityUrl}/${id}/pipeline/`,
          'PATCH',
          JSON.stringify(dataToSend),
          headers
        );
      }

      // Handle response
      let res;
      if (response instanceof Response) {
        res = await response.json();
      } else {
        res = response;
      }

      if (!res.error) {
        // Если нужно перейти на следующий этап, делаем второй запрос
        if (shouldMoveToNextStage) {
          // Второй запрос для смены stage
          const stageChangeData = {
            stage: nextStage,
          };

          const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: token || '',
            org: org || '',
          };

          const stageChangeResponse = await fetchData(
            `${OpportunityUrl}/${id}/pipeline/`,
            'PATCH',
            JSON.stringify(stageChangeData),
            headers
          );

          if (!stageChangeResponse.error) {
            setSuccessMessage(
              'Meeting date saved! You have moved to the Identify Decision Makers stage. You can now upload the proposal document.'
            );
          } else {
            setErrorMessage(
              'Meeting date saved, but failed to move to next stage'
            );
          }
        } else {
          setSuccessMessage(res.message || 'Changes saved successfully');
        }

        // Refresh data after successful save
        setTimeout(() => {
          fetchOpportunityData();
          setSuccessMessage(''); // clear success message after data refresh
        }, 2000);
      } else {
        setErrorMessage(res.errors || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setErrorMessage('An error occurred while saving changes');
    }

    setSaving(false);
  };

  const handleCancel = () => {
    navigate('/app/opportunities');
  };

  const getCurrentStepIndex = () => {
    if (!pipelineMetadata) return 0;
    const stages = pipelineMetadata.available_stages || [];
    const currentStageIndex = stages.findIndex(
      (stage: any) => stage.value === pipelineMetadata.current_stage
    );
    return currentStageIndex >= 0 ? currentStageIndex : 0;
  };

  const renderStageContent = () => {
    if (!pipelineMetadata) return null;
    const editableFields = pipelineMetadata.editable_fields || [];

    switch (pipelineMetadata.current_stage) {
      case 'QUALIFICATION':
        return (
          <>
            {editableFields.includes('meeting_date') && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <Typography
                  sx={{
                    minWidth: '91px',
                    textAlign: 'right',
                    pr: 2,
                    fontFamily: 'Roboto',
                    fontWeight: 500,
                    fontSize: '15px',
                    lineHeight: '18px',
                    color: '#1A3353',
                  }}
                >
                  Meeting Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      formData.meeting_date
                        ? dayjs(formData.meeting_date)
                        : null
                    }
                    onChange={(newValue) =>
                      handleFieldChange(
                        'meeting_date',
                        newValue?.format('YYYY-MM-DD')
                      )
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          width: '311px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#F9FAFB',
                          },
                        },
                        error: !!errors.meeting_date,
                        helperText: errors.meeting_date,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            )}
          </>
        );

      case 'IDENTIFY_DECISION_MAKERS':
        return (
          <div style={fieldStyles.fieldContainer}>
            {editableFields.includes('attachment_links') && (
              <div style={fieldStyles.fieldRow}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Proposal Document
                </div>
                <div style={fieldStyles.fieldInput}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      value={
                        formData.proposal_doc instanceof File
                          ? formData.proposal_doc.name
                          : opportunity?.attachments?.length > 0
                          ? `${opportunity.attachments.length} file(s) uploaded`
                          : 'No file selected'
                      }
                      InputProps={{
                        readOnly: true,
                      }}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#F9FAFB',
                        },
                      }}
                    />
                    <IconButton
                      component="label"
                      color="primary"
                      sx={{
                        border: '1px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <AttachFileIcon />
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFieldChange('proposal_doc', file);
                          }
                        }}
                      />
                    </IconButton>
                  </Box>
                </div>
              </div>
            )}
          </div>
        );

      case 'PROPOSAL':
        return (
          <div style={fieldStyles.fieldContainer}>
            {editableFields.includes('feedback') && (
              <div style={fieldStyles.fieldRow}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Feedback
                </div>
                <div style={fieldStyles.fieldInput}>
                  <TextField
                    multiline
                    rows={4}
                    value={formData.feedback}
                    onChange={(e) =>
                      handleFieldChange('feedback', e.target.value)
                    }
                    fullWidth
                    placeholder="Enter feedback from the client..."
                    error={!!errors.feedback}
                    helperText={errors.feedback}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F9FAFB',
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'NEGOTIATION':
        return (
          <div style={fieldStyles.fieldContainer}>
            {editableFields.includes('result') && (
              <div style={fieldStyles.fieldRow}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Result
                </div>
                <div style={fieldStyles.fieldInput}>
                  <TextField
                    multiline
                    rows={4}
                    value={formData.result || ''}
                    onChange={(e) =>
                      handleFieldChange('result', e.target.value)
                    }
                    fullWidth
                    placeholder="Enter negotiation result..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F9FAFB',
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', p: 5, mt: '120px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage && !opportunity) {
    return (
      <Box sx={{ p: 3, mt: '120px' }}>
        <Alert severity="error">{errorMessage}</Alert>
        <Button variant="contained" onClick={handleCancel} sx={{ mt: 2 }}>
          Back to Opportunities
        </Button>
      </Box>
    );
  }

  if (!opportunity || !pipelineMetadata) {
    return (
      <Box sx={{ p: 3, mt: '120px' }}>
        <Alert severity="error">Failed to load opportunity data</Alert>
        <Button variant="contained" onClick={handleCancel} sx={{ mt: 2 }}>
          Back to Opportunities
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: '60px' }}>
      {/* AppBar */}
      <CustomAppBar
        module={module}
        crntPage={crntPage}
        variant="pipeline"
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
        backBtn="Back To List"
        backbtnHandle={() => navigate('/app/opportunities')}
      />

      <Box
        sx={{
          position: 'absolute',
          left: '200px',
          right: '0px',
          top: '120px',
          overflowY: 'scroll',
          height: 'calc(100vh - 120px)',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <Box sx={{ px: '38px', pt: 2 }}>
            <Alert severity="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          </Box>
        )}
        {errorMessage && (
          <Box sx={{ px: '38px', pt: 2 }}>
            <Alert severity="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          </Box>
        )}

        {/* Stepper */}
        <Box sx={{ px: '38px', pt: 2 }}>
          <Stepper
            activeStep={getCurrentStepIndex()}
            connector={<CustomConnector />}
            sx={{ mb: 4 }}
          >
            {(pipelineMetadata.available_stages || []).map(
              (stage: any, index: number) => (
                <Step
                  key={stage.value}
                  completed={index < getCurrentStepIndex()}
                >
                  <StepLabel
                    StepIconComponent={() => {
                      if (index < getCurrentStepIndex()) {
                        return <CompletedStepIcon />;
                      } else if (index === getCurrentStepIndex()) {
                        return <CurrentStepIcon />;
                      } else {
                        return <PendingStepIcon />;
                      }
                    }}
                  >
                    <Typography
                      sx={
                        index === getCurrentStepIndex()
                          ? pipelineStepLabelStyles.active
                          : pipelineStepLabelStyles.inactive
                      }
                    >
                      {stage.label}
                    </Typography>
                  </StepLabel>
                </Step>
              )
            )}
          </Stepper>
        </Box>

        {/* Main Content Grid */}
        <Box sx={{ display: 'flex', gap: 3, px: '38px', pb: 4 }}>
          {/* Left Panel */}
          <Box sx={{ flex: 1, maxWidth: '724px' }}>
            {/* Opportunity Name Section */}
            <SectionContainer>
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  mb: 0,
                  paddingBottom: 0,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    marginBottom: 0,
                    paddingBottom: 0,
                  }}
                >
                  <PageTitle>{opportunity.name}</PageTitle>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    ml: 3,
                  }}
                >
                  <PipelineSaveButton onClick={handleSave} saving={saving} />
                  <PipelineCancelButton onClick={handleCancel} />
                </Box>
              </Box>

              {/* Company Name и Contact */}
              <Box
                sx={{
                  mt: 0,
                  pt: 0,
                  marginTop: '-45px',
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FieldContainer>
                      <BusinessIcon sx={iconStyles.company} />
                      <Typography
                        sx={{
                          fontFamily: 'Roboto',
                          fontSize: '15px',
                          fontWeight: 400,
                          color: '#1A3353',
                          height: '36px',
                        }}
                      >
                        {opportunity.account?.name || 'Company Name'}
                      </Typography>
                    </FieldContainer>
                  </Grid>
                  <Grid item xs={6}>
                    <FieldContainer>
                      <PersonIcon sx={iconStyles.contact} />
                      <Typography
                        sx={{
                          fontFamily: 'Roboto',
                          fontSize: '15px',
                          fontWeight: 400,
                          color: '#1A3353',
                        }}
                      >
                        {opportunity.contacts_info?.length > 0
                          ? opportunity.contacts_info
                              .map((c: any) => c.name)
                              .join(', ')
                          : 'Contact'}
                      </Typography>
                    </FieldContainer>
                  </Grid>
                </Grid>

                {/* Stage-specific content */}
                <Box sx={{ mt: 3 }}>{renderStageContent()}</Box>
              </Box>
            </SectionContainer>

            {/* Financial Details Section */}
            <SectionContainer>
              <SectionTitle>Financial Details</SectionTitle>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <FieldLabel>Amount</FieldLabel>
                  <StyledTextField
                    value={opportunity.amount || 0}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FieldLabel>Probability</FieldLabel>
                  <StyledTextField
                    value={opportunity.probability || 0}
                    InputProps={{
                      readOnly: true,
                      endAdornment: '%',
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FieldLabel>Expected Revenue</FieldLabel>
                  <StyledTextField
                    value={opportunity.expected_revenue || 0}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FieldLabel>Assigned To</FieldLabel>
                  <StyledTextField
                    value={
                      opportunity.assigned_to_info?.length > 0
                        ? opportunity.assigned_to_info
                            .map((a: any) => a.user?.email)
                            .join(', ')
                        : ''
                    }
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FieldLabel>Expected Close Date</FieldLabel>
                  <StyledTextField
                    value={
                      opportunity.expected_close_date
                        ? new Date(
                            opportunity.expected_close_date
                          ).toLocaleDateString()
                        : ''
                    }
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </SectionContainer>

            {/* Opportunity Information Section */}
            <SectionContainer>
              <SectionTitle>Opportunity Information</SectionTitle>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <FieldLabel>Lead Source</FieldLabel>
                  <StyledTextField
                    value={opportunity.lead_source || ''}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FieldLabel>Created</FieldLabel>
                  <StyledTextField
                    value={
                      opportunity.created_at
                        ? new Date(opportunity.created_at).toLocaleDateString()
                        : ''
                    }
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FieldLabel>Description</FieldLabel>
                  <StyledTextField
                    value={opportunity.description || ''}
                    InputProps={{ readOnly: true }}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </SectionContainer>
          </Box>

          {/* Right Panel - Activities */}
          <Box sx={{ width: 450 }}>
            <SectionContainer>
              <SectionTitle>Activities & Notes</SectionTitle>
              <Divider sx={{ mb: 3 }} />

              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Add a note..."
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F9FAFB',
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<AttachFileIcon />}
                sx={{
                  backgroundColor: '#1976D2',
                  textTransform: 'capitalize',
                  mb: 3,
                }}
              >
                Add Note
              </Button>

              {/* Activities */}
              <Box sx={{ mt: 3 }}>
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <ActivityItem key={index}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ActivityAuthor>{activity.author}</ActivityAuthor>
                        <ActivityDate>
                          <Typography>{activity.date}</Typography>
                        </ActivityDate>
                      </Box>
                      <ActivityContent>{activity.content}</ActivityContent>
                    </ActivityItem>
                  ))
                ) : (
                  <Typography sx={{ color: '#666', textAlign: 'center' }}>
                    No activities yet
                  </Typography>
                )}
              </Box>
            </SectionContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default OpportunityPipeline;
