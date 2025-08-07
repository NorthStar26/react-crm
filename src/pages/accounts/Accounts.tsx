import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  Select,
  MenuItem,
  Container,
  Pagination,
  Avatar,
  IconButton,
  InputBase,
  FormControl,
  Chip,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Spinner } from '../../components/Spinner';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FaDownload, FaTrashAlt, FaEdit } from 'react-icons/fa';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { CustomToolbar } from '../../styles/CssStyled';
import { fetchData } from '../../components/FetchData';
import { AccountsUrl } from '../../services/ApiUrls';
import { DeleteModal } from '../../components/DeleteModal';
import { useUser } from '../../context/UserContext';
import { opportunityStageShortNames } from '../../constants/stageNames';
import { getStageColor, stageChipStyles } from '../../constants/stageColors';
import { CustomButton } from '../../components/Button';
import { SuccessAlert, ErrorAlert } from '../../components/Button/SuccessAlert';

// AG Grid imports
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ICellRendererParams } from 'ag-grid-community';
import INDCHOICES from '../../data/INDCHOICES';
import * as XLSX from 'xlsx';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function Accounts() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState([]);
  const [tags, setTags] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [account, setAccount] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [deleteRowModal, setDeleteRowModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalaccounts, setTotalAccounts] = useState<number>(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [stageSelectOpen, setIndustrySelectOpen] = useState(false);
  const [contactSelectOpen, setContactSelectOpen] = useState(false);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  // Effect hook to fetch accounts when filters or pagination changes
  useEffect(() => {
    getAccounts();
  }, [currentPage, recordsPerPage, selectedStage, selectedContact]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getAccounts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch accounts from API
  const getAccounts = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    try {
      const offset = (currentPage - 1) * recordsPerPage;

      // Build URL with filters
      let url = `${AccountsUrl}/?offset=${offset}&limit=${recordsPerPage}`;
      if (searchTerm.trim()) {
        url += `&name=${encodeURIComponent(searchTerm.trim())}`;
      }
      if (selectedStage) {
        url += `&industry=${encodeURIComponent(selectedStage)}`;
      }
      if (selectedContact) {
        url += `&contact_id=${encodeURIComponent(selectedContact)}`;
      }

      const data = await fetchData(url, 'GET', null as any, Header);
      console.log('Fetched accounts:', data);
      if (!data.error) {
        setAccounts(
          data?.active_accounts && data?.closed_accounts
            ? [
                ...data.active_accounts?.open_accounts,
                ...data.closed_accounts?.close_accounts,
              ]
            : []
        );
        setTotalAccounts(accounts.length || 0);
        setTotalPages(data?.page_number[-1] || 1);

        // Set reference data
        setContacts(data.contacts || []);
        setAccount(data.accounts_list || []);
        setCurrency(data.currency || []);
        setLeadSource(data.lead_source || []);
        setIndustries(data.industries || []);
        setTags(data.tags || []);
        setTeams(data.teams || []);
        setUsers(data.users || []);
        setCountries(data.countries || []);
        setLeads(data.leads || []);
        setStatus(data.status || []);

        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setErrorMessage('Failed to fetch accounts');
      setLoading(false);
    }
  };

  // Get unique contacts from accounts for filtering
  const getUniqueContacts = () => {
    const contact = contacts.map((item: any) => {
      return { fullname: `${item.first_name} ${item.last_name}`, id: item.id };
    });

    return contact;
  };

  // Navigation handlers
  const onAddAccount = () => {
    if (!loading) {
      navigate('/app/accounts/add-account', {
        state: {
          detail: false,
          contacts: contacts || [],
          status: status || [],
          tags: tags || [],
          users: users || [],
          countries: countries || [],
          teams: teams || [],
          leads: leads || [],
        },
      });
    }
  };

  const handleViewAccount = (account: any) => {
    navigate('view', {
      state: { accountData: account },
    });
  };

  const accountDetail = (accountId: any) => {
    navigate(`/app/accounts/account-details/${accountId}`);
  };

  // Delete handlers
  const deleteRow = (id: any) => {
    setSelectedId(id);
    setDeleteRowModal(true);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedId('');
  };

  const deleteItem = async () => {
    setDeleteLoading(true);
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    try {
      const res = await fetchData(
        `${AccountsUrl}/${selectedId}/`,
        'DELETE',
        null as any,
        Header
      );

      if (!res.error) {
        setSuccessMessage('Account deleted successfully');
        deleteRowModalClose();
        getAccounts();
      } else {
        setErrorMessage('Failed to delete account');
      }
    } catch (error) {
      setErrorMessage('Failed to delete account');
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
    '--ag-header-background-color': '#2E4258',
    '--ag-header-foreground-color': '#FFFFFF',
    '--ag-header-border-color': 'transparent',
    '--ag-odd-row-background-color': '#FFFFFF',
    '--ag-even-row-background-color': '#F3F8FF',
    '--ag-row-border-color': '#E0E0E0',
  } as React.CSSProperties;

  // AG Grid column definitions
  const columnDefs = [
    {
      headerName: 'Company Name',
      field: 'company_name',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            src={params.data.logo_url || undefined}
            alt={params.value}
            sx={{ width: 32, height: 32, fontSize: 14, bgcolor: '#284871' }}
          >
            {params.data.contacts?.[0]?.company?.name
              ?.charAt(0)
              .toUpperCase() || 'C'}
          </Avatar>
          <Typography
            sx={{ color: '#1a73e8', cursor: 'pointer', textTransform: 'none' }}
            onClick={() => accountDetail(params.data.id)}
          >
            {params.data.contacts?.[0]?.company?.name || '—'}
          </Typography>
        </Stack>
      ),
    },

    {
      headerName: 'Industry',
      field: 'industry',
      flex: 1.5,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        if (
          !params.data.industry &&
          !params.data.contacts?.[0].company?.industry
        )
          return '—';

        return (
          params.data.contacts?.[0].company?.industry ||
          params.data.industry ||
          '—'
        );
      },
    },
    {
      headerName: 'Contact',
      field: 'contact',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        console.log(params, 'params in contact');
        const contact = params.data.contacts[0];
        if (!contact) return '—';

        return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
      },
    },
    {
      headerName: 'Close Date',
      field: 'expected_close_date',
      flex: 1.5,
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        const dateString = params.data.created_at;
        const date = new Date(dateString);

        const months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

        const day = date.getDate();
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();

        const formatted = `${monthName} ${day}, ${year}`;

        return formatted || '—';
      },
    },
    {
      headerName: 'Assigned To',
      field: 'assigned_to',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const assignedTo = params.value;
        if (!assignedTo || !assignedTo.length) return '—';

        const user = assignedTo[0]?.user_details;
        if (!user) return '—';

        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              src={user.profile_pic || ''}
              alt={user.first_name || user.email || 'User'}
              sx={{ width: 32, height: 32 }}
            >
              {user.first_name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography>
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.email || '—'}
            </Typography>
          </Stack>
        );
      },
    },
  ];

  // Default column definition
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

  // Modal dialog text
  const modalDialog = 'Are you sure you want to delete this account?';
  const modalTitle = 'Delete Account';

  const handleExport = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedData = selectedNodes?.map((node) => node.data) || [];
    const dataToExport = selectedData.length > 0 ? selectedData : accounts;

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Accounts');
    XLSX.writeFile(wb, 'accounts.xlsx');
  };

  return (
    <Box sx={{ mt: '65px' }}>
      {/* Toolbar with search and filters */}
      <CustomToolbar
        sx={{
          bgcolor: '#F3F8FF !important',
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
              placeholder="Search accounts..."
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

          {/* Industry Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setIndustrySelectOpen(true)}
              onClose={() => setIndustrySelectOpen(false)}
              open={stageSelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {stageSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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
                <em>Industry</em>
              </MenuItem>
              {INDCHOICES.map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Contact Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={selectedContact}
              onChange={(e) => {
                setSelectedContact(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setContactSelectOpen(true)}
              onClose={() => setContactSelectOpen(false)}
              open={contactSelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {contactSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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
                <em>All Contacts</em>
              </MenuItem>
              {getUniqueContacts().map((contact: any) => (
                <MenuItem key={contact.id} value={contact.id}>
                  {contact.fullname || '—'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* RIGHT: Export + Add Account */}
        <Stack direction="row" spacing={2}>
          {/* <CustomButton
            variant="outline"
            shape="rounded"
            startIcon={<FaDownload />}
            onClick={() => {}}
          >
            Export
          </CustomButton> */}
          <Button
            variant="outlined"
            startIcon={<FaDownload />}
            onClick={handleExport}
            sx={{
              background: '#2B5075',
              boxShadow:
                '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px rgba(0,0,0,0.14), 0px 1px 5px rgba(0,0,0,0.12)',
              borderRadius: '4px',
              border: 'none',
              color: '#FFFFFF',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#2B5075',
              },
            }}
          >
            Export
          </Button>
          <CustomButton
            variant="primary"
            shape="rounded"
            startIcon={<FiPlus />}
            onClick={onAddAccount}
          >
            Add Account
          </CustomButton>
        </Stack>
      </CustomToolbar>

      {/* Grid + Pagination */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ pl: 1, pr: 1, mt: 2, px: 1 }}
      >
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper
              sx={{ width: '100%', mb: 2, p: 0, border: 'none' }}
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
                    className="ag-theme-alpine accounts-ag-theme"
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
                      rowData={accounts}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      domLayout="autoHeight"
                      suppressCellFocus
                      rowHeight={56}
                      headerHeight={40}
                      onGridReady={(params) => {
                        setGridApi(params.api);
                        params.api.sizeColumnsToFit();
                      }}
                      context={{ componentParent: { deleteRow } }}
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
                        {`of ${totalaccounts} rows`}
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
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Delete Modal */}
      <DeleteModal
        onClose={deleteRowModalClose}
        open={deleteRowModal}
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
