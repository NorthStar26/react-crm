import React, { useEffect, useState, useRef } from 'react'
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
    Pagination,
    Select,
    MenuItem
} from '@mui/material'
// AG Grid imports
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ICellRendererParams, ColDef } from 'ag-grid-community';
import { SelectChangeEvent } from '@mui/material/Select';
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

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Custom cell renderers for opportunities
const OpportunityNameCellRenderer = (props: ICellRendererParams) => {
    const navigate = useNavigate();
    
    const handleClick = () => {
        // Navigate to opportunity details page if available
        // navigate(`/app/opportunities/${props.data.id}`);
        console.log('Navigate to opportunity details:', props.data.id);
    };

    return (
        <span
            onClick={handleClick}
            style={{
                cursor: 'pointer',
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
            {props.data.name || 'Unnamed Opportunity'}
        </span>
    );
};

const RevenueCellRenderer = (props: ICellRendererParams) => {
    const amount = props.data.amount || '0';
    return (
        <span style={{ color: '#6B7280' }}>
            $ {parseFloat(amount).toLocaleString()}
        </span>
    );
};

const ContactCellRenderer = (props: ICellRendererParams) => {
    const contact = props.data.contact;
    const displayName = contact?.first_name ? 
        `${contact.first_name} ${contact.last_name}` : 
        'John Doe';
    
    return (
        <span style={{ color: '#6B7280' }}>
            {displayName}
        </span>
    );
};

const AssignedToCellRenderer = (props: ICellRendererParams) => {
    const assignedTo = props.data.assigned_to;
    const displayText = assignedTo?.length > 0 ? 
        assignedTo.map((user: any) => user.user_details?.email).join(', ') : 
        'John Doe User';
    
    return (
        <span style={{ color: '#6B7280' }}>
            {displayText}
        </span>
    );
};

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

    // AG Grid references and setup
    const gridRef = useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<any>(null);

    // AG Grid column definitions for opportunities
    const columnDefs: ColDef[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            suppressSizeToFit: true,
            width: 50,
            maxWidth: 50,
            sortable: false,
            filter: false,
        },
        {
            field: 'name',
            headerName: 'Opportunity',
            cellRenderer: OpportunityNameCellRenderer,
            minWidth: 180,
            flex: 2, // Give more space to opportunity name
            sortable: true,
        },
        {
            field: 'contact',
            headerName: 'Contact',
            cellRenderer: ContactCellRenderer,
            minWidth: 140,
            flex: 1,
            sortable: true,
        },
        {
            field: 'amount',
            headerName: 'Revenue',
            cellRenderer: RevenueCellRenderer,
            minWidth: 100,
            flex: 1,
            sortable: true,
        },
        {
            field: 'expected_close_date',
            headerName: 'Close Date',
            minWidth: 120,
            flex: 1,
            valueFormatter: (params) => {
                if (params.value) {
                    return formatDate(params.value);
                }
                return params.data.created_on_arrow || 'March 12, 2023';
            },
            sortable: true,
        },
        {
            field: 'assigned_to',
            headerName: 'Assigned To',
            cellRenderer: AssignedToCellRenderer,
            minWidth: 140,
            flex: 1,
            sortable: true,
        },
    ];

    const defaultColDef = {
        resizable: true,
        sortable: true,
        wrapText: true,
        autoHeight: true,
        unSortIcon: true,
        suppressSizeToFit: false, // Allow columns to fit container
        flex: 1, // Default flex for equal distribution
        cellStyle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingRight: '8px',
            paddingLeft: '8px',
        },
    };

    // AG Grid theme variables
    const gridTheme = {
        '--ag-header-background-color': '#582e39ff',
        '--ag-header-foreground-color': '#FFFFFF',
        '--ag-header-border-color': 'transparent',
        '--ag-odd-row-background-color': '#FFFFFF',
        '--ag-even-row-background-color': '#F3F8FF',
        '--ag-row-border-color': '#E0E0E0',
        '--ag-cell-horizontal-padding': '4px',
        '--ag-header-cell-padding': '4px',
    } as React.CSSProperties;

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

            <Box  sx={{ mt: '120px', py: 3 ,px:2}}>
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
                                            <Box sx={{ display: 'flex',maxWidth: '40%',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                    px: 2, }}>
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
                                        <Box sx={{display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                      px: 2, }}>
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
                                        <Box sx={{ display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                      px: 2, }}>
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
                                        <Box sx={{ display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    height: '40px',
                                                    borderRadius: '4px',
                                                    bgcolor: '#F9FAFB',
                                                      px: 2, }}>
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
                            <Box sx={{  }}>
                                

                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <Typography>Loading opportunities...</Typography>
                                    </Box>
                                ) : (
                                    <>
                                        {/* AG Grid */}
                                        <Box
                                            className="ag-theme-alpine"
                                            style={{
                                                ...gridTheme,
                                                width: '100%',
                                                // Dynamic height based on row count + header
                                                height: `${40 + (Math.max(1, opportunities.length > 0 ? opportunities.length : 10) * 56)}px`,
                                                minHeight: '200px',
                                                maxHeight: '600px',
                                            }}
                                            sx={{
                                                '& .ag-root-wrapper': {
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    width: '100%',
                                                },
                                                '& .ag-header': {
                                                    backgroundColor: '#582e39ff',
                                                    borderTopLeftRadius: '8px',
                                                    borderTopRightRadius: '8px',
                                                },
                                                '& .ag-cell': {
                                                    paddingLeft: '8px',
                                                    paddingRight: '8px',
                                                },
                                                '& .ag-header-cell': {
                                                    paddingLeft: '8px',
                                                    paddingRight: '8px',
                                                },
                                                '& .ag-pinned-right-cols-viewport .ag-cell': {
                                                    paddingRight: '8px',
                                                },
                                                // Ensure table takes full width
                                                width: '100%',
                                                '& .ag-center-cols-viewport': {
                                                    width: '100% !important',
                                                },
                                                '& .ag-center-cols-container': {
                                                    width: '100% !important',
                                                },
                                            }}
                                        >
                                            <AgGridReact
                                                ref={gridRef}
                                                rowData={opportunities.length > 0 ? opportunities : [
                                                    // Sample data when no opportunities exist
                                                    { id: '1', name: 'Opportunity Name', contact: { first_name: 'John', last_name: 'Doe' }, amount: '1000', expected_close_date: null, created_on_arrow: 'March 12, 2023', assigned_to: [{ user_details: { email: 'john.doe@example.com' } }] },
                                                    ...Array.from({ length: 9 }, (_, index) => ({
                                                        id: `${index + 2}`,
                                                        name: 'Crm Test',
                                                        contact: { first_name: 'John', last_name: 'Doe' },
                                                        amount: '10000',
                                                        expected_close_date: null,
                                                        created_on_arrow: index % 3 === 0 ? 'June 27, 2022' : 
                                                                         index % 3 === 1 ? 'January 8, 2024' : 
                                                                         index % 3 === 2 ? 'October 5, 2021' : 'February 19, 2023',
                                                        assigned_to: index < 5 ? [{ user_details: { email: 'john.doe.user@example.com' } }] : [{ user_details: { email: 'john.doe@example.com' } }]
                                                    }))
                                                ]}
                                                columnDefs={columnDefs}
                                                defaultColDef={defaultColDef}
                                                suppressRowClickSelection
                                                suppressCellFocus
                                                rowHeight={56}
                                                headerHeight={40}
                                                onGridReady={(params) => {
                                                    setGridApi(params.api);
                                                    params.api.sizeColumnsToFit();
                                                    // Force column resizing after a short delay
                                                    setTimeout(() => {
                                                        params.api.sizeColumnsToFit();
                                                    }, 100);
                                                }}
                                                onFirstDataRendered={(params) => {
                                                    params.api.sizeColumnsToFit();
                                                }}
                                                getRowId={(params) => params.data.id || params.data.name}
                                                animateRows={true}
                                                suppressNoRowsOverlay={false}
                                                rowClassRules={{
                                                    even: (params) =>
                                                        params.node &&
                                                        params.node.rowIndex != null &&
                                                        params.node.rowIndex % 2 === 1,
                                                }}
                                            />
                                        </Box>

                                        {/* Pagination Footer */}
                                        <Box
                                            sx={{
                                                mt: 2,
                                                p: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            {/* Rows per page */}
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>Rows&nbsp;per&nbsp;page:</Typography>
                                                <Select
                                                    size="small"
                                                    value={rowsPerPage}
                                                    onChange={(e: SelectChangeEvent<number>) => setRowsPerPage(Number(e.target.value))}
                                                    sx={{ height: 32 }}
                                                >
                                                    {[10, 25, 50].map((n) => (
                                                        <MenuItem key={n} value={n}>
                                                            {n}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <Typography sx={{ ml: 1, fontSize: '14px', color: '#6B7280' }}>
                                                    of {opportunities.length > 0 ? opportunities.length : 10} rows
                                                </Typography>
                                            </Stack>
                                            
                                            {/* Page Navigation */}
                                            <Pagination
                                                page={currentPage}
                                                count={opportunities.length > 0 ? Math.ceil(opportunities.length / rowsPerPage) : Math.ceil(10 / rowsPerPage)}
                                                onChange={(event, value) => setCurrentPage(value)}
                                                variant="outlined"
                                                shape="rounded"
                                                size="small"
                                                showFirstButton
                                                showLastButton
                                                sx={{
                                                    '& .MuiPaginationItem-root': {
                                                        borderRadius: '50%',
                                                        width: 36,
                                                        height: 36,
                                                        border: '1px solid #CED4DA',
                                                    },
                                                    '& .MuiPaginationItem-root:not(.Mui-selected):hover': {
                                                        backgroundColor: '#F0F7FF',
                                                    },
                                                    '& .MuiPaginationItem-root.Mui-selected': {
                                                        backgroundColor: '#1E3A5F',
                                                        color: '#fff',
                                                        border: '1px solid #284871',
                                                    },
                                                    '& .MuiPaginationItem-root.Mui-selected:hover': {
                                                        backgroundColor: '#1E3A5F',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </ContactDetailCard>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}
