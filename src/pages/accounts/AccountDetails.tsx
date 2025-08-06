import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    Card,
    Link,
    Avatar,
    Box,
    Snackbar,
    Alert,
    Stack,
    Button,
    Chip,
    Typography,
    Grid,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination
} from '@mui/material'
import {
    FaPlus,
    FaStar,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaBriefcase,
    FaEdit,
    FaGlobe,
    FaUsers,
    FaIndustry,
    FaMapMarkerAlt
} from 'react-icons/fa'

import { fetchData } from '../../components/FetchData'
import { AccountsUrl } from '../../services/ApiUrls'
import { Tags } from '../../components/Tags'
import { CustomAppBar } from '../../components/CustomAppBar'
import FormateTime from '../../components/FormateTime'
import { Label } from '../../components/Label'
import { ContactDetailCard } from '../../styles/CssStyled'
import { EditButton } from '../../components/Button'
import { useUser } from '../../context/UserContext'

export const formatDate = (dateString: any) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
}
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
    billing_address_line: string;
    billing_city: string;
    billing_country: string;
    billing_state: string;
    billing_postcode: string;
    billing_street: string;
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
    contacts: string;
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

    close_date: string;
    organization: string;
    created_from_site: boolean;
    id: string;
    teams: [];
    leads: string;

};
export const AccountDetails = (props: any) => {
    
    const navigate = useNavigate()
    const { accountId } = useParams<{ accountId: string }>()
    const { user } = useUser()

    const [accountDetails, setAccountDetails] = useState<response | null>(null)
    const [companyInfo, setCompanyInfo] = useState<any>(null)
    const [companyLogoUrl, setCompanyLogoUrl] = useState<string>('')
    const [opportunities, setOpportunities] = useState<any[]>([])
    const [accountSummary, setAccountSummary] = useState<any>(null)
    const [usersDetails, setUsersDetails] = useState<Array<{
        user_details: {
            email: string;
            id: string;
            profile_pic: string;
        }
    }>>([]);
    const [selectedCountry, setSelectedCountry] = useState([])
    const [attachments, setAttachments] = useState([])
    const [tags, setTags] = useState([])
    const [countries, setCountries] = useState<string[][]>([])
    const [source, setSource] = useState([])
    const [status, setStatus] = useState([])
    const [industries, setIndustries] = useState([])
    const [contacts, setContacts] = useState([])
    const [users, setUsers] = useState([])
    const [teams, setTeams] = useState([])
    const [leads, setLeads] = useState([])
    const [comments, setComments] = useState([])
    const [commentList, setCommentList] = useState('Recent Last')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    useEffect(() => {
        // Use accountId from URL params, fallback to state if needed
        if (accountId) {
            getAccountDetails(accountId)
        } else {
            console.error('No account ID found in URL or state')
            // Navigate back to accounts list if no ID is available
            navigate('/app/accounts')
        }
    }, [accountId, navigate])

    const getAccountDetails = (id: string) => {
        // Check if required auth data exists
        const token = localStorage.getItem('Token')
        const org = localStorage.getItem('org')
        
        if (!token || !org) {
            console.error('Missing authentication data')
            setError('Missing authentication data')
            setLoading(false)
            return
        }

        const Header = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token,
            'org': org
        }
        
        fetchData(`${AccountsUrl}/${id}/`, 'GET', null as any, Header)
            .then((res) => {
                console.log(res, 'account details response');
                if (!res.error) {
                    setAccountDetails(res?.account_obj)
                    setCompanyInfo(res?.company_info)
                    setCompanyLogoUrl(res?.company_logo_url)
                    setOpportunities(res?.opportunity_list || [])
                    setAccountSummary(res?.account_summary)
                    setContacts(res?.contacts)
                    setIndustries(res?.industries)
                    setUsers(res?.users)
                    setStatus(res?.status)
                    setCountries(res?.countries)
                    setLeads(res?.leads)
                    setTags(res?.tags)
                    setTeams(res?.teams)
                    
                    // Set assigned users details
                    if (res?.account_obj?.assigned_to && res?.users) {
                        const assignedUsers = res.users.filter((user: any) => 
                            res.account_obj.assigned_to.includes(user.id)
                        )
                        setUsersDetails(assignedUsers)
                    }
                } else {
                    console.error('API returned error:', res.error)
                    setError(res.error || 'Failed to fetch account details')
                }
            })
            .catch((err) => {
                console.error('Error fetching account details:', err)
                setError('Failed to fetch account details')
            })
            .finally(() => {
                setLoading(false)
            })
    }
    const accountCountry = (country: string) => {
        let countryName: string[] | undefined;
        for (countryName of countries) {
            if (Array.isArray(countryName) && countryName.includes(country)) {
                const ele = countryName;
                break;
            }
        }
        return countryName?.[1]
    }
    const editHandle = () => {
        // navigate('/contacts/edit-contacts', { state: { value: contactDetails, address: newAddress } })
        let country: string[] | undefined;
        for (country of countries) {
            if (Array.isArray(country) && country.includes(accountDetails?.country || '')) {
                const firstElement = country[0];
                break;
            }
        }
        
        // Use accountId from URL params, fallback to state if needed
        const idToUse = accountId 
        
        navigate('/app/accounts/edit-account', {
            state: {
                value: {
                    name: accountDetails?.name,
                    phone: accountDetails?.phone,
                    email: accountDetails?.email,
                    billing_address_line: accountDetails?.billing_address_line,
                    billing_street: accountDetails?.billing_street,
                    billing_city: accountDetails?.billing_city,
                    billing_state: accountDetails?.billing_state,
                    billing_postcode: accountDetails?.billing_postcode,
                    billing_country: accountDetails?.billing_country,
                    contact_name: accountDetails?.contact_name,
                    teams: accountDetails?.teams || [],
                    assigned_to: accountDetails?.assigned_to || [],
                    tags: accountDetails?.tags || [],
                    account_attachment: accountDetails?.account_attachment || null,
                    website: accountDetails?.website,
                    status: accountDetails?.status,
                    lead: accountDetails?.lead?.account_name,
                    // contacts: accountDetails?.contacts
                }, id: idToUse,
                contacts: contacts || [], 
                status: status || [], 
                tags: tags || [], 
                users: users || [], 
                countries: countries || [], 
                teams: teams || [], 
                leads: leads || []
            }
        }
        )
    }

    const backbtnHandle = () => {
        navigate('/app/accounts')
    }

    const module = 'Accounts'
    const crntPage = accountDetails?.name || 'Account Details'
    const backBtn = 'Back To Accounts'

    if (loading) {
        return (
            <Box sx={{ mt: '120px', display: 'flex', justifyContent: 'center' }}>
                <Typography>Loading account details...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: '120px', display: 'flex', justifyContent: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const fullAddress = [
        accountDetails?.billing_address_line,
        accountDetails?.billing_street,
        accountDetails?.billing_city,
        accountDetails?.billing_state,
        accountDetails?.billing_postcode,
        accountCountry(accountDetails?.billing_country || '')
    ].filter(Boolean).join(', ')

    return (
        <Box sx={{ mt: '60px', backgroundColor: '#FAFAFB', minHeight: '100vh' }}>
            {/* Header */}
            <CustomAppBar 
                module={module} 
                crntPage={crntPage} 
                backBtn={backBtn}
                backbtnHandle={backbtnHandle}
                editHandle={editHandle}
                variant="view" 
            />

            <Container maxWidth="xl" sx={{ mt: '120px', py: 3 }}>
                <Grid container spacing={2}>
                    {/* Company Header Card */}
                    <Grid item xs={12}>
                        <ContactDetailCard
                            sx={{
                                mb: 2,
                                boxShadow: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
                            }}
                        >
                            <Box sx={{ p: 3 ,display:'flex'}}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                        src={companyLogoUrl || companyInfo?.logo_url}
                                        sx={{
                                            width: 140,
                                            height: 140,
                                            mr: 3,
                                            backgroundColor: '#000',
                                            '& svg': {
                                                fontSize: '40px',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        {!companyLogoUrl && !companyInfo?.logo_url && <FaBuilding />}
                                    </Avatar>
                            </Box>
                                
                                <Box sx={{ display: 'flex',flexDirection:'column', mb: 3 }}>
                                    {/* Company Logo/Avatar */}
                                    
                                    
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#101828',
                                                mb: 1,
                                            }}
                                        >
                                            {accountDetails?.name || companyInfo?.name }
                                        </Typography>
                                        
                                        {/* Website Link */}
                                        {(accountDetails?.website || companyInfo?.website) && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <FaGlobe style={{ fontSize: '14px', color: '#6B7280', marginRight: '8px' }} />
                                                <Typography
                                                    component="a"
                                                    href={
                                                        (accountDetails?.website || companyInfo?.website)?.startsWith('http') 
                                                            ? (accountDetails?.website || companyInfo?.website)
                                                            : `https://${accountDetails?.website || companyInfo?.website}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        fontSize: '14px',
                                                        color: '#1976d2',
                                                        textDecoration: 'none',
                                                        '&:hover': {
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                >
                                                    {accountDetails?.website || companyInfo?.website}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                                    {/* Email */}
                                    {(accountDetails?.email || companyInfo?.email) && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '200px' }}>
                                            <FaEnvelope style={{ fontSize: '16px', color: '#6B7280', marginRight: '8px', flexShrink: 0 }} />
                                            <Typography
                                                component="a"
                                                href={`mailto:${accountDetails?.email || companyInfo?.email}`}
                                                sx={{
                                                    fontSize: '14px',
                                                    color: '#1976d2',
                                                    textDecoration: 'none',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {accountDetails?.email || companyInfo?.email}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Phone */}
                                    {(accountDetails?.phone || companyInfo?.phone) && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '150px' }}>
                                            <FaPhone style={{ fontSize: '16px', color: '#6B7280', marginRight: '8px', flexShrink: 0 }} />
                                            <Typography sx={{ 
                                                fontSize: '14px', 
                                                color: '#101828',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {accountDetails?.phone || companyInfo?.phone}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Industry */}
                                    {(accountDetails?.industry || companyInfo?.industry) && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '150px' }}>
                                            <FaIndustry style={{ fontSize: '16px', color: '#6B7280', marginRight: '8px', flexShrink: 0 }} />
                                            <Typography sx={{ 
                                                fontSize: '14px', 
                                                color: '#101828',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {accountDetails?.industry || companyInfo?.industry}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                    
                                </Box>

                                {/* Contact Info Icons Row */}
                                
                            </Box>
                        </ContactDetailCard>
                    </Grid>

                    {/* Address Card */}
                    <Grid item xs={12}>
                        <ContactDetailCard
                            sx={{
                                mb: 2,
                                boxShadow: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#101828',
                                        mb: 3,
                                    }}
                                >
                                    Address
                                </Typography>
                                
                                {/* Address Grid Layout */}
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    {/* House */}
                                    <Grid item xs={12} md={3}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Roboto',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: '#6B7280',
                                                }}
                                            >
                                                House
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                    pl: 2,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Roboto',
                                                        fontSize: '15px',
                                                        fontWeight: 500,
                                                        color: '#1A3353',
                                                    }}
                                                >
                                                    {accountDetails?.billing_address_line || companyInfo?.billing_address_number || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Street */}
                                    <Grid item xs={12} md={3}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Roboto',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: '#6B7280',
                                                }}
                                            >
                                                Street
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                    pl: 2,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Roboto',
                                                        fontSize: '15px',
                                                        fontWeight: 500,
                                                        color: '#1A3353',
                                                    }}
                                                >
                                                    {accountDetails?.billing_street || companyInfo?.billing_street || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* City */}
                                    <Grid item xs={12} md={3}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Roboto',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: '#6B7280',
                                                }}
                                            >
                                                City
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                    pl: 2,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Roboto',
                                                        fontSize: '15px',
                                                        fontWeight: 500,
                                                        color: '#1A3353',
                                                    }}
                                                >
                                                    {accountDetails?.billing_city || companyInfo?.billing_city || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* State */}
                                    <Grid item xs={12} md={3}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Roboto',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: '#6B7280',
                                                }}
                                            >
                                                State
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                    pl: 2,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Roboto',
                                                        fontSize: '15px',
                                                        fontWeight: 500,
                                                        color: '#1A3353',
                                                    }}
                                                >
                                                    {accountDetails?.billing_state || companyInfo?.billing_state || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Country and Zip Row */}
                                <Grid container spacing={3}>
                                    {/* Country */}
                                    <Grid item xs={12} md={3}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Roboto',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: '#6B7280',
                                                }}
                                            >
                                                Country
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                    pl: 2,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Roboto',
                                                        fontSize: '15px',
                                                        fontWeight: 500,
                                                        color: '#1A3353',
                                                    }}
                                                >
                                                    {accountCountry(accountDetails?.billing_country || companyInfo?.billing_country || '') || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Zip */}
                                    <Grid item xs={12} md={3}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Roboto',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: '#6B7280',
                                                }}
                                            >
                                                Zip Code
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                    pl: 2,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Roboto',
                                                        fontSize: '15px',
                                                        fontWeight: 500,
                                                        color: '#1A3353',
                                                    }}
                                                >
                                                    {accountDetails?.billing_postcode || companyInfo?.billing_postcode || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </ContactDetailCard>
                    </Grid>

                    {/* Opportunities Card */}
                    <Grid item xs={12}>
                        <ContactDetailCard
                            sx={{
                                mb: 2,
                                boxShadow: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                
                                
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "#2e4258" }}>
                                                <TableCell sx={{ fontWeight: 600, color: '#F9FAFB' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <input type="checkbox" style={{ marginRight: '8px' }} />
                                                        Opportunity
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#F9FAFB' }}>Contact</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#F9FAFB' }}>Revenue</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#F9FAFB' }}>Close Date</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#F9FAFB' }}>Assigned To</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {opportunities.length > 0 ? (
                                                opportunities.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((opportunity: any, index: number) => (
                                                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <input type="checkbox" style={{ marginRight: '8px' }} />
                                                                {opportunity.name}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>
                                                            {opportunity.contact?.first_name ? 
                                                                `${opportunity.contact.first_name} ${opportunity.contact.last_name}` : 
                                                                'John Doe'}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>
                                                            $ {parseFloat(opportunity.amount || '0').toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>
                                                            {opportunity.expected_close_date ? 
                                                                formatDate(opportunity.expected_close_date) : 
                                                                opportunity.created_on_arrow || 'March 12, 2023'}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>
                                                            {opportunity.assigned_to?.length > 0 ? 
                                                                opportunity.assigned_to.map((user: any) => user.user_details?.email).join(', ') : 
                                                                'John Doe User'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <>
                                                    <TableRow sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <input type="checkbox" style={{ marginRight: '8px' }} />
                                                                Opportunity Name
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>John Doe</TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>$ 1,000</TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>March 12, 2023</TableCell>
                                                        <TableCell sx={{ color: '#6B7280' }}>John Doe User</TableCell>
                                                    </TableRow>
                                                    {Array.from({ length: 9 }).map((_, index) => (
                                                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <input type="checkbox" style={{ marginRight: '8px' }} />
                                                                    Crm Test
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#6B7280' }}>John Doe</TableCell>
                                                            <TableCell sx={{ color: '#6B7280' }}>$ 10,000</TableCell>
                                                            <TableCell sx={{ color: '#6B7280' }}>
                                                                {index % 3 === 0 ? 'June 27, 2022' : 
                                                                 index % 3 === 1 ? 'January 8, 2024' : 
                                                                 index % 3 === 2 ? 'October 5, 2021' : 'February 19, 2023'}
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#6B7280' }}>
                                                                {index < 5 ? 'John Doe User' : 'John Doe'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                                            Rows per page
                                        </Typography>
                                        <select 
                                            value={rowsPerPage} 
                                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                            style={{ 
                                                padding: '4px 8px', 
                                                border: '1px solid #D1D5DB', 
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                        <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                                            of {opportunities.length > 0 ? opportunities.length : 140} rows
                                        </Typography>
                                    </Box>
                                    
                                    <Pagination
                                        count={opportunities.length > 0 ? Math.ceil(opportunities.length / rowsPerPage) : 14}
                                        page={currentPage}
                                        onChange={(event, value) => setCurrentPage(value)}
                                        size="small"
                                        showFirstButton
                                        showLastButton
                                    />
                                </Box>
                            </Box>
                        </ContactDetailCard>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}
