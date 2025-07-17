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

// Используем стили из нашего файла PipelineIcons для кастомного коннектора
const CustomConnector = styled(StepConnector)(() => ({
  [`& .MuiStepConnector-line`]: pipelineConnectorStyles.line,
  [`&.Mui-active .MuiStepConnector-line`]: pipelineConnectorStyles.active,
  [`&.Mui-completed .MuiStepConnector-line`]: pipelineConnectorStyles.completed,
}));

const MOCK_DATA = {
  opportunity: {
    id: 'e991b9b2-9e8a-4d9a-8441-b3ae6d37fa37',
    name: 'Test Opportunity',
    company_name: 'Test Company',
    contact_name: 'John Doe',
    amount: 10000,
    probability: 10,
    lead_source: 'Web',
    created_at: '2025-07-17',
    description: 'This is a test opportunity',
    assigned_to: 'Johny User',
    days_to_close: 90,
  },
  pipeline_metadata: {
    current_stage: 'QUALIFICATION',
    current_stage_display: 'Qualification',
    editable_fields: ['meeting_date'],
    next_stage: 'IDENTIFY_DECISION_MAKERS',
    available_stages: [
      { value: 'QUALIFICATION', label: 'Qualification' },
      { value: 'IDENTIFY_DECISION_MAKERS', label: 'Identify Decision Makers' },
      { value: 'PROPOSAL', label: 'Proposal' },
      { value: 'NEGOTIATION', label: 'Negotiation' },
    ],
    is_at_negotiation: false,
  },
};

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
    fetchOpportunityData();
  }, [id]);

  const fetchOpportunityData = async () => {
    setOpportunity(MOCK_DATA.opportunity);
    setPipelineMetadata(MOCK_DATA.pipeline_metadata);
    setFormData({
      meeting_date: null,
      proposal_doc: null,
      feedback: '',
      expected_close_date: null,
    });
    setLoading(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSuccessMessage('Changes saved successfully (Demo)');
      setSaving(false);
    }, 1000);
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
            {editableFields.includes('proposal_doc') && (
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
                          : formData.proposal_doc
                          ? 'Document uploaded'
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
            {editableFields.includes('expected_close_date') && (
              <div style={fieldStyles.fieldRow}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Expected Close Date
                </div>
                <div style={fieldStyles.fieldInput}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={
                        formData.expected_close_date
                          ? dayjs(formData.expected_close_date)
                          : null
                      }
                      onChange={(newValue) =>
                        handleFieldChange(
                          'expected_close_date',
                          newValue?.format('YYYY-MM-DD')
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!errors.expected_close_date,
                          helperText: errors.expected_close_date,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#F9FAFB',
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}
            {editableFields.includes('feedback') && (
              <div style={fieldStyles.fieldRow}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Negotiation Feedback
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
                    placeholder="Enter negotiation details..."
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!opportunity || !pipelineMetadata) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load opportunity data</Alert>
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
                      // Определяем иконку в зависимости от значения стадии
                      switch (stage.value) {
                        case 'QUALIFICATION':
                          return <CompletedStepIcon />; // Всегда галочка для первой стадии (Qualification)

                        case 'IDENTIFY_DECISION_MAKERS':
                          // Для второй стадии (Decision Makers)
                          if (getCurrentStepIndex() > 1) {
                            // Если мы уже прошли эту стадию, показываем зеленую галочку
                            return <CompletedStepIcon />;
                          } else {
                            // Иначе показываем голубую иконку (текущая стадия)
                            return <CurrentStepIcon />;
                          }

                        default:
                          // Стандартная логика для остальных стадий
                          if (index < getCurrentStepIndex()) {
                            return <CompletedStepIcon />; // Завершенные стадии - зеленые галочки
                          } else if (index === getCurrentStepIndex()) {
                            return <CurrentStepIcon />; // Текущая стадия - голубые песочные часы
                          } else {
                            return <PendingStepIcon />; // Будущие стадии - серые песочные часы
                          }
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
                    marginBottom: 0, // Убираем отступ у заголовка
                    paddingBottom: 0, // Убираем отступ у заголовка
                  }}
                >
                  <PageTitle>{opportunity.name}</PageTitle>
                  {/* <Divider sx={{ mt: 2, width: '100%' }} /> */}
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
                  pt: 0, // Устанавливаем padding-top в 0
                  marginTop: '-45px', // Добавляем отрицательный margin
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
                        {opportunity.company_name || 'Company Name'}
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
                        {opportunity.contact_name || 'Contact'}
                      </Typography>
                    </FieldContainer>
                  </Grid>
                </Grid>

                {/* Stage-specific content   */}
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
                  <FieldLabel>Expected Result</FieldLabel>
                  <StyledTextField
                    value={
                      ((opportunity.amount || 0) *
                        (opportunity.probability || 0)) /
                      100
                    }
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FieldLabel>Assigned To</FieldLabel>
                  <StyledTextField
                    value={opportunity.assigned_to || ''}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FieldLabel>Days To Close</FieldLabel>
                  <StyledTextField
                    value={opportunity.days_to_close || 0}
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
                placeholder="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
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
                <ActivityItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ActivityAuthor>John Doe</ActivityAuthor>
                    <ActivityDate>
                      <Typography>Jul 5, 2025, 12:30 AM</Typography>
                    </ActivityDate>
                  </Box>
                  <ActivityContent>Comment</ActivityContent>
                </ActivityItem>

                <ActivityItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ActivityAuthor>Action</ActivityAuthor>
                    <ActivityDate>
                      <Typography>Jul 2, 2025, 12:19 AM</Typography>
                    </ActivityDate>
                  </Box>
                  <ActivityContent sx={{ fontWeight: 700 }}>
                    Opportunity Name status changed into Qualification
                  </ActivityContent>
                </ActivityItem>
              </Box>
            </SectionContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default OpportunityPipeline;
