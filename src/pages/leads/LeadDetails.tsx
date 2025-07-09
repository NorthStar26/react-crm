import React, { useEffect, useState } from 'react'
import {
    Button,
    Avatar,
    Box,
    Typography,
    Link,
    TextField,
    Tooltip,
} from '@mui/material'
import { 
    FaPlus, 
    FaPaperclip, 
    FaExchangeAlt, 
    FaSyncAlt, 
    FaPen, 
    FaFilePdf, 
    FaFileWord, 
    FaFileExcel, 
    FaFilePowerpoint, 
    FaFileImage, 
    FaFileArchive, 
    FaFile,
    FaFileAlt,
    FaFileCode,
    FaTimes,
    FaEnvelope,
    FaBuilding,
    FaIdBadge
} from 'react-icons/fa'
import { CustomAppBar } from '../../components/CustomAppBar'
import { useNavigate, useParams } from 'react-router-dom'
import { LeadUrl } from '../../services/ApiUrls'
import { fetchData } from '../../components/FetchData'
import FormateTime from '../../components/FormateTime'
import '../../styles/style.css'
import { uploadFileToCloudinary, uploadAndAttachFileToLead, isFileTypeAllowed } from '../../utils/uploadFileToCloudinary'

export const formatDate = (dateString: any) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
}

type LeadResponse = {
    lead_obj: {
        id: string;
        description: string;
        link: string;
        amount: string;
        probability: number;
        status: string;
        lead_source: string;
        notes: string;
        assigned_to: {
            id: string;
            user_details: {
                email: string;
                id: string;
                is_active: boolean;
                profile_pic: string;
                first_name: string;
                last_name: string;
            };
        };
        contact: {
            id: string;
            salutation: string;
            first_name: string;
            last_name: string;
            title: string;
            primary_email: string;
            mobile_number: string;
            description: string;
            company?: {
                id: string;
                name: string;
                email: string;
                phone: string;
                website: string;
            };
        };
        company: {
            id: string;
            name: string;
            email: string;
            phone: string;
            website: string;
        };
        created_at: string;
        created_by: {
            id: string;
            email: string;
            profile_pic: string;
        };
        organization: {
            id: string;
            name: string;
            api_key: string;
        };
        lead_attachment: any[];
    };
    attachments: any[];
    comments: any[];
    users: Array<{
        id: string;
        user_details: {
            email: string;
            id: string;
            is_active: boolean;
            profile_pic: string;
            first_name: string;
            last_name: string;
        };
    }>;
    source: Array<[string, string]>;
    status: Array<[string, string]>;
    countries: Array<[string, string]>;
};

// Function to get the appropriate icon based on file extension
const getFileIcon = (fileName: string) => {
    if (!fileName) return <FaFile />;
    
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
        case 'pdf':
            return <FaFilePdf style={{ color: '#f40f02' }} />;
        case 'doc':
        case 'docx':
            return <FaFileWord style={{ color: '#2b579a' }} />;
        case 'xls':
        case 'xlsx':
        case 'csv':
            return <FaFileExcel style={{ color: '#217346' }} />;
        case 'ppt':
        case 'pptx':
            return <FaFilePowerpoint style={{ color: '#d24726' }} />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
        case 'tiff':
        case 'svg':
            return <FaFileImage style={{ color: '#7e4dd2' }} />;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <FaFileArchive style={{ color: '#ffc107' }} />;
        case 'txt':
        case 'rtf':
            return <FaFileAlt style={{ color: '#5a6268' }} />;
        case 'html':
        case 'css':
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        case 'json':
            return <FaFileCode style={{ color: '#0099e5' }} />;
        default:
            return <FaFile style={{ color: '#6c757d' }} />;
    }
};

// Function to truncate long filenames
const truncateFilename = (fileName: string, maxLength: number = 20) => {
    if (!fileName) return '';
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const nameWithoutExtension = fileName.includes('.') 
        ? fileName.substring(0, fileName.lastIndexOf('.')) 
        : fileName;
    
    // Calculate how much of the name we can show
    const availableChars = maxLength - 3; // 3 characters for ellipsis
    const truncatedName = nameWithoutExtension.substring(0, availableChars) + '...';
    
    return extension ? `${truncatedName}.${extension}` : truncatedName;
};

