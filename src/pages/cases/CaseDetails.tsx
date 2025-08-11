import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Avatar,
    Box,
    Stack,
    Button,
    Chip,
    Snackbar,
    Alert,
    Typography,
    IconButton,
    CircularProgress,
    TextField
} from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { fetchData } from '../../components/FetchData'
import { CasesUrl, LeadUrl, OpportunityUrl } from '../../services/ApiUrls'
import { CustomAppBar } from '../../components/CustomAppBar'
import FormateTime from '../../components/FormateTime'
import { Label } from '../../components/Label'
import { SuccessAlert, AlertType } from '../../components/Button/SuccessAlert'
import { DialogModal } from '../../components/DialogModal'

const ThinPlus = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="3" x2="8" y2="13" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="3" y1="8" x2="13" y2="8" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
)

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

type response = {
    created_by: {
        email: string;
        id: string;
        profile_pic: string;
    };
    user_details: {
        email: string;
        id: string;
        profile_pic: string;
    };
    org: { name: string };
    lead: { account_name: string };
    account_attachment: [];
    assigned_to: [];
    contact_name: string;
    name: string;
    created_at: string;
    created_on: string;
    created_on_arrow: string;
    date_of_birth: string;
    title: string;
    first_name: string;
    last_name: string;
    account_name: string;
    phone: string;
    email: string;
    lead_attachment: string;
    opportunity_amount: string;
    website: string;
    description: string;
    status: string;
    source: string;
    address_line: string;
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    tags: [];
    company: string;
    probability: string;
    industry: string;
    skype_ID: string;
    file: string;
    case_type: string;
    contacts: [];
    closed_on: string;
    priority: string;
    account: {
        name: string;
    };
    close_date: string;
    organization: string;
    created_from_site: boolean;
    id: string;
    teams: [];
    case_attachment: string;
    leads: string;
    opportunity?: any;
    reason?: string;
};

