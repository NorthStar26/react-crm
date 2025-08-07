import React, { useEffect, useState } from 'react';
import ApartmentIcon from '@mui/icons-material/Apartment';  
import PersonIcon from '@mui/icons-material/Person';        
import { AgGridReact } from 'ag-grid-react';import { FaDownload, FaFileExport } from 'react-icons/fa';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { API_URL } from '../../services/ApiUrls';


ModuleRegistry.registerModules([ClientSideRowModelModule]);

import {
  FiSearch,
  FiUpload,
} from 'react-icons/fi';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  TableSortLabel,
  Stack,
  InputAdornment,
  Toolbar,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CasesUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { Spinner } from '../../components/Spinner';
import { DeleteModal } from '../../components/DeleteModal';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';


function getDisplayedPages(current: number, total: number): (number | string)[] {
  const delta = 1;
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
}

interface OpportunityData {
  id: string;
  name: string;
  stage: string;
  amount: number;
  expected_revenue?: number;
  lead?: {
    id: string;
    contact?: {
      id: string;
      name: string;
    };
    company?: {
      id: string;
      name: string;
      industry: string;
    };
  };
}

interface Case {
  id: string;
  name: string;
  priority: string;
  opportunity_name: string;
  opportunity_data: OpportunityData;
  expected_revenue?: number;
  created_by: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  closed_on: string;
  case_type: string;
  status: boolean;
  contacts: any[];
  assigned_to: any[];
  teams: any[];
}

const headCells = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Case Name' },
  { id: 'opportunity_data.lead.company.industry', numeric: false, disablePadding: false, label: 'Industry' },
  { id: 'opportunity_data.lead.contact', numeric: false, disablePadding: false, label: 'Contact' },
  { id: 'opportunity_data.expected_revenue', numeric: false, disablePadding: false, label: 'Result' },
  { id: 'closed_on', numeric: false, disablePadding: false, label: 'Close Date' },
  { id: 'created_by', numeric: false, disablePadding: false, label: 'Assigned To' },
];