function LeadDetails() {
    const navigate = useNavigate();
    // Get leadId from URL parameters
    const { leadId } = useParams<{ leadId: string }>();
    const [leadData, setLeadData] = useState<LeadResponse | null>(null);
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [noteSubmitting, setNoteSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [commentsToShow, setCommentsToShow] = useState(5);
    const [attachmentUploading, setAttachmentUploading] = useState(false);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);

    useEffect(() => {
        if (leadId) {
            getLeadDetails(leadId)
        }
    }, [leadId])

    const getLeadDetails = (id: string) => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        fetchData(`${LeadUrl}/${id}/`, 'GET', null as any, Header)
            .then((res) => {
                if (!res.error) {
                    setLeadData(res);
                }
            })
            .catch((err) => {
                console.error('Error:', err);
            })
    }


    const backbtnHandle = () => {
        navigate('/app/leads')
    }

    

    const editHandle = () => {
        navigate('/app/leads/edit-lead', {
            state: {
                id: leadId,
                leadData: leadData
            }
        })
    }

    const handleAttachmentClick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        // Accept all the file types we support
        fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,.zip,.rar,.7z,.tar,.gz,.psd,.ai,.eps,.ttf,.otf,.woff,.woff2,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.ico,.heic,.svg,.avif,.jfif';
        
        fileInput.addEventListener('change', async (event: any) => {
            const files = event.target.files;
            if (files && files[0]) {
                const file = files[0];
                
                // Check if file type is allowed
                if (!isFileTypeAllowed(file)) {
                    setAttachmentError('This file type is not supported. Please select a different file.');
                    return;
                }
                
                // Show loading indicator
                setAttachmentUploading(true);
                setAttachmentError(null);
                
                try {
                    // Prepare headers for API request
                    const headers = {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: localStorage.getItem('Token'),
                        org: localStorage.getItem('org')
                    };
                    
                    // Upload and attach the file
                    const result = await uploadAndAttachFileToLead(leadId as string, file, headers);
                    
                    if (result.success) {
                        // Add to local state
                        setAttachments(prev => [...prev, file]);
                        // Refresh lead details to show the new attachment
                        getLeadDetails(leadId as string);
                    } else {
                        setAttachmentError(`Failed to upload file: ${result.error}`);
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    setAttachmentError('An error occurred while uploading the file.');
                } finally {
                    // Hide loading indicator
                    setAttachmentUploading(false);
                }
            }
        });
        
        fileInput.click();
    };

    const submitNote = () => {
        if (!note.trim()) {
            setNoteError('Note cannot be empty');
            return;
        }

        setNoteSubmitting(true);
        
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        };

        const data = JSON.stringify({
            comment: note,
        });

        fetchData(`${LeadUrl}/${leadId}/`, 'POST', data, Header)
            .then((res) => {
                if (!res.error) {
                    // Refresh lead details to show the new comment
                    getLeadDetails(leadId as string);
                    setNote('');
                    setNoteError('');
                    // Could add success message here
                }
            })
            .catch((err) => {
                console.error('Error submitting note:', err);
                setNoteError('Failed to submit note. Please try again.');
            })
            .finally(() => {
                setNoteSubmitting(false);
            });
    };

    const handleShowMoreComments = () => {
        setCommentsToShow(prev => prev + 5);
    };

    const handleAttachmentDelete = (attachmentId: string) => {
        // Confirm before deleting
        if (window.confirm("Do you want to delete this attachment?")) {
            // Show loading indicator
            setAttachmentUploading(true);
            setAttachmentError(null);
            
            // Use the Header object consistent with other API calls
            const Header = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('Token'),
                org: localStorage.getItem('org')
            };
            
            // Use fetchData function like other API calls
            // API endpoint should be /api/leads/attachment/ID/ not /leads/attachment/
            fetchData(`/${LeadUrl}/attachment/${attachmentId}/`, 'DELETE', null as any, Header)
                .then((res) => {
                    if (!res.error) {
                        // Success - refresh lead details to update the UI
                        getLeadDetails(leadId as string);
                    } else {
                        setAttachmentError(res.errors || "Error deleting attachment");
                    }
                })
                .catch((err) => {
                    console.error("Error deleting attachment:", err);
                    setAttachmentError("Failed to delete attachment. Please try again.");
                })
                .finally(() => {
                    setAttachmentUploading(false);
                });
        }
    };

    const module = 'Leads'
    const crntPage = 'Lead Details'
    const backBtn = 'Back To Leads'
    
    return (
        <Box sx={{ mt: '60px' }}>
            <Box>
                <CustomAppBar backbtnHandle={backbtnHandle} module={module} backBtn={backBtn} crntPage={crntPage} editHandle={editHandle} />
                
                <Box sx={{ mt: '40px', p: '80px 40px'  }}>
                    
                    
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ flex: 3 }}>
                            <Box sx={{ mb: 3 ,p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: 'white'}}>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 2 }}>
                            <Box>
                                <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                                    {leadData?.lead_obj?.contact?.first_name } {leadData?.lead_obj?.contact?.last_name || 'Doe'} Lead
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    {/* First row: Status and Email */}
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            {leadData?.lead_obj?.status || 'Qualified'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FaEnvelope style={{ marginRight: '8px', color: '#666' }} size={14} />
                                        <Typography variant="body1">
                                            {leadData?.lead_obj?.contact?.primary_email}
                                        </Typography>
                                    </Box>
                                    
                                    {/* Second row: Company and Job Title */}
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FaBuilding style={{ marginRight: '8px', color: '#666' }} size={14} />
                                        <Typography variant="body1" color="text.secondary">
                                            {leadData?.lead_obj?.contact?.company?.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FaIdBadge style={{ marginRight: '8px', color: '#666' }} size={14} />
                                        <Typography variant="body1" color="text.secondary">
                                            {leadData?.lead_obj?.contact?.title}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '180px' }}>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    sx={{ borderRadius: '4px', width: '100%', textTransform: 'capitalize' }}
                                    startIcon={<FaSyncAlt />}
                                >
                                    Convert
                                </Button>
                                
                                <Button 
                                    variant="outlined"
                                    sx={{ borderRadius: '4px', width: '100%', textTransform: 'capitalize' }}
                                    onClick={editHandle}
                                    startIcon={<FaPen />}
                                >
                                    Edit lead
                                </Button>
                                
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={<FaPaperclip />}
                                    sx={{ borderRadius: '4px', width: '100%', textTransform: 'capitalize' }}
                                    onClick={handleAttachmentClick}
                                    disabled={attachmentUploading}
                                >
                                    {attachmentUploading ? 'Uploading...' : 'Add attachment'}
                                </Button>
                            </Box>
                        </Box>
                        
                        {attachmentError && (
                            <Box sx={{ mt: 1, color: 'error.main' }}>
                                <Typography variant="body2" color="error">
                                    {attachmentError}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                            {/* Left column - Lead Information */}
                            <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: 'white' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Lead Information</Typography>
                                
                                
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                    <Box sx={{ flex: '0 0 33%', mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Link</Typography>
                                        <Typography variant="body1">{leadData?.lead_obj?.link || 'https://link.com'}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ flex: '0 0 33%', mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Lead Source</Typography>
                                        <Typography variant="body1">{leadData?.lead_obj?.lead_source || 'Web'}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ flex: '0 0 33%', mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Industry</Typography>
                                        <Typography variant="body1">Technology</Typography>
                                    </Box>
                                    
                                    <Box sx={{ flex: '0 0 33%', mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Lead Owner</Typography>
                                        <Typography variant="body1">
                                            {leadData?.lead_obj?.assigned_to?.user_details?.first_name || 'Johny'} {' '}
                                            {leadData?.lead_obj?.assigned_to?.user_details?.last_name || 'User'}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ flex: '0 0 33%', mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Created</Typography>
                                        <Typography variant="body1">{new Date(leadData?.lead_obj?.created_at || '').toLocaleDateString()}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ flex: '0 0 33%', mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Attachments</Typography>
                                        {leadData?.lead_obj?.lead_attachment && leadData.lead_obj.lead_attachment.length > 0 ? (
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: 1, 
                                                mt: 1, 
                                                maxHeight: '200px', 
                                                overflowY: 'auto',
                                                pr: 1
                                            }}>
                                                {leadData.lead_obj.lead_attachment.map((attachment, index) => {
                                                    // Check if we have a file_path or use the attachment_url
                                                    let url = attachment.file_path;
                                                    
                                                    // If file_path is encoded, decode it
                                                    if (url && url.startsWith('/media/https%3A')) {
                                                        url = decodeURIComponent(url.replace('/media/', ''));
                                                    }
                                                    
                                                    const isPdf = attachment.file_name && attachment.file_name.toLowerCase().endsWith('.pdf');
                                                    const isDoc = attachment.file_name && (attachment.file_name.toLowerCase().endsWith('.doc') || attachment.file_name.toLowerCase().endsWith('.docx'));
                                                    const isXls = attachment.file_name && (attachment.file_name.toLowerCase().endsWith('.xls') || attachment.file_name.toLowerCase().endsWith('.xlsx'));
                                                    const isPpt = attachment.file_name && (attachment.file_name.toLowerCase().endsWith('.ppt') || attachment.file_name.toLowerCase().endsWith('.pptx'));
                                                    const isImage = attachment.file_name && (attachment.file_name.toLowerCase().endsWith('.jpg') || attachment.file_name.toLowerCase().endsWith('.jpeg') || attachment.file_name.toLowerCase().endsWith('.png') || attachment.file_name.toLowerCase().endsWith('.gif'));
                                                    const isArchive = attachment.file_name && (attachment.file_name.toLowerCase().endsWith('.zip') || attachment.file_name.toLowerCase().endsWith('.rar') || attachment.file_name.toLowerCase().endsWith('.7z'));
                                                    
                                                    // If it's a PDF, add download parameter
                                                    if (isPdf && url && !url.includes('?')) {
                                                        url = url + '?dl=1';
                                                    }
                                                    
                                                    return (
                                                        <Box 
                                                            key={index} 
                                                            sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                p: 1, 
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '4px',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderColor: '#d0d0d0'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                                                                <Tooltip title={attachment.file_name} arrow>
                                                                    <Avatar sx={{ mr: 1.5, width: 28, height: 28, bgcolor: 'action.hover', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                                                        {getFileIcon(attachment.file_name)}
                                                                    </Avatar>
                                                                </Tooltip>
                                                                <Link 
                                                                    href={url} 
                                                                    target="_blank" 
                                                                    rel="noopener"
                                                                    download={isPdf ? attachment.file_name || `document-${index}.pdf` : undefined}
                                                                    style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                                                                >
                                                                    <Typography variant="body1" sx={{ 
                                                                        display: 'inline-flex', 
                                                                        alignItems: 'center',
                                                                        maxWidth: '220px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}>
                                                                        {truncateFilename(attachment.file_name || `Attachment ${index + 1}`, 35)}
                                                                    </Typography>
                                                                </Link>
                                                            </Box>
                                                            <Tooltip title="Delete attachment" arrow>
                                                                <Button 
                                                                    onClick={() => handleAttachmentDelete(attachment.id)} 
                                                                    size="small"
                                                                    color="error"
                                                                    sx={{ 
                                                                        minWidth: 'auto', 
                                                                        ml: 1,
                                                                        p: '4px 8px',
                                                                        opacity: 0.8,
                                                                        '&:hover': { 
                                                                            opacity: 1,
                                                                            backgroundColor: '#ffebee'
                                                                        }
                                                                    }}
                                                                    disabled={attachmentUploading}
                                                                >
                                                                    <FaTimes size={14} />
                                                                </Button>
                                                            </Tooltip>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        ) : (
                                            <Typography variant="body1">No attachments</Typography>
                                        )}
                                    </Box>
                                </Box><Typography sx={{ flex: '0 0 33%', mb: 2 }}variant="body2" color="text.secondary">Description</Typography>
                                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: 'white', mb: 3 }}>
                                
                                <Typography variant="body1">
                                    {leadData?.lead_obj?.description || 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'}
                                </Typography>
                            </Box>
                            </Box>
                            
                            {/* Description section */}
                            
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                            {/* Right column - Activities and Notes */}
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: 'white' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Activities and Notes</Typography>
                                
                               
                                
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
                                            onClick={submitNote}
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
                                    {leadData?.comments && leadData.comments.length > 0 ? (
                                        <>
                                            {[...leadData.comments]
                                                .sort((a, b) => new Date(b.commented_on).getTime() - new Date(a.commented_on).getTime())
                                                .slice(0, commentsToShow)
                                                .map((comment: any, index: number) => (
                                                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                                        <Avatar sx={{ mr: 1, width: 32, height: 32 }} src={comment.commented_by_user?.profile_pic} />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {comment.commented_by_user?.first_name || ''} {comment.commented_by_user?.last_name || ''}
                                                            </Typography>
                                                            <Typography variant="body2">{comment.comment}</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                                            {new Date(comment.commented_on).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                ))
                                            }
                                            
                                            {/* Show More button for pagination */}
                                            {leadData.comments.length > commentsToShow && (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center', p: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No notes yet. Add a note to start the conversation.
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default LeadDetails;
