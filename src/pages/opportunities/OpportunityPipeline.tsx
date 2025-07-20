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
  MenuItem,
  Select,
  FormControl,
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
  SuccessAlert,
  ErrorAlert,
  PipelineTransitionAlert,
} from '../../components/Button/SuccessAlert';
import { CloudinaryFileUpload } from '../../components/CloudinaryFileUpload';

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
import {
  attachFileToOpportunity,
  deleteOpportunityAttachment,
  uploadAndAttachFileToOpportunity,
} from '../../utils/uploadFileToCloudinary';

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
  const [alertState, setAlertState] = useState({
    success: { open: false, message: '' },
    error: { open: false, message: '' },
    transition: { open: false, message: '' },
  });

  const module = 'Opportunities';
  const crntPage = opportunity?.name || 'Opportunity';

  useEffect(() => {
    if (id) {
      fetchOpportunityData();
    } else {
      setAlertState({
        ...alertState,
        error: { open: true, message: 'Opportunity ID is missing' },
      });
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
            result: res.opportunity.result || '',
          });

          // Set activities if available
          if (res.activities) {
            setActivities(res.activities);
          }
        } else {
          setAlertState({
            ...alertState,
            error: {
              open: true,
              message: 'Failed to load opportunity data',
            },
          });
        }
      });
    } catch (error) {
      console.error('Error fetching opportunity data:', error);
      setAlertState({
        ...alertState,
        error: {
          open: true,
          message: 'An error occurred while loading opportunity data',
        },
      });
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
    // Очищаем предыдущие сообщения
    setAlertState({
      success: { open: false, message: '' },
      error: { open: false, message: '' },
      transition: { open: false, message: '' },
    });

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
      } else if (
        pipelineMetadata.current_stage === 'IDENTIFY_DECISION_MAKERS' &&
        opportunity?.attachments?.length > 0
      ) {
        shouldMoveToNextStage = true;
        nextStage = 'PROPOSAL';
      } else if (
        pipelineMetadata.current_stage === 'PROPOSAL' &&
        formData.feedback
      ) {
        shouldMoveToNextStage = true;
        nextStage = 'NEGOTIATION';
      } else if (
        pipelineMetadata.current_stage === 'NEGOTIATION' &&
        formData.result &&
        opportunity?.attachments?.some(
          (att: any) =>
            att.file_name?.toLowerCase().includes('contract') ||
            att.file_type?.includes('contract')
        )
      ) {
        shouldMoveToNextStage = true;
        nextStage = 'CLOSED';
      }

      // Всегда используем JSON для обновления pipeline
      const dataToSend: any = {
        stage: pipelineMetadata.current_stage,
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

      // Handle response
      if (!response.error) {
        // Если нужно перейти на следующий этап, делаем второй запрос
        if (shouldMoveToNextStage) {
          const stageChangeData = {
            stage: nextStage,
          };

          const stageChangeResponse = await fetchData(
            `${OpportunityUrl}/${id}/pipeline/`,
            'PATCH',
            JSON.stringify(stageChangeData),
            headers
          );

          if (!stageChangeResponse.error) {
            const transitionMessages: { [key: string]: string } = {
              IDENTIFY_DECISION_MAKERS:
                'Meeting date saved! Moving to Identify Decision Makers stage...',
              PROPOSAL: 'Document uploaded! Moving to Proposal stage...',
              NEGOTIATION: 'Feedback saved! Moving to Negotiation stage...',
              CLOSED: 'Contract uploaded! Moving to Closed stage...',
            };

            setAlertState({
              ...alertState,
              transition: {
                open: true,
                message:
                  transitionMessages[nextStage] || 'Moving to next stage...',
              },
            });

            setTimeout(() => {
              fetchOpportunityData();
            }, 1500);
          } else {
            setAlertState({
              ...alertState,
              error: {
                open: true,
                message: 'Data saved, but failed to move to next stage',
              },
            });
          }
        } else {
          setAlertState({
            ...alertState,
            success: {
              open: true,
              message: response.message || 'Changes saved successfully',
            },
          });

          setTimeout(() => {
            fetchOpportunityData();
          }, 1000);
        }
      } else {
        const errorMessage =
          typeof response.errors === 'object'
            ? Object.values(response.errors).flat().join(', ')
            : response.errors || 'Failed to save changes';

        setAlertState({
          ...alertState,
          error: {
            open: true,
            message: errorMessage,
          },
        });
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setAlertState({
        ...alertState,
        error: {
          open: true,
          message: 'An error occurred while saving changes',
        },
      });
    }

    setSaving(false);
  };

  const handleCancel = () => {
    navigate('/app/opportunities');
  };

  // Обработчик загрузки файла через Cloudinary
  const handleCloudinaryUpload = async (fileData: {
    file_url: string;
    file_name: string;
    file_type: string;
  }) => {
    try {
      // Прикрепляем файл к opportunity через API
      const token = localStorage.getItem('Token');
      const org = localStorage.getItem('org');
      const headers = {
        Authorization: token || '',
        org: org || '',
      };

      const result = await attachFileToOpportunity(
        id!,
        fileData.file_url,
        fileData.file_name,
        fileData.file_type,
        headers
      );

      if (result.success) {
        setAlertState({
          ...alertState,
          success: {
            open: true,
            message: 'File uploaded successfully',
          },
        });

        // Обновляем данные opportunity
        fetchOpportunityData();

        // Проверяем, нужно ли переходить на следующий этап
        if (pipelineMetadata.current_stage === 'IDENTIFY_DECISION_MAKERS') {
          // Обновляем formData для последующего сохранения
          setFormData({ ...formData, has_proposal_doc: true });
        }
      } else {
        throw new Error(result.error || 'Failed to attach file');
      }
    } catch (error) {
      console.error('Error attaching file:', error);
      setAlertState({
        ...alertState,
        error: {
          open: true,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to attach file to opportunity',
        },
      });
    }
  };

  // Обработчик ошибок загрузки
  const handleUploadError = (error: string) => {
    setAlertState({
      ...alertState,
      error: {
        open: true,
        message: error,
      },
    });
  };

  // Обработчик удаления файла
  const handleDeleteFile = async (index: number) => {
    try {
      const attachment = opportunity.attachments[index];
      if (!attachment) return;

      const token = localStorage.getItem('Token');
      const org = localStorage.getItem('org');
      const headers = {
        Authorization: token || '',
        org: org || '',
      };

      const result = await deleteOpportunityAttachment(
        id!,
        attachment.id,
        headers
      );

      if (result.success) {
        setAlertState({
          ...alertState,
          success: {
            open: true,
            message: 'File deleted successfully',
          },
        });

        // Обновляем данные opportunity
        fetchOpportunityData();
      } else {
        throw new Error(result.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setAlertState({
        ...alertState,
        error: {
          open: true,
          message:
            error instanceof Error ? error.message : 'Failed to delete file',
        },
      });
    }
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
                  <CloudinaryFileUpload
                    onFileUpload={handleCloudinaryUpload}
                    onError={handleUploadError}
                    accept=".pdf,.doc,.docx"
                    maxSizeMB={10}
                    buttonText="Upload Proposal Document"
                    variant="button"
                    existingFiles={
                      opportunity?.attachments?.map((att: any) => ({
                        file_name: att.file_name,
                        file_url: att.attachment || att.file_url,
                        file_type: att.file_type,
                      })) || []
                    }
                    onDeleteFile={handleDeleteFile}
                    disabled={saving}
                  />
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
                  <FormControl fullWidth>
                    <Select
                      value={formData.result || ''}
                      onChange={(e) =>
                        handleFieldChange('result', e.target.value)
                      }
                      displayEmpty
                      sx={{
                        backgroundColor: '#F9FAFB',
                        '& .MuiSelect-select': {
                          py: '10px',
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select Result</em>
                      </MenuItem>
                      <MenuItem value="Close Won">Close Won</MenuItem>
                      <MenuItem value="Close Lost">Close Lost</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            )}

            {/* field for uploading  */}
            {editableFields.includes('attachment_links') && (
              <div style={fieldStyles.fieldRow}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Contract Document
                </div>
                <div style={fieldStyles.fieldInput}>
                  <CloudinaryFileUpload
                    onFileUpload={handleCloudinaryUpload}
                    onError={handleUploadError}
                    accept=".pdf,.doc,.docx"
                    maxSizeMB={10}
                    buttonText="Upload Contract Document"
                    variant="button"
                    existingFiles={
                      opportunity?.attachments
                        ?.filter(
                          (att: any) =>
                            att.file_name?.toLowerCase().includes('contract') ||
                            att.file_type?.includes('contract')
                        )
                        .map((att: any) => ({
                          file_name: att.file_name,
                          file_url: att.attachment || att.file_url,
                          file_type: att.file_type,
                        })) || []
                    }
                    onDeleteFile={handleDeleteFile}
                    disabled={saving}
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
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
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
        {alertState.success.open && (
          <Box sx={{ px: '38px', pt: 2 }}>
            <Alert
              severity="success"
              onClose={() =>
                setAlertState({
                  ...alertState,
                  success: { open: false, message: '' },
                })
              }
            >
              {alertState.success.message}
            </Alert>
          </Box>
        )}
        {alertState.error.open && (
          <Box sx={{ px: '38px', pt: 2 }}>
            <Alert
              severity="error"
              onClose={() =>
                setAlertState({
                  ...alertState,
                  error: { open: false, message: '' },
                })
              }
            >
              {alertState.error.message}
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

      {/* Alert Components - размещаем в конце компонента */}
      <SuccessAlert
        open={alertState.success.open}
        message={alertState.success.message}
        onClose={() =>
          setAlertState({
            ...alertState,
            success: { open: false, message: '' },
          })
        }
      />

      <ErrorAlert
        open={alertState.error.open}
        message={alertState.error.message}
        onClose={() =>
          setAlertState({ ...alertState, error: { open: false, message: '' } })
        }
      />

      <PipelineTransitionAlert
        open={alertState.transition.open}
        message={alertState.transition.message}
        onClose={() =>
          setAlertState({
            ...alertState,
            transition: { open: false, message: '' },
          })
        }
      />
    </Box>
  );
}

export default OpportunityPipeline;
