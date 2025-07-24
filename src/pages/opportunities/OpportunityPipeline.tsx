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
import { fireEuroConfetti } from '../../utils/fireConfetti';
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
// import { fireEuroConfetti } from '../../utils/fireConfetti';
import EuroConfetti from '../../components/EuroConfetti';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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
    paddingLeft: '62px',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-start',
  },
  fieldTitle: {
    minWidth: '70px',
    textAlign: 'left',
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
  const [formData, setFormData] = useState<any>({
    meeting_date: null,
    proposal_doc: null,
    feedback: '',
    expected_close_date: null,
    result: '',
    close_option: '',
    reason: '',
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [alertState, setAlertState] = useState({
    success: { open: false, message: '' },
    error: { open: false, message: '' },
    transition: { open: false, message: '' },
  });
  const [showClosedLostMessage, setShowClosedLostMessage] = useState(false);
  const [contractUploaded, setContractUploaded] = useState(false);
  const module = 'Opportunities';
  const crntPage = opportunity?.name || 'Opportunity';
  const [showConfetti, setShowConfetti] = useState(false);

  const handleConfetti = () => {
    setShowConfetti(true);
    // Автоматически скрыть через 3.5 секунды
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const [uploadedFile, setUploadedFile] = useState<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    attachmentType: string;
  } | null>(null);

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
        console.log('Pipeline metadata:', res.pipeline_metadata);
        console.log('Current stage:', res.pipeline_metadata?.current_stage);
        console.log('Editable fields:', res.pipeline_metadata?.editable_fields);

        if (!res.error) {
          setOpportunity(res.opportunity);
          setPipelineMetadata(res.pipeline_metadata);

          // Initialize form data based on the opportunity data
          setFormData((prev: typeof formData) => ({
            meeting_date: res.opportunity.meeting_date || null,
            proposal_doc: null,
            feedback: res.opportunity.feedback || '',
            expected_close_date: res.opportunity.expected_close_date || null,
            result: res.opportunity.result || '',
            close_option: prev.close_option,
            reason: res.opportunity.reason || '',
          }));

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
    setAlertState({
      success: { open: false, message: '' },
      error: { open: false, message: '' },
      transition: { open: false, message: '' },
    });

    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    try {
      let response;
      let dataToSend: any = {};

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token || '',
        org: org || '',
      };

      // Логика переходов согласно конфигурации бэкенда
      switch (pipelineMetadata.current_stage) {
        case 'QUALIFICATION':
          // QUALIFICATION: проверяем и сохраняем meeting_date, затем переходим на IDENTIFY_DECISION_MAKERS
          if (!formData.meeting_date) {
            throw new Error('Please select a meeting date');
          }

          // Отправляем meeting_date и переход на IDENTIFY_DECISION_MAKERS одним запросом
          dataToSend = {
            stage: 'PROPOSAL', // Сразу переходим на PROPOSAL, если бэкенд это поддерживает
            meeting_date: formData.meeting_date,
          };
          break;

        case 'IDENTIFY_DECISION_MAKERS':
          // На этой стадии можно редактировать meeting_date
          if (!formData.meeting_date) {
            throw new Error('Please select a meeting date');
          }

          // Переходим на PROPOSAL
          dataToSend = {
            stage: 'PROPOSAL',
          };
          break;

        case 'PROPOSAL':
          // На этой стадии можно загружать attachment_links
          // Проверяем наличие вложений типа 'proposal'
          const proposalAttachments = opportunity?.attachments?.filter(
            (att: any) => att.attachment_type === 'proposal'
          );

          if (
            (!proposalAttachments || proposalAttachments.length === 0) &&
            !uploadedFile
          ) {
            throw new Error(
              'Please upload a proposal document before proceeding'
            );
          }

          // Переходим на NEGOTIATION
          dataToSend = {
            stage: 'NEGOTIATION',
          };
          break;

        case 'NEGOTIATION':
          // На этой стадии можно редактировать feedback
          if (!formData.feedback || formData.feedback.trim() === '') {
            throw new Error('Please provide feedback before proceeding');
          }

          // Сначала сохраняем feedback
          dataToSend = {
            stage: pipelineMetadata.current_stage,
            feedback: formData.feedback,
          };

          response = await fetchData(
            `${OpportunityUrl}/${id}/pipeline/`,
            'PATCH',
            JSON.stringify(dataToSend),
            headers
          );

          if (!response.error) {
            // После успешного сохранения переходим на CLOSE
            dataToSend = {
              stage: 'CLOSE',
            };
          } else {
            throw new Error(response.errors || 'Failed to save feedback');
          }
          break;

        case 'CLOSE':
          // На этой стадии выбираем Won или Lost
          if (!formData.close_option) {
            throw new Error('Please select close option (Won/Lost)');
          }

          if (
            formData.close_option !== 'CLOSED WON' &&
            formData.close_option !== 'CLOSED LOST'
          ) {
            throw new Error('Invalid close option');
          }
          // Проверка для Close Won: контракт должен быть загружен
          if (formData.close_option === 'CLOSED WON') {
            const contractAttachments = opportunity?.attachments?.filter(
              (att: any) => att.attachment_type === 'contract'
            );
            if (
              (!contractAttachments || contractAttachments.length === 0) &&
              !contractUploaded
            ) {
              throw new Error(
                'Please upload a contract before closing as won.'
              );
            }
          }
          // Переходим на выбранную финальную стадию
          dataToSend = {
            stage: formData.close_option,
          };
          break;

        case 'CLOSED LOST':
          // На этой стадии можно редактировать reason
          if (!formData.reason || formData.reason.trim() === '') {
            throw new Error('Please provide a reason for loss');
          }

          // Сохраняем reason
          dataToSend = {
            stage: pipelineMetadata.current_stage,
            reason: formData.reason,
          };

          break;

        case 'CLOSED WON':
          // На этой стадии можно загружать contract через отдельный endpoint
          // Проверяем наличие контракта
          const contractAttachments = opportunity?.attachments?.filter(
            (att: any) => att.attachment_type === 'contract'
          );

          if (!contractAttachments || contractAttachments.length === 0) {
            setAlertState({
              ...alertState,
              success: {
                open: true,
                message:
                  'Deal closed as Won! You can upload contract if needed.',
              },
            });
            setSaving(false);
            return;
          } else {
            // Если контракт уже загружен
            setAlertState({
              ...alertState,
              success: {
                open: true,
                message: 'Deal closed as Won with contract!',
              },
            });
            setSaving(false);
            return;
          }

        default:
          throw new Error(`Unknown stage: ${pipelineMetadata.current_stage}`);
      }

      // Отправляем финальный запрос
      response = await fetchData(
        `${OpportunityUrl}/${id}/pipeline/`,
        'PATCH',
        JSON.stringify(dataToSend),
        headers
      );

      if (!response.error) {
        // Показываем сообщение только для CLOSED LOST
        if (pipelineMetadata.current_stage === 'CLOSED LOST') {
          setShowClosedLostMessage(true);
        }
        if (pipelineMetadata.current_stage === 'CLOSED WON') {
          setContractUploaded(false);
        }
        const transitionMessages: { [key: string]: string } = {
          IDENTIFY_DECISION_MAKERS:
            'Moving to Identify Decision Makers stage...',
          PROPOSAL: 'Meeting date saved! Moving to Proposal stage...',
          NEGOTIATION: 'Proposal uploaded! Moving to Negotiation stage...',
          CLOSE: 'Feedback saved! Moving to Close stage...',
          'CLOSED WON': 'Deal closed as Won!',
          'CLOSED LOST': 'Deal closed as Lost!',
        };

        const currentStageMessages: { [key: string]: string } = {
          IDENTIFY_DECISION_MAKERS: 'Meeting date saved successfully',
          PROPOSAL: 'Document uploaded successfully',
          NEGOTIATION: 'Feedback saved successfully',
          CLOSE: 'Close option selected',
          'CLOSED LOST': 'Reason saved successfully',
          'CLOSED WON': 'Contract uploaded successfully',
        };

        const isTransition =
          dataToSend.stage !== pipelineMetadata.current_stage;
        const message = isTransition
          ? transitionMessages[dataToSend.stage]
          : currentStageMessages[pipelineMetadata.current_stage] ||
            'Changes saved successfully';

        if (isTransition) {
          setAlertState({
            ...alertState,
            transition: {
              open: true,
              message: message,
            },
          });
        } else {
          setAlertState({
            ...alertState,
            success: {
              open: true,
              message: message,
            },
          });
        }

        // Обновляем данные через 1.5 секунды
        setTimeout(() => {
          fetchOpportunityData();
        }, 1500);
      } else {
        const errorMessage =
          typeof response.errors === 'object'
            ? Object.values(response.errors).flat().join(', ')
            : response.errors || 'Failed to save changes';

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setAlertState({
        ...alertState,
        error: {
          open: true,
          message:
            error instanceof Error
              ? error.message
              : 'An error occurred while saving changes',
        },
      });
    }

    setSaving(false);
  };

  const getAvailableStages = () => {
    if (!pipelineMetadata) return [];

    // Используем доступные стадии из бэкенда
    return pipelineMetadata.available_stages || [];
  };

  const handleCancel = () => {
    navigate('/app/opportunities');
  };

  // Обработчик загрузки файла через Cloudinary
  const handleCloudinaryUpload = async (fileData: {
    file_url: string;
    file_name: string;
    file_type: string;
    file?: File;
    attachment_type?: string;
  }) => {
    try {
      setSaving(true);

      const token = localStorage.getItem('Token');
      const org = localStorage.getItem('org');
      const headers = {
        Authorization: token || '',
        org: org || '',
      };

      // Определяем тип вложения на основе текущей стадии
      let attachmentType = fileData.attachment_type;
      if (!attachmentType) {
        if (pipelineMetadata.current_stage === 'PROPOSAL') {
          attachmentType = 'proposal';
        } else if (pipelineMetadata.current_stage === 'CLOSED WON') {
          attachmentType = 'contract';
        }
      }

      const result = await attachFileToOpportunity(
        id!,
        fileData.file_url,
        fileData.file_name,
        fileData.file_type,
        headers,
        attachmentType
      );

      if (result.success) {
        // Сохраняем информацию о загруженном файле в состоянии
        setUploadedFile({
          fileName: fileData.file_name,
          fileUrl: fileData.file_url,
          fileType: fileData.file_type,
          attachmentType: attachmentType || 'proposal',
        });
        if ((attachmentType || fileData.attachment_type) === 'contract') {
          setContractUploaded(true);
        }
        setAlertState({
          ...alertState,
          success: {
            open: true,
            message: `${
              attachmentType === 'contract' ? 'Contract' : 'Document'
            } uploaded successfully`,
          },
        });

        // Обновляем данные opportunity
        fetchOpportunityData();
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
    } finally {
      setSaving(false);
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

    // Если стадия QUALIFICATION, то активной считается IDENTIFY_DECISION_MAKERS
    if (pipelineMetadata.current_stage === 'QUALIFICATION') {
      const stages = pipelineMetadata.available_stages || [];
      const identifyIndex = stages.findIndex(
        (stage: any) => stage.value === 'IDENTIFY_DECISION_MAKERS'
      );
      return identifyIndex >= 0 ? identifyIndex : 1;
    }
    //  If the current stage is CLOSED WON or CLOSED LOST, we want to show the CLOSE stage
    if (
      pipelineMetadata.current_stage === 'CLOSED WON' ||
      pipelineMetadata.current_stage === 'CLOSED LOST'
    ) {
      const stages = pipelineMetadata.available_stages || [];
      return stages.findIndex((stage: any) => stage.value === 'CLOSE');
    }

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
        // Для QUALIFICATION показываем поле meeting_date, так как мы редактируем его для перехода на IDENTIFY_DECISION_MAKERS
        return (
          <div style={fieldStyles.fieldContainer}>
            <div style={{ ...fieldStyles.fieldRow, marginLeft: '-60px' }}>
              <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                Meeting Date
              </div>
              <div style={{ ...fieldStyles.fieldInput, marginLeft: '1px' }}>
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
              </div>
            </div>
          </div>
        );

      case 'IDENTIFY_DECISION_MAKERS':
        return (
          <div style={fieldStyles.fieldContainer}>
            {/* Убираем проверку editableFields.includes('meeting_date') */}
            <div style={fieldStyles.fieldRow}>
              <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                Meeting Date
              </div>
              <div style={fieldStyles.fieldInput}>
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
              </div>
            </div>
          </div>
        );

      case 'PROPOSAL':
        return (
          <div style={fieldStyles.fieldContainer}>
            <div style={{ ...fieldStyles.fieldRow, marginLeft: '-55px' }}>
              <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                Proposal Document
              </div>
              <div style={fieldStyles.fieldInput}>
                <CloudinaryFileUpload
                  onFileUpload={(fileData) =>
                    handleCloudinaryUpload({
                      ...fileData,
                      attachment_type: 'proposal',
                    })
                  }
                  onError={handleUploadError}
                  accept=".pdf,.doc,.docx,.xlsx,.ppt,.pptx"
                  maxSizeMB={10}
                  buttonText={
                    uploadedFile
                      ? `Proposal: ${uploadedFile.fileName}`
                      : 'Upload Proposal'
                  }
                  existingFiles={
                    opportunity?.attachments
                      ?.filter((att: any) => att.attachment_type === 'proposal')
                      .map((att: any) => ({
                        file_name: att.file_name,
                        file_url: att.attachment,
                        file_type: att.file_type,
                      })) || []
                  }
                  onDeleteFile={handleDeleteFile}
                  showFileNameInButton={true}
                />

                {/* Показать информацию о загруженном файле, ожидающем сохранения */}
                {uploadedFile && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'green',
                      mt: 0,
                      display: 'flex',
                      alignItems: 'center',

                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {/* <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} /> */}
                    {/* File uploaded. Click Save to proceed to Negotiation stage */}
                  </Typography>
                )}
              </div>
            </div>
          </div>
        );

      case 'NEGOTIATION':
        return (
          <div style={fieldStyles.fieldContainer}>
            <div
              style={{
                ...fieldStyles.fieldRow,
                marginLeft: '-80px',
                gap: '8px',
              }}
            >
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
                  placeholder="Enter feedback ..."
                  error={!!errors.feedback}
                  helperText={errors.feedback}
                  sx={{
                    width: '350px',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'CLOSE':
        return (
          <div style={fieldStyles.fieldContainer}>
            <div style={{ ...fieldStyles.fieldRow, marginLeft: '-70px' }}>
              <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                Result
              </div>
              <div style={fieldStyles.fieldInput}>
                <Select
                  value={formData.close_option || ''}
                  onChange={(e) =>
                    handleFieldChange('close_option', e.target.value)
                  }
                  displayEmpty
                  sx={{
                    backgroundColor: '#F9FAFB',
                    width: '312px',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0,0,0,0.23)',
                    boxSizing: 'border-box',
                    // Стили для стрелочки (иконки)
                    '& .MuiSelect-icon': {
                      color: '#BDBDBD', // светло-серая стрелочка
                      right: 12,
                    },
                    // Стили для текста
                    '& .MuiSelect-select': {
                      py: '9px',
                      color: '#1A3353',
                      fontWeight: 400,
                      fontSize: '15px',
                    },
                    // Стили для рамки
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                  inputProps={{
                    style: {
                      borderRadius: 4,
                      paddingLeft: 12,
                      paddingRight: 32,
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Select Close Option</em>
                  </MenuItem>
                  <MenuItem value="CLOSED WON">Close Won</MenuItem>
                  <MenuItem value="CLOSED LOST">Close Lost</MenuItem>
                </Select>
              </div>
            </div>
            {/* Показываем поле Reason только если выбран Close Lost */}
            {formData.close_option === 'CLOSED LOST' && (
              <div style={{ ...fieldStyles.fieldRow, marginLeft: '-70px' }}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Reason
                </div>
                <div style={fieldStyles.fieldInput}>
                  <TextField
                    multiline
                    rows={4}
                    value={formData.reason || ''}
                    onChange={(e) =>
                      handleFieldChange('reason', e.target.value)
                    }
                    fullWidth
                    placeholder="Please provide a reason for closing as lost..."
                    error={!!errors.reason}
                    helperText={errors.reason}
                    sx={{
                      width: '312px',
                      height: '115px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F9FAFB',
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Showing Contract Upload for Close Won */}
            {formData.close_option === 'CLOSED WON' && (
              <div style={{ ...fieldStyles.fieldRow, marginLeft: '-70px' }}>
                <div style={fieldStyles.fieldTitle as React.CSSProperties}>
                  Contract
                </div>
                <div style={fieldStyles.fieldInput}>
                  <CloudinaryFileUpload
                    onFileUpload={(fileData) =>
                      handleCloudinaryUpload({
                        ...fileData,
                        attachment_type: 'contract',
                      })
                    }
                    onError={handleUploadError}
                    accept=".pdf,.doc,.docx"
                    maxSizeMB={10}
                    buttonText={
                      uploadedFile && uploadedFile.attachmentType === 'contract'
                        ? `Contract: ${uploadedFile.fileName}`
                        : 'Upload Contract'
                    }
                    existingFiles={
                      opportunity?.attachments
                        ?.filter(
                          (att: any) => att.attachment_type === 'contract'
                        )
                        .map((att: any) => ({
                          file_name: att.file_name,
                          file_url: att.attachment,
                          file_type: att.file_type,
                        })) || []
                    }
                    onDeleteFile={handleDeleteFile}
                    singleFile={true}
                    showFileNameInButton={true}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'CLOSED LOST':
        return (
          <div style={fieldStyles.fieldContainer}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 4,
                mt: 3,
              }}
            >
              <FaTimesCircle size={60} color="#f44336" />
              <Typography
                variant="h5"
                sx={{ color: '#f44336', fontWeight: 500 }}
              >
                Deal Closed - Lost
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#666', textAlign: 'center' }}
              >
                This opportunity has been closed as lost.
              </Typography>
            </Box>
          </div>
        );

      // case 'CLOSED WON':
      //   return (
      //     <div style={fieldStyles.fieldContainer}>
      //       <Box
      //         sx={{
      //           display: 'flex',
      //           flexDirection: 'column',
      //           alignItems: 'center',
      //           gap: 2,
      //           py: 4,
      //           mt: 3,
      //         }}
      //       >
      //         <CheckCircleIcon
      //           sx={{ fontSize: 60, color: '#4caf50', cursor: 'pointer' }}
      //           onClick={fireEuroConfetti} // ← вот здесь!
      //           titleAccess="Celebrate!"
      //         />
      //         <Typography
      //           variant="h5"
      //           sx={{ color: '#4caf50', fontWeight: 500 }}
      //         >
      //           Deal Closed - Won!
      //         </Typography>
      //       </Box>
      //     </div>
      //   );
      case 'CLOSED WON':
        return (
          <div style={fieldStyles.fieldContainer}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 4,
                mt: 3,
              }}
            >
              {showConfetti && <EuroConfetti />}
              <CheckCircleIcon
                sx={{ fontSize: 60, color: '#4caf50', cursor: 'pointer' }}
                onClick={handleConfetti}
                titleAccess="Celebrate!"
              />
              <Typography
                variant="h5"
                sx={{ color: '#4caf50', fontWeight: 500 }}
              >
                Deal Closed - Won!
              </Typography>
            </Box>
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

  console.log(opportunity);

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
                  completed={
                    //  Сonsider Close completed if the stage is CLOSED WON or CLOSED LOST
                    (pipelineMetadata.current_stage === 'CLOSED WON' ||
                      pipelineMetadata.current_stage === 'CLOSED LOST') &&
                    stage.value === 'CLOSE'
                      ? true
                      : index < getCurrentStepIndex()
                  }
                >
                  <StepLabel
                    StepIconComponent={() => {
                      // QUALIFICATION всегда должна быть завершена
                      if (stage.value === 'QUALIFICATION') {
                        return <CompletedStepIcon />;
                      }

                      // If the current stage is QUALIFICATION, then IDENTIFY_DECISION_MAKERS must be active
                      if (
                        pipelineMetadata.current_stage === 'QUALIFICATION' &&
                        stage.value === 'IDENTIFY_DECISION_MAKERS'
                      ) {
                        return <CurrentStepIcon />;
                      }
                      if (
                        (pipelineMetadata.current_stage === 'CLOSED WON' ||
                          pipelineMetadata.current_stage === 'CLOSED LOST') &&
                        stage.value === 'CLOSE'
                      ) {
                        return <CompletedStepIcon />;
                      }

                      // Стандартная логика для остальных стадий
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
                        index === getCurrentStepIndex() ||
                        (pipelineMetadata.current_stage === 'QUALIFICATION' &&
                          stage.value === 'IDENTIFY_DECISION_MAKERS')
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
                        {opportunity.lead?.company?.name || 'Company Name'}
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
                        {opportunity.lead?.contact.first_name.length +
                          opportunity.lead?.contact.last_name.length >
                        0
                          ? opportunity.lead?.contact.first_name +
                            ' ' +
                            opportunity.lead?.contact.last_name
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
                <Grid item xs={4}>
                  <FieldLabel>Meeting Date</FieldLabel>
                  <StyledTextField
                    value={
                      opportunity.meeting_date
                        ? new Date(
                            opportunity.meeting_date
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
                <Grid item xs={4}>
                  <FieldLabel>Lead Source</FieldLabel>
                  <StyledTextField
                    value={opportunity.lead_source || ''}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
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
                <Grid item xs={4}>
                  <FieldLabel>Proposed Documents</FieldLabel>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    {opportunity.attachments
                      ?.filter((att: any) => att.attachment_type === 'proposal')
                      .map((att: any, idx: number) => {
                        const ext = att.file_name
                          .split('.')
                          .pop()
                          ?.toLowerCase();
                        const isPdf = ext === 'pdf';
                        return (
                          <Box
                            key={att.file_name + idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <a
                              href={att.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: '#1976D2',
                              }}
                            >
                              {isPdf ? (
                                <PictureAsPdfIcon
                                  sx={{ color: '#d32f2f', mr: 0.5 }}
                                />
                              ) : (
                                <InsertDriveFileIcon
                                  sx={{ color: '#1976D2', mr: 0.5 }}
                                />
                              )}
                              <span
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 160,
                                }}
                              >
                                {att.file_name}
                              </span>
                            </a>
                          </Box>
                        );
                      })}
                    {opportunity.attachments &&
                    opportunity.attachments.length > 0 ? (
                      opportunity.attachments.map((att: any, idx: number) => {
                        const ext = att.file_name
                          .split('.')
                          .pop()
                          ?.toLowerCase();
                        const isPdf = ext === 'pdf';
                        return (
                          <Box
                            key={att.file_name + idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <a
                              href={att.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: '#1976D2',
                              }}
                            >
                              {isPdf ? (
                                <PictureAsPdfIcon
                                  sx={{ color: '#d32f2f', mr: 0.5 }}
                                />
                              ) : (
                                <InsertDriveFileIcon
                                  sx={{ color: '#1976D2', mr: 0.5 }}
                                />
                              )}
                              <span
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 160,
                                }}
                              >
                                {att.file_name}
                              </span>
                            </a>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No documents
                      </Typography>
                    )}
                  </Box>
                </Grid>
                {/* Остальные поля */}
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
            </SectionContainer>{' '}
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