export default function CasesListPage() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [contactNameFilter, setContactNameFilter] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [deleteRowModal, setDeleteRowModal] = useState(false);

 
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const columnDefs = [
    {
      headerName: 'Case Name',
      field: 'name' as keyof Case,
      flex: 2,
      sortable: true,
      filter: false,
      cellClass: 'first-column-cell',
    },
    {
      headerName: 'Industry',
      field: undefined,
      flex: 1.5,
      sortable: true,
      filter: false,
      valueGetter: (params: any) =>
        params.data?.opportunity_data?.lead?.company?.industry || '—',
    },
    {
      headerName: 'Contact',
      field: undefined,
      flex: 1.5,
      sortable: true,
      filter: false,
      valueGetter: (params: any) =>
        params.data?.opportunity_data?.lead?.contact?.name || '—',
    },
    {
      headerName: 'Result',
      field: 'expected_revenue' as keyof Case,
      flex: 1.5,
      sortable: true,
      filter: false,
      valueGetter: (params: any) =>
        params.data?.expected_revenue
          ? `$${Number(params.data.expected_revenue).toLocaleString()}`
          : '—',
    },
    {
      headerName: 'Close Date',
      field: 'closed_on' as keyof Case,
      flex: 1.5,
      sortable: true,
      filter: false,
    },
    {
      headerName: 'Assigned To',
      field: undefined,
      flex: 2,
      sortable: true,
      filter: false,
      valueGetter: (params: any) => {
        const assignedTo = params.data?.assigned_to;
        if (assignedTo && assignedTo.length > 0) {
          const user = assignedTo[0].user_details;
          return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
        }
        return '—';
      },
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    wrapText: true,
    autoHeight: true,
    unSortIcon: true,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingLeft: '8px',
    },
  };

  const gridTheme = {
    '--ag-header-background-color': '#2E4258',
    '--ag-header-foreground-color': '#FFFFFF',
    '--ag-header-border-color': 'transparent',
    '--ag-odd-row-background-color': '#FFFFFF',
    '--ag-even-row-background-color': '#F3F8FF',
    '--ag-row-border-color': '#E0E0E0',
  } as React.CSSProperties;





  useEffect(() => {
    getCases();
  }, [currentPage, recordsPerPage, searchTerm, industryFilter, contactNameFilter, order, orderBy]);

  const getCases = async () => {
    setLoading(true);
    const offset = (currentPage - 1) * recordsPerPage;
    const searchParam = searchTerm ? `&search=${searchTerm}` : '';
    const industryParam = industryFilter ? `&industry=${industryFilter}` : '';
    const contactParam = contactNameFilter ? `&contact_id=${encodeURIComponent(contactNameFilter)}` : '';
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    try {
      const res = await fetchData(
        `${CasesUrl}/?offset=${offset}&limit=${recordsPerPage}&ordering=${order === 'asc' ? '' : '-'}${orderBy}${searchParam}${industryParam}${contactParam}`,
        'GET',
        undefined,
        Header
      );

      if (!res.error) {
        setCases(res?.results || []);
        setTotalCount(res?.count || 0);
        setTotalPages(Math.ceil(res?.count / recordsPerPage));

        const industrySet = new Set<string>();
        const contactMap = new Map<string, { id: string; name: string }>();

        res?.results?.forEach((caseItem: Case) => {
          const industry = caseItem?.opportunity_data?.lead?.company?.industry;
          if (industry) industrySet.add(industry);

          const contact = caseItem?.opportunity_data?.lead?.contact;
          if (contact && !contactMap.has(contact.id)) {
            contactMap.set(contact.id, { id: contact.id, name: contact.name });
          }
        });

        setIndustries(Array.from(industrySet));
        setContacts(Array.from(contactMap.values()));
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDelete = (id: string) => {
    setSelectedCaseIds([id]);
    setDeleteRowModal(true);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedCaseIds([]);
  };

  const deleteItem = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    await fetchData(`${CasesUrl}/${selectedCaseIds[0]}/`, 'DELETE', undefined, Header);
    getCases();
    deleteRowModalClose();
  };

  const handleRowClick = (event: any) => {
    const caseId = event.data.id;
    navigate('/app/cases/case-details', {
      state: { 
        caseId: caseId,
        contacts: contacts,
        priority: [], // You can populate these if available
        typeOfCases: [],
        account: [],
        status: []
      }
    });
  };

const handleExport = async () => {
  try {
    const exportUrl = `${API_URL}/${CasesUrl}/?export=true`;
    console.log('Exporting from:', exportUrl);

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
        'Authorization': `Bearer ${localStorage.getItem('Token')}`,
        'org': localStorage.getItem('org') || '',
      },
      credentials: 'include' // Important for cookies/session
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Export failed: ${response.status} - ${error}`);
    }

    // Create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cases_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    let errorMessage = 'Failed to export cases';
    
    // Type checking the error
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('Export error:', error);
    alert(errorMessage);
  }
};

  const responsiveHeadCells = isSmallScreen 
    ? headCells.filter(cell => ['name', 'opportunity_data.lead.contact', 'closed_on'].includes(cell.id))
    : headCells;

    const paginationBtnStyle = {
      minWidth: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#fff',
      color: '#1a3353',
      border: '1px solid #cbd5e1',
      '&:hover': {
        backgroundColor: '#f1f5f9',
      },
    };


  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', mt: '34px' }}>
      <Container maxWidth={false} disableGutters sx={{ mt: 3, width: '100%' }}>
        {/* Dark Toolbar background (full width) */}
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#1a3353',
            borderRadius: '8px 8px 0 0',
            py: 0,
          }}
        >
          {/* Inner toolbar content aligned with table */}
          <Box sx={{ px: 2 }}>
            <Toolbar
              disableGutters
              sx={{
                display: 'flex',
                flexDirection: isExtraSmallScreen ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: isExtraSmallScreen ? 2 : 0,
                width: '100%',
              }}
            >
              {/* Filters */}
              <Stack
                direction={isExtraSmallScreen ? 'column' : 'row'}
                spacing={isExtraSmallScreen ? 2 : 6}
                alignItems="center"
                flexWrap="wrap"
                width={isExtraSmallScreen ? '100%' : 'auto'}
              >
                <TextField
                  size="small"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch style={{ color: '#757575' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    minWidth: isSmallScreen ? '100%' : '300px',
                    '& .MuiInputBase-root': { height: '48px' },
                  }}
                />

                <Select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    minWidth: isSmallScreen ? '100%' : '150px',
                    height: '48px',
                    borderRadius: '6px',
                    '& .MuiSelect-select': { padding: '6px 12px' },
                    '& fieldset': { borderColor: '#c4c4c4' },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <ApartmentIcon fontSize="small" sx={{ color: '#757575', mr: 1 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <Typography sx={{ color: '#757575' }}>Industry</Typography>
                  </MenuItem>
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>

                {!isSmallScreen && (
                  <Select
                    value={contactNameFilter}
                    onChange={(e) => setContactNameFilter(e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{
                      backgroundColor: 'white',
                      minWidth: '150px',
                      height: '48px',
                      borderRadius: '6px',
                      '& .MuiSelect-select': { padding: '6px 12px' },
                      '& fieldset': { borderColor: '#c4c4c4' },
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" sx={{ color: '#757575', mr: 1 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <Typography sx={{ color: '#757575' }}>Contact</Typography>
                    </MenuItem>
                    {contacts.map((contact) => (
                      <MenuItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Stack>

              <Button
                variant="contained"
                 startIcon={<FaFileExport />}
                onClick={handleExport}
                sx={{
              background: '#2B5075',
              boxShadow:
                '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px rgba(0,0,0,0.14), 0px 1px 5px rgba(0,0,0,0.12)',
              borderRadius: '4px',
              textTransform: 'none',
              border: 'none',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#fff !important',
                color: '#284871 !important',
                border: '1px solid #284871 !important',
              },
            }}
              >
                Export
              </Button>
            </Toolbar>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ px: 2 }}>
          <Paper
            sx={{
              mb: 2,
              mt: 2,
              overflowX: 'auto',
              boxShadow: isSmallScreen ? 'none' : theme.shadows[1],
              width: '100%',
            }}
          >
            <Box
              className="ag-theme-alpine"
              sx={{
                width: '100%',
                ...gridTheme,
                '--ag-icon-color': '#FFFFFF',
                '& .ag-root-wrapper': { border: 'none' },
                '& .ag-header': {
                  borderRadius: '8px 8px 0 0',
                  overflow: 'hidden',
                },
                '& .ag-header-cell:first-of-type': {
                  borderTopLeftRadius: '8px',
                  paddingLeft: '16px',
                },
                '& .ag-header-cell:last-of-type': {
                  borderTopRightRadius: '8px',
                },
                '& .ag-header-row': {
                  borderBottom: 'none',
                },
                '& .ag-header-cell-label .ag-icon, & .ag-header-cell-label .ag-icon-wrapper svg': {
                  fill: '#FFFFFF',
                  color: '#FFFFFF',
                },
                '& .ag-sort-ascending-icon, & .ag-sort-descending-icon, & .ag-sort-none-icon': {
                  fill: '#FFFFFF',
                  color: '#FFFFFF',
                },
                '& .ag-row': { 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5 !important',
                  }
                },
                '& .ag-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                },
                // '& .ag-header-cell': {
                //   paddingLeft: '4px',
                //   paddingRight: '4px',
                // },

                '& .first-column-cell': {
                  paddingLeft: '16px !important', // ← force it to override AG Grid inline styles
                },
                '& .first-column-cell .ag-cell-wrapper': {
                  paddingLeft: '0px !important', // ← remove AG Grid internal wrapper padding
                },

              }}
            >
              <AgGridReact
                rowData={cases}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                suppressCellFocus
                rowHeight={56}
                headerHeight={40}
                onRowClicked={handleRowClick}
                onGridReady={(params) => {
                  params.api.sizeColumnsToFit();
                }}
              />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              sx={{
                px: 2,
                py: 1.5,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f8fafc',
              }}
            >
              {/* Left Side: Rows per page */}
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2">Rows per page</Typography>
                <Select
                  size="small"
                  value={recordsPerPage}
                  onChange={(e) => {
                    setRecordsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  sx={{ fontSize: '0.85rem' }}
                >
                  {[10, 20, 50, 100].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="body2">of {totalCount} rows</Typography>
              </Box>

              {/* Right Side: Pagination controls */}
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  size="small"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  sx={paginationBtnStyle}
                >
                  &laquo;
                </Button>
                <Button
                  size="small"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  sx={paginationBtnStyle}
                >
                  &lsaquo;
                </Button>

                {getDisplayedPages(currentPage, totalPages).map((page, idx) =>
                  page === '...' ? (
                    <Box key={`ellipsis-${idx}`} sx={{ px: 1, fontSize: '0.875rem' }}>
                      ...
                    </Box>
                  ) : (
                    <Button
                      key={page}
                      size="small"
                      variant={page === currentPage ? 'contained' : 'outlined'}
                      onClick={() => setCurrentPage(typeof page === 'number' ? page : currentPage)}
                      sx={{
                        minWidth: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: page === currentPage ? '#1a3353' : '#fff',
                        color: page === currentPage ? '#fff' : '#1a3353',
                        border: '1px solid #cbd5e1',
                        boxShadow: page === currentPage ? theme.shadows[1] : 'none',
                        '&:hover': {
                          backgroundColor: page === currentPage ? '#1a3353' : '#f1f5f9',
                        },
                      }}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  size="small"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  sx={paginationBtnStyle}
                >
                  &rsaquo;
                </Button>
                <Button
                  size="small"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  sx={paginationBtnStyle}
                >
                  &raquo;
                </Button>
              </Box>
            </Box>


            
          </Paper>
        </Box>
      </Container>

      <DeleteModal
        onClose={deleteRowModalClose}
        open={deleteRowModal}
        id={selectedCaseIds[0]}
        modalDialog="Are You Sure You want to delete selected Case?"
        modalTitle="Delete Case"
        DeleteItem={deleteItem}
      />
    </Box>
  );

    

}