export const CaseDetails = (props: any) => {
    const { state } = useLocation()
    const navigate = useNavigate()

    const [caseDetails, setCaseDetails] = useState<response | null>(null)
    const [contacts, setContacts] = useState([])
    const [attachments, setAttachments] = useState([])
    const [comments, setComments] = useState([])
    const [usersMention, setUsersMention] = useState([])
    const [opportunityDetails, setOpportunityDetails] = useState<any>(null)
    const [leadDetails, setLeadDetails] = useState<any>(null)
    
    // Comment functionality states
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [noteSubmitting, setNoteSubmitting] = useState(false);
    const [commentsToShow, setCommentsToShow] = useState(5);
    
    // Alert states
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<AlertType>('success');
    
    // Add Note modal states
    const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);

    useEffect(() => {
        getCaseDetails(state?.caseId, true)
    }, [state?.caseId])

    const getCaseDetails = (id: any, isInitialLoad = false) => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        fetchData(`${CasesUrl}/${id}/`, 'GET', null as any, Header)
            .then((res) => {
                if (!res.error) {
                    console.log('Case Details Response:', res?.cases_obj);
                    setCaseDetails(res?.cases_obj)
                    setContacts(res?.contacts)
                    setAttachments(res?.attachments)
                    setComments(res?.comments)
                    setUsersMention(res?.users_mention)
                }
            })
            .catch((err) => {
                <Snackbar open={!!err} autoHideDuration={4000} onClose={() => navigate('/app/cases')}>
                    <Alert onClose={() => navigate('/app/cases')} severity="error" sx={{ width: '100%' }}>
                        Failed to load!
                    </Alert>
                </Snackbar>
            })
    }

    const getLeadDetails = (leadId: string) => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        fetchData(`${LeadUrl}/${leadId}/`, 'GET', undefined, Header)
            .then(res => {
                console.log('Lead API response:', res);
                setLeadDetails(res)
            })
    }

    const editHandle = () => {
        navigate('/app/cases/edit-case', {
            state: {
                value: {
                    name: caseDetails?.name,
                    status: caseDetails?.status,
                    priority: caseDetails?.priority,
                    case_type: caseDetails?.case_type,
                    closed_on: caseDetails?.closed_on,
                    teams: caseDetails?.teams,
                    assigned_to: caseDetails?.assigned_to,
                    account: caseDetails?.account,
                    case_attachment: caseDetails?.case_attachment,
                    contacts: caseDetails?.contacts,
                    description: caseDetails?.description,
                }, id: state?.caseId,
                contacts: state?.contacts || [], priority: state?.priority || [], typeOfCases: state?.typeOfCases || [], account: state?.account || [], status: state?.status || []
            }
        })
    }

    const backbtnHandle = () => {
        navigate('/app/cases')
    }

    const module = 'Cases'
    const crntPage = 'Case Details'
    const backBtn = 'Back To List'

    useEffect(() => {
        if (caseDetails?.leads) {
            getLeadDetails(caseDetails.leads)
        }
    }, [caseDetails?.leads])

    useEffect(() => {
        if (caseDetails?.opportunity?.id) {
            getOpportunityDetails(caseDetails.opportunity.id)
        }
    }, [caseDetails?.opportunity?.id])

    const getOpportunityDetails = (oppId: string) => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        fetchData(`${OpportunityUrl}/${oppId}/`, 'GET', undefined, Header)
            .then(res => {
                setOpportunityDetails(res)
                if (res?.opportunity_obj?.lead?.id) {
                    console.log('Fetching lead with ID:', res.opportunity_obj.lead.id);
                    getLeadDetails(res.opportunity_obj.lead.id)
                }
            })
    }

    const handleDownload = async (url: string, fileName: string) => {
        try {
            const token = localStorage.getItem('Token');
            const org = localStorage.getItem('org');
            const response = await fetch(url, {
                headers: {
                    Authorization: token ? token : '',
                    org: org ? org : '',
                }
            });
            if (!response.ok) {
                alert('Failed to download file: ' + response.statusText);
                return;
            }
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Download failed');
        }
    };

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

        fetchData(`${CasesUrl}/${state?.caseId}/comment/`, 'POST', data, Header)
            .then((res) => {
                if (!res.error) {
                    // Refresh case details to show the new comment (not initial load)
                    getCaseDetails(state?.caseId, false);
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

    const handleShowMoreComments = () => {
        setCommentsToShow((prev) => prev + 5);
    };

    // Handler for closing the alert
    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    return (
        <Box sx={{ mt: '120px' }}>
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
                modalDialog={`Are you sure you want to add a note to ${
                    caseDetails?.name || ''
                }'s case?`}
                confirmText="Add"
                cancelText="Cancel"
            />

            <div>
                <CustomAppBar
                    backbtnHandle={backbtnHandle}
                    module={module}
                    backBtn={backBtn}
                    crntPage={crntPage}
                    backBtnSx={{
                        fontFamily: 'Font 1, sans-serif',
                        fontWeight: 500,
                        fontStyle: 'normal', // 'Medium' is not a valid CSS value
                        fontSize: 16,
                        lineHeight: '28px',
                        letterSpacing: '0.46px',
                        color: '#1A3353',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        textTransform: 'capitalize',
                        backgroundColor: 'white',
                    }}
                />

                {/* --- Main Content --- */}
                <Box
                    sx={{
                        mt: '24px',
                        px: 3,
                        backgroundColor: '#f5f5f5',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 3, 
                    }}
                >
                    {/* Show spinner while loading */}
                    {!caseDetails ? (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                        {/* Left Side: 3 separate cards */}
                        <Box sx={{ width: '65%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Opportunity Name Card */}
                        <Box
                            sx={{
                                borderRadius: '5px',
                                border: '1px solid #80808038',
                                backgroundColor: 'white',
                                p: 3,
                                display: 'flex',
                                boxShadow: '0px 1px 3px 0px #0000001F, 0px 1px 1px 0px #00000024, 0px 2px 1px -1px #00000033',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: 'Font 1, sans-serif',
                                        fontWeight: 700,
                                        fontStyle: 'normal',
                                        fontSize: 30,
                                        lineHeight: '36px',
                                        letterSpacing: 0,
                                        verticalAlign: 'middle',
                                        color: '#101828',
                                    }}
                                >
                                    {caseDetails?.opportunity?.name || 'Opportunity Name'}
                                </Typography>
                                {caseDetails?.opportunity?.stage && (
                                    <Chip
                                        label="Open"
                                        sx={{
                                            width: 121,
                                            height: 30,
                                            minWidth: 0,
                                            minHeight: 0,
                                            backgroundColor: '#D32F2F',
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: 14,
                                            letterSpacing: '0.5px',
                                            textTransform: 'capitalize',
                                            borderRadius: '16777200px',
                                            borderWidth: 1,
                                            borderStyle: 'solid',
                                            borderColor: '#D32F2F',
                                            boxShadow: '0px 0px 0px 2px #00996633 inset',
                                            opacity: 1,
                                        }}
                                    />
                                )}
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    mt: 2,
                                }}
                            >
                                {/* Company Name */}
                                <Button
                                    startIcon={<BusinessIcon />}
                                    variant="outlined"
                                    disabled
                                    sx={{
                                        borderRadius: '5px',
                                        border: '1px solid #e0e0e0',
                                        background: '#f9f9f9',
                                        color: '#1A3353',
                                        fontWeight: 600,
                                        minWidth: 180,
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {caseDetails?.opportunity?.company?.name
                                        ? capitalizeFirstLetter(caseDetails.opportunity.company.name)
                                        : 'Company Name'}
                                </Button>

                                {/* Contact Name */}
                                <Button
                                    startIcon={<PersonIcon />}
                                    variant="outlined"
                                    disabled
                                    sx={{
                                        borderRadius: '5px',
                                        border: '1px solid #e0e0e0',
                                        background: '#f9f9f9',
                                        color: '#1A3353',
                                        fontWeight: 600,
                                        minWidth: 180,
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {caseDetails?.opportunity?.contact
                                        ? capitalizeFirstLetter(
                                            `${caseDetails.opportunity.contact.first_name || ''} ${caseDetails.opportunity.contact.last_name || ''}`.trim()
                                        )
                                        : 'Contact'}
                                </Button>
                            </Box>
                            {/* Reason Box */}
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    background: '#F9FAFB',
                                    borderRadius: '4px',
                                    color: '#1A3353',
                                    fontWeight: 500,
                                    fontSize: '15px',
                                    minHeight: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 19 }}>
                                    <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <polygon points="11,2 21,17 1,17" fill="#D32F2F" />
                                        <rect x="10" y="8.5" width="2" height="4.5" fill="white" />
                                        <rect x="10" y="14.2" width="2" height="2" fill="white" />
                                    </svg>
                                </span>
                                {caseDetails?.reason || caseDetails?.opportunity?.reason || <span style={{ color: '#aaa' }}>No reason provided</span>}
                            </Box>
                        </Box>

                        {/* Financial Details Card */}
                        <Box
                            sx={{
                                borderRadius: '5px',
                                border: '1px solid #80808038',
                                backgroundColor: 'white',
                                p: 3,
                                boxShadow: '0px 1px 3px 0px #0000001F, 0px 1px 1px 0px #00000024, 0px 2px 1px -1px #00000033',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: 'Font 1, sans-serif',
                                    fontWeight: 600,
                                    fontStyle: 'normal',
                                    fontSize: 18,
                                    lineHeight: '27px',
                                    letterSpacing: '0.17px',
                                    verticalAlign: 'middle',
                                    color: '#1A3353',
                                    mb: 0
                                }}
                            >
                                Financial Details
                            </Typography>
                            <Box sx={{ width: '100%', mt: '-6px', mb: 1 }}>
                                <div style={{ borderBottom: '2px solid #e0e0e0', width: '100%' }} />
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                <Box>
                                    <div className="title2">Amount</div>
                                    <div className="value-box">
                                        {caseDetails?.opportunity?.amount
                                            ? Number(caseDetails.opportunity.amount) % 1 === 0
                                                ? Number(caseDetails.opportunity.amount)
                                                : Number(caseDetails.opportunity.amount)
                                            : '----'}                                    </div>
                                </Box>
                                <Box>
                                    <div className="title2">Probability</div>
                                    <div className="value-box">
                                        {leadDetails?.lead_obj?.probability
                                            ? `${leadDetails.lead_obj.probability}%`
                                            : '----'}
                                    </div>
                                </Box>
                                <Box>
                                    <div className="title2">Expected Result</div>
                                    <div className="value-box">
                                        {caseDetails?.opportunity?.expected_revenue
                                            ? Number(caseDetails.opportunity.expected_revenue) % 1 === 0
                                                ? Number(caseDetails.opportunity.expected_revenue)
                                                : Number(caseDetails.opportunity.expected_revenue)
                                            : '----'}                                    </div>
                                </Box>
                                <Box>
                                    <div className="title2">Assigned To</div>
                                    <div className="value-box">
                                        {caseDetails?.opportunity?.assigned_to?.length
                                            ? caseDetails.opportunity.assigned_to
                                                .map(
                                                    (user: any) =>
                                                        user.user_details
                                                            ? `${user.user_details.first_name || ''} ${user.user_details.last_name || ''}`.trim()
                                                            : user.first_name && user.last_name
                                                                ? `${user.first_name} ${user.last_name}`
                                                                : user.email || 'User'
                                                )
                                                .join(', ')
                                            : '----'}
                                    </div>
                                </Box>
                                <Box>
                                    <div className="title2">Days To Close</div>
                                    <div className="value-box">
                                        {caseDetails?.opportunity?.days_to_close || '----'}
                                    </div>
                                </Box>
                                <Box>
                                    <div className="title2">Meeting Date</div>
                                    <div className="value-box">
                                        {caseDetails?.opportunity?.meeting_date
                                            ? new Date(caseDetails.opportunity.meeting_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }).replace(/^(\w+) (\d+), (\d+)$/, '$1, $2 $3')
                                            : '----'}
                                    </div>
                                </Box>
                            </Box>
                        </Box>

                        {/* Opportunity Information Card */}
                        <Box
                            sx={{
                                borderRadius: '5px',
                                border: '1px solid #80808038',
                                backgroundColor: 'white',
                                p: 3,
                                display: 'flex',
                                boxShadow: '0px 1px 3px 0px #0000001F, 0px 1px 1px 0px #00000024, 0px 2px 1px -1px #00000033',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: 'Font 1, sans-serif',
                                    fontWeight: 600,
                                    fontStyle: 'normal',
                                    fontSize: 18,
                                    lineHeight: '27px',
                                    letterSpacing: '0.17px',
                                    verticalAlign: 'middle',
                                    color: '#1A3353',
                                    mb: 0
                                }}
                            >
                                Opportunity Information
                            </Typography>
                            <Box sx={{ width: '100%', mt: '-6px', mb: 1 }}>
                                <div style={{ borderBottom: '2px solid #e0e0e0', width: '100%' }} />
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                <Box>
                                    <div className="title2">Lead Source</div>
                                    <div className="value-box">
                                        {caseDetails?.opportunity?.lead_source || '----'}
                                    </div>
                                </Box>
                                <Box>
                                    <div className="title2">Created Date</div>
                                    <div className="value-box">
                                        {caseDetails?.opportunity?.created_at
                                            ? new Date(caseDetails.opportunity.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }).replace(/^(\w+) (\d+), (\d+)$/, '$1, $2 $3')
                                            : '----'}
                                    </div>
                                </Box>
                                <Box>
                                    <div className="title2">Attachment</div>
                                    <div
                                        className="value-box"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0,
                                            padding: 0,
                                            overflow: 'visible',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {Array.isArray(caseDetails?.opportunity?.attachment_links) && caseDetails.opportunity.attachment_links.length > 0 ? (
                                            caseDetails.opportunity.attachment_links.map((att: any, idx: number) => (
                                                <Box
                                                    key={att.attachment_id || att.file_name + idx}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        minHeight: '32px',
                                                        pl: 0.5,
                                                        mb: 0.5,
                                                        width: '100%',
                                                        // borderBottom removed
                                                    }}
                                                >
                                                    <PictureAsPdfIcon sx={{ color: '#d32f2f', mr: 1, fontSize: 22 }} />
                                                    <span
                                                        onClick={() => handleDownload(att.url, att.file_name)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            textDecoration: 'underline',
                                                            color: '#1976D2',
                                                            fontWeight: 500,
                                                            fontSize: 15,
                                                            maxWidth: 240,
                                                            overflow: 'hidden',
                                                            cursor: 'pointer'
                                                        }}
                                                        title={att.file_name}
                                                    >
                                                        <span
                                                            style={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                maxWidth: 200,
                                                            }}
                                                        >
                                                            {att.file_name}
                                                        </span>
                                                    </span>
                                                </Box>
                                            ))
                                        ) : (
                                            <span style={{ color: '#aaa', minHeight: 32, display: 'flex', alignItems: 'center' }}>----</span>
                                        )}
                                    </div>
                                </Box>
                            </Box>
                            {/* Description */}
                            <Box sx={{ mt: 3 }}>
                                <div className="title2" style={{ marginBottom: '10px' }}>
                                    Description
                                </div>
                                <div className="large-value-box">
                                    {caseDetails?.opportunity?.description ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: caseDetails.opportunity.description,
                                            }}
                                        />
                                    ) : (
                                        '----'
                                    )}
                                </div>
                            </Box>
                            {/* Feedback */}
                            <Box sx={{ mt: 3 }}>
                                <div className="title2" style={{ marginBottom: '10px' }}>
                                    Feedback
                                </div>
                                <div className="large-value-box">
                                    {caseDetails?.opportunity?.feedback ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: caseDetails.opportunity.feedback,
                                            }}
                                        />
                                    ) : (
                                        '----'
                                    )}
                                </div>
                            </Box>
                        </Box>
                        </Box> 

                        {/* Right Side: Activities and Notes */}
                        <Box
                            sx={{
                                width: '34%',
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
                                {comments && comments.length > 0 ? (
                                    <>
                                        {[...comments]
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
                                        {comments.length > commentsToShow && (
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
                        </>
                    )}
                </Box>
            </div>
        </Box>
    )
}

