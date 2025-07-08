import React, { useEffect, useState } from 'react'
import {
    Button,
    Avatar,
    Box,
    Typography,
    Link,
} from '@mui/material'
import { FaPlus, FaPaperclip } from 'react-icons/fa'
import { CustomAppBar } from '../../components/CustomAppBar'
import { useNavigate, useParams } from 'react-router-dom'
import { LeadUrl } from '../../services/ApiUrls'
import { fetchData } from '../../components/FetchData'
import FormateTime from '../../components/FormateTime'
import '../../styles/style.css'

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

function LeadDetails() {
    const navigate = useNavigate();
    // Get leadId from URL parameters
    const { leadId } = useParams<{ leadId: string }>();
    const [leadData, setLeadData] = useState<LeadResponse | null>(null);
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [noteSubmitting, setNoteSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);

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
        fileInput.addEventListener('change', (event: any) => {
            const files = event.target.files;
            if (files && files[0]) {
                setAttachments(prev => [...prev, files[0]]);
            }
        });
        fileInput.click();
    };

    const module = 'Leads'
    const crntPage = 'Lead Details'
    const backBtn = 'Back To Leads'
    
    return (
        <Box sx={{ mt: '60px' }}>
            <div>
                <CustomAppBar backbtnHandle={backbtnHandle} module={module} backBtn={backBtn} crntPage={crntPage} editHandle={editHandle} />
                
                <Box sx={{ mt: '40px', p: '80px 40px' }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" component="h1">
                            {leadData?.lead_obj?.contact?.first_name } {leadData?.lead_obj?.contact?.last_name || 'Doe'} Lead
                        </Typography>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                       
                                        <Typography variant="body1">{leadData?.lead_obj?.status || 'Qualified'}</Typography>
                                    </Box>
                                    
                                </Box>
                                <Box sx={{ display: 'flex', mb: 2 }}>{leadData?.lead_obj?.contact?.primary_email } </Box>
                        <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                sx={{ borderRadius: '4px' }}
                                startIcon={<FaPaperclip />}
                            >
                                Convert
                            </Button>
                            
                            <Button 
                                variant="outlined"
                                sx={{ borderRadius: '4px' }}
                                onClick={editHandle}
                            >
                                Edit Lead
                            </Button>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ flex: 2 }}>
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
                                        <Typography variant="body1">PDF</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            
                            {/* Description section */}
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: 'white', mb: 3 }}>
                                <Typography variant="body1">
                                    {leadData?.lead_obj?.description || 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                            {/* Right column - Activities and Notes */}
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: 'white' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Activities and Notes</Typography>
                                
                                <Box sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                                    <Typography variant="body1">
                                        {leadData?.lead_obj?.notes || 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'}
                                    </Typography>
                                </Box>
                                
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={<FaPlus />}
                                    sx={{ mb: 2 }}
                                    onClick={handleAttachmentClick}
                                >
                                    Add Note
                                </Button>
                                
                                {/* Activity items */}
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <Avatar sx={{ mr: 1, width: 32, height: 32 }} src={leadData?.lead_obj?.created_by?.profile_pic} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">John Doe</Typography>
                                            <Typography variant="body2" color="text.secondary">Comment</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                            Jul 2, 2025, 12:19 AM
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            borderRadius: '50%', 
                                            bgcolor: '#f0f0f0', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            mr: 1
                                        }}>
                                            <FaPaperclip size={14} color="#666" />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2">Action</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                John Doe Lead status changed into <b>Qualified</b>
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                            Jul 2, 2025, 12:19 AM
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </div>
        </Box>
    )
}

export default LeadDetails;
