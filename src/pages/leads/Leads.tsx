import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,Button,
  Typography,
  Paper,
  Select,
  MenuItem,
  Container,
  Pagination,
  IconButton,
  InputBase,
  FormControl,
  Chip,
  Grid,
} from '@mui/material';
import { Spinner } from '../../components/Spinner';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FaTrashAlt, FaEdit, FaFileExport } from 'react-icons/fa';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { CustomToolbar } from '../../styles/CssStyled';
import { fetchData } from '../../components/FetchData';
import { LeadUrl } from '../../services/ApiUrls';
import { DeleteModal } from '../../components/DeleteModal';
import { useUser } from '../../context/UserContext';
import { CustomButton } from '../../components/Button';
import { SuccessAlert, ErrorAlert } from '../../components/Button/SuccessAlert';

// AG Grid imports
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ICellRendererParams } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function Leads() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState([]);
  const [source, setSource] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [deleteLeadModal, setDeleteLeadModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [sourceSelectOpen, setSourceSelectOpen] = useState(false);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  const statusList = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'disqualified', label: 'Disqualified' },
    { value: 'recycled', label: 'Recycled' },
  ];

  const sourceList = [
    { value: '', label: 'All Sources' },
    { value: 'call', label: 'Call' },
    { value: 'email', label: 'Email' },
    { value: 'existing customer', label: 'Existing Customer' },
    { value: 'partner', label: 'Partner' },
    { value: 'public relations', label: 'Public Relations' },
    { value: 'compaign', label: 'Campaign' },
    { value: 'other', label: 'Other' },
  ];

  // Effect hook to fetch leads when filters or pagination changes
  useEffect(() => {
    getLeads();
  }, [currentPage, recordsPerPage, statusFilter, sourceFilter]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getLeads();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getLeads = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    };

    try {
      const offset = (currentPage - 1) * recordsPerPage;
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: recordsPerPage.toString(),
      });

      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (sourceFilter) queryParams.append('lead_source', sourceFilter);

      const res = await fetchData(`${LeadUrl}/?${queryParams.toString()}`, 'GET', undefined, Header);

      if (!res.error) {
        const openLeads = res?.open_leads?.open_leads || [];
        setLeads(openLeads);
        setLeadsCount(res?.open_leads?.leads_count || openLeads.length);
        setTotalPages(Math.ceil((res?.open_leads?.leads_count || openLeads.length) / recordsPerPage));

        setContacts(res?.contacts || []);
        setStatus(res?.status || []);
        setSource(res?.source || []);
        setCompanies(res?.companies || []);
        setTags(res?.tags || []);
        setUsers(res?.users || []);
        setCountries(res?.countries || []);
        setIndustries(res?.industries || []);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to fetch leads');
      setLoading(false);
    }
  };

  // Get unique statuses from leads for filtering
  const getUniqueStatuses = () => {
    if (!leads || leads.length === 0) return [];

    const statuses = leads
      .map((item: any) => item?.status)
      .filter((status: string) => status && status.trim() !== '')
      .filter(
        (status: string, index: number, arr: string[]) =>
          arr.indexOf(status) === index
      );

    return statuses;
  };

  // Get unique sources from leads for filtering
  const getUniqueSources = () => {
    if (!leads || leads.length === 0) return [];

    const sources = leads
      .map((item: any) => item?.lead_source)
      .filter((source: string) => source && source.trim() !== '')
      .filter(
        (source: string, index: number, arr: string[]) =>
          arr.indexOf(source) === index
      );

    return sources;
  };

  // Navigation handlers
  const onAddHandle = () => {
    if (!loading) {
      navigate('/app/leads/add-leads', {
        state: {
          detail: false,
          contacts: contacts || [], 
          status: status || [], 
          source: source || [], 
          companies: companies || [], 
          tags: tags || [], 
          users: users || [], 
          countries: countries || [], 
          industries: industries || []
        }
      });
    }
  };

  const handleViewLead = (lead: any) => {
    navigate(`/app/leads/${lead.id}`);
  };

  const selectLeadList = (leadId: any) => {
    navigate(`/app/leads/${leadId}`);
  };

  const redirectToEditLead = (leadId: any) => {
    navigate(`/app/leads/${leadId}/edit`);
  };

  // Delete handlers
  const deleteLead = (id: any) => {
    setSelectedId(id);
    setDeleteLeadModal(true);
  };

  const deleteLeadModalClose = () => {
    setDeleteLeadModal(false);
    setSelectedId('');
  };

  const deleteItem = async () => {
    setDeleteLoading(true);
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    };

    try {
      const res = await fetchData(`${LeadUrl}/${selectedId}/`, 'DELETE', null as any, Header);

      if (!res.error) {
        setSuccessMessage('Lead deleted successfully');
        deleteLeadModalClose();
        getLeads();
      } else {
        setErrorMessage('Failed to delete lead');
      }
    } catch (error) {
      setErrorMessage('Failed to delete lead');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (_e: any, page: number) => {
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (event: any) => {
    setRecordsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  // Grid theme
  const gridTheme = {
    '--ag-header-background-color': '#1A3353',
    '--ag-header-foreground-color': '#FFFFFF',
    '--ag-header-border-color': 'transparent',
    '--ag-odd-row-background-color': '#FFFFFF',
    '--ag-even-row-background-color': '#F3F8FF',
    '--ag-row-border-color': '#E0E0E0',
  } as React.CSSProperties;

  // AG Grid column definitions
  const columnDefs = [
    {
      headerName: 'Lead Name',
      field: 'lead_title',
      flex: 2,
      sortable: true,
      cellRenderer: (params: ICellRendererParams) => (
        <span
          style={{
            cursor: 'pointer',
            color: '#1976d2',
            fontWeight: 500,
          }}
          onClick={() => handleViewLead(params.data)}
        >
          {params.value || '—'}
        </span>
      ),
    },
    {
      headerName: 'Contact',
      field: 'contact_name',
      flex: 1.5,
      sortable: true,
      valueFormatter: (params: any) => params.value || '—',
    },
    {
      headerName: 'Company',
      field: 'company_name',
      flex: 2,
      sortable: true,
      cellRenderer: (params: ICellRendererParams) => {
        const company = params.value;
        if (!company) return '—';
        return company.length > 15 ? `${company.substring(0, 15)}...` : company;
      },
    },
    {
      headerName: 'Source',
      field: 'lead_source',
      flex: 1.5,
      sortable: true,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '8px',
      },
      valueFormatter: (params: any) => {
        if (!params.value) return '—';
        return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1.5,
      sortable: true,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '8px',
      },
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return '—';
        
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case 'new': return '#2196F3';
            case 'qualified': return'#4CAF50' ;
            case 'disqualified': return '#F44336';
            case 'recycled': return '#FF9800';
            default: return '#9E9E9E';
          }
        };

        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              backgroundColor: getStatusColor(params.value),
              color: 'white !important',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              height: '28px',
              borderRadius: '12px',
              minWidth: '120px',
              textTransform: 'capitalize',
              boxShadow:
                '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px rgba(0,0,0,0.14),0px 1px 3px rgba(0,0,0,0.12)',
            }}
          />
        );
      },
    },
    {
      headerName: 'Creation Date',
      field: 'created_date',
      flex: 1.5,
      sortable: true,
      valueFormatter: (params: any) => params.value || '—',
    },
    {
      headerName: 'Actions',
      field: 'id',
      minWidth: 120,
      flex: 1,
      sortable: false,
      cellRenderer: (params: ICellRendererParams) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => redirectToEditLead(params.value)}
            sx={{ color: '#1A3353' }}
          >
            <FaEdit />
          </IconButton>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <IconButton
              size="small"
              onClick={() => deleteLead(params.value)}
              sx={{ color: '#D32F2F' }}
            >
              <FaTrashAlt />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  // Default column definition
  const defaultColDef = {
    resizable: true,
    sortable: true,
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

  // Modal dialog text
  const modalDialog = 'Are you sure you want to delete this lead?';
  const modalTitle = 'Delete Lead';
  return (
    <Box sx={{ mt: '65px' }}>
      {/* Toolbar with search and filters */}
      <CustomToolbar
        sx={{
          bgcolor: '#1A3353 !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '2px 16px',
          borderBottom: '1px solid #e0e0e0',
          flexWrap: 'wrap',
          gap: 2,
          minHeight: '44px',
        }}
      >
        {/* LEFT: Filters */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flexWrap: 'wrap' }}
        >
          {/* Search */}
          <Box
            sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
          >
            <FiSearch
              style={{
                position: 'absolute',
                left: 12,
                zIndex: 1,
                color: '#666',
              }}
            />
            <InputBase
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              sx={{
                background: '#fff',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                pl: 5,
                border: '1px solid #D9D9D9',
                minWidth: 200,
                fontSize: 16,
              }}
            />
          </Box>

          {/* Status Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setStatusSelectOpen(true)}
              onClose={() => setStatusSelectOpen(false)}
              open={statusSelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {statusSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              )}
              sx={{
                background: '#fff',
                borderRadius: 2,
                fontSize: 16,
                height: 40,
              }}
            >
              <MenuItem value="">
                <em>All Status</em>
              </MenuItem>
              {statusList.slice(1).map((status, index: number) => (
                <MenuItem key={`status-${index}-${status.value}`} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Source Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setSourceSelectOpen(true)}
              onClose={() => setSourceSelectOpen(false)}
              open={sourceSelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {sourceSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              )}
              sx={{
                background: '#fff',
                borderRadius: 2,
                fontSize: 16,
                height: 40,
              }}
            >
              <MenuItem value="">
                <em>All Sources</em>
              </MenuItem>
              {sourceList.slice(1).map((source, index: number) => (
                <MenuItem key={`source-${index}-${source.value}`} value={source.value}>
                  {source.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* RIGHT: Export + Add Lead */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FaFileExport />}
            onClick={() => {}}
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
          <CustomButton
            variant="primary"
            shape="rounded"
            startIcon={<FiPlus />}
            onClick={onAddHandle}
          >
            Add Lead
          </CustomButton>
        </Stack>
      </CustomToolbar>

      {/* Grid + Pagination */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ pl: 1, pr: 1, mt: 2, px: 1, ml: 1.5 }}
      >
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper
              sx={{ width: '98%', mb: 2, p: 0, border: 'none' }}
              elevation={0}
              square
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Spinner />
                </Box>
              ) : (
                <>
                  {/* AG Grid */}
                  <Box
                    className="ag-theme-alpine leads-ag-theme"
                    sx={{
                      width: '100%',
                      ...gridTheme,
                      '--ag-icon-color': '#FFFFFF',
                      '& .ag-root-wrapper': {
                        border: 'none',
                      },
                      // Styles for rounded header corners
                      '& .ag-header': {
                        borderRadius: '8px 8px 0 0',
                        overflow: 'hidden',
                      },
                      '& .ag-header-cell:first-of-type': {
                        borderTopLeftRadius: '8px',
                      },
                      '& .ag-header-cell:last-of-type': {
                        borderTopRightRadius: '8px',
                      },
                      '& .ag-header-row': {
                        borderBottom: 'none',
                      },
                      // Icon styling
                      '& .ag-header-cell-label .ag-icon, & .ag-header-cell-label .ag-icon-wrapper svg':
                        {
                          fill: '#FFFFFF',
                          color: '#FFFFFF',
                        },
                      '& .ag-sort-ascending-icon, & .ag-sort-descending-icon, & .ag-sort-none-icon':
                        {
                          fill: '#FFFFFF',
                          color: '#FFFFFF',
                        },
                      // Row and cell styling
                      '& .ag-row': { display: 'flex', alignItems: 'center' },
                      '& .ag-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingLeft: '4px',
                        paddingRight: '4px',
                      },
                      '& .ag-header-cell': {
                        paddingLeft: '4px',
                        paddingRight: '4px',
                      },
                      '& .ag-pinned-right-cols-viewport .ag-cell': {
                        paddingRight: '8px',
                      },
                    }}
                  >
                    <AgGridReact
                      ref={gridRef}
                      rowData={leads}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      domLayout="autoHeight"
                      suppressRowClickSelection
                      suppressCellFocus
                      rowHeight={56}
                      headerHeight={40}
                      onGridReady={(params) => {
                        setGridApi(params.api);
                        params.api.sizeColumnsToFit();
                      }}
                      context={{ componentParent: { deleteLead } }}
                      getRowId={(params) => params.data.id}
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
                      mt: 1,
                      px: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Rows per page */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>Rows&nbsp;per&nbsp;page:</Typography>
                      <Select
                        size="small"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        sx={{ height: 32 }}
                      >
                        {[5, 10, 20, 30, 40, 50].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography sx={{ ml: 1 }}>
                        {`of ${leadsCount} rows`}
                      </Typography>
                    </Stack>

                    {/* Page Navigation */}
                    <Pagination
                      page={currentPage}
                      count={totalPages}
                      onChange={handlePageChange}
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
                          backgroundColor: '#1A3353',
                          color: '#fff',
                          border: '1px solid #1A3353',
                        },
                        '& .MuiPaginationItem-root.Mui-selected:hover': {
                          backgroundColor: '#1A3353',
                        },
                      }}
                    />
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Delete Modal */}
      <DeleteModal
        onClose={deleteLeadModalClose}
        open={deleteLeadModal}
        id={selectedId}
        modalDialog={modalDialog}
        modalTitle={modalTitle}
        DeleteItem={deleteItem}
        loading={deleteLoading}
      />

      {/* Success Alert */}
      <SuccessAlert
        open={!!successMessage}
        message={successMessage || ''}
        onClose={() => setSuccessMessage(null)}
        type="success"
      />

      {/* Error Alert */}
      <ErrorAlert
        open={!!errorMessage}
        message={errorMessage || ''}
        onClose={() => setErrorMessage(null)}
        showCloseButton={true}
      />
    </Box>
  );
}