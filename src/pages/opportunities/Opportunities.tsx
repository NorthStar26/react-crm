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
import { OpportunityUrl } from '../../services/ApiUrls';
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

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function Opportunities() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [account, setAccount] = useState([]);
  const [stage, setStage] = useState([]);
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
  const [totalOpportunities, setTotalOpportunities] = useState<number>(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [stageSelectOpen, setStageSelectOpen] = useState(false);
  const [contactSelectOpen, setContactSelectOpen] = useState(false);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  // Effect hook to fetch opportunities when filters or pagination changes
  useEffect(() => {
    getOpportunities();
  }, [currentPage, recordsPerPage, selectedStage, selectedContact]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getOpportunities();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch opportunities from API
  const getOpportunities = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    try {
      const offset = (currentPage - 1) * recordsPerPage;

      // Build URL with filters
      let url = `${OpportunityUrl}/?offset=${offset}&limit=${recordsPerPage}`;
      if (searchTerm.trim()) {
        url += `&name=${encodeURIComponent(searchTerm.trim())}`;
      }
      if (selectedStage) {
        url += `&stage=${encodeURIComponent(selectedStage)}`;
      }
      if (selectedContact) {
        url += `&contact_id=${encodeURIComponent(selectedContact)}`;
      }

      const data = await fetchData(url, 'GET', null as any, Header);

      if (!data.error) {
        setOpportunities(data.opportunities || []);
        setTotalOpportunities(data.opportunities_count || 0);
        setTotalPages(
          Math.ceil((data.opportunities_count || 0) / recordsPerPage)
        );

        // Set reference data
        setContacts(data.contacts_list || []);
        setAccount(data.accounts_list || []);
        setCurrency(data.currency || []);
        setLeadSource(data.lead_source || []);
        setStage(data.stage || []);
        setTags(data.tags || []);
        setTeams(data.teams || []);
        setUsers(data.users || []);
        setCountries(data.countries || []);

        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setErrorMessage('Failed to fetch opportunities');
      setLoading(false);
    }
  };

  // Get unique stages from opportunities for filtering
  const getUniqueStages = () => {
    if (!opportunities || opportunities.length === 0) return [];

    const stages = opportunities
      .map((item: any) => item?.stage)
      .filter((stage: string) => stage && stage.trim() !== '')
      .filter(
        (stage: string, index: number, arr: string[]) =>
          arr.indexOf(stage) === index
      );

    return stages;
  };

  // Get unique contacts from opportunities for filtering
  const getUniqueContacts = () => {
    const contacts = opportunities
      .map((item: any) => {
        if (item?.contact) {
          const fullName = `${item.contact.salutation || ''} ${
            item.contact.first_name || ''
          } ${item.contact.last_name || ''}`.trim();
          return { id: item.contact.id, name: fullName };
        }
        return null;
      })
      .filter((contact: any) => contact && contact.name)
      .filter(
        (contact: any, index: number, arr: any[]) =>
          arr.findIndex((c: any) => c.id === contact.id) === index
      );
    return contacts;
  };

  // Navigation handlers
  const onAddOpportunity = () => {
    if (!loading) {
      navigate('/app/opportunities/add-opportunity', {
        state: {
          detail: false,
          contacts: contacts || [],
          leadSource: leadSource || [],
          currency: currency || [],
          tags: tags || [],
          account: account || [],
          stage: stage || [],
          users: users || [],
          teams: teams || [],
          countries: countries || [],
        },
      });
    }
  };

  const handleViewOpportunity = (opportunity: any) => {
    navigate('view', {
      state: { opportunityData: opportunity },
    });
  };

  const opportunityDetail = (opportunityId: any) => {
    navigate(`/app/opportunities/${opportunityId}/pipeline`, {
      state: {
        opportunityId,
        detail: true,
        contacts: contacts || [],
        leadSource: leadSource || [],
        currency: currency || [],
        tags: tags || [],
        account: account || [],
        stage: stage || [],
        users: users || [],
        teams: teams || [],
        countries: countries || [],
      },
    });
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
        `${OpportunityUrl}/${selectedId}/`,
        'DELETE',
        null as any,
        Header
      );

      if (!res.error) {
        setSuccessMessage('Opportunity deleted successfully');
        deleteRowModalClose();
        getOpportunities();
      } else {
        setErrorMessage('Failed to delete opportunity');
      }
    } catch (error) {
      setErrorMessage('Failed to delete opportunity');
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
      headerName: 'Name',
      field: 'name',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => (
        <span
          style={{
            cursor: 'pointer',
            color: '#1976d2',
            fontWeight: 500,
          }}
          onClick={() => handleViewOpportunity(params.data)}
        >
          {params.value || '—'}
        </span>
      ),
    },
    {
      headerName: 'Contact',
      field: 'contact',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const contact = params.value;
        if (!contact) return '—';

        return `${contact.salutation || ''} ${contact.first_name || ''} ${
          contact.last_name || ''
        }`.trim();
      },
    },
    {
      headerName: 'Stage',
      field: 'stage',
      flex: 1.5,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return '—';

        return (
          <Chip
            label={
              opportunityStageShortNames[params.value.toLowerCase()] ||
              params.value
            }
            sx={{
              backgroundColor: getStageColor(params.value),
              ...stageChipStyles,
            }}
          />
        );
      },
    },
    {
      headerName: 'Expected Result',
      field: 'amount',
      flex: 1.5,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const { data } = params;
        if (!data.amount || !data.probability) return '—';

        return (
          <Stack>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {data.currency || '$'} {Number(data.amount).toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {data.probability}% Probability
            </Typography>
          </Stack>
        );
      },
    },
    {
      headerName: 'Close Date',
      field: 'expected_close_date',
      flex: 1.5,
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => params.value || '—',
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
            onClick={() => opportunityDetail(params.value)}
            sx={{ color: '#0F2A55' }}
          >
            <FaEdit />
          </IconButton>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <IconButton
              size="small"
              onClick={() => deleteRow(params.value)}
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
  const modalDialog = 'Are you sure you want to delete this opportunity?';
  const modalTitle = 'Delete Opportunity';

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
              placeholder="Search opportunities..."
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

          {/* Stage Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setStageSelectOpen(true)}
              onClose={() => setStageSelectOpen(false)}
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
                <em>All Stages</em>
              </MenuItem>
              {getUniqueStages().map((stage: string, index: number) => (
                <MenuItem key={`stage-${index}-${stage}`} value={stage}>
                  <Chip
                    label={stage}
                    size="small"
                    sx={{
                      backgroundColor: getStageColor(stage),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      height: '20px',
                      minWidth: '80px',
                    }}
                  />
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
                  {contact.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* RIGHT: Export + Add Opportunity */}
        <Stack direction="row" spacing={2}>
          <CustomButton
            variant="outline"
            shape="rounded"
            startIcon={<FaDownload />}
            onClick={() => {}}
          >
            Export
          </CustomButton>
          <CustomButton
            variant="primary"
            shape="rounded"
            startIcon={<FiPlus />}
            onClick={onAddOpportunity}
          >
            Add Opportunity
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
                    className="ag-theme-alpine opportunities-ag-theme"
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
                      rowData={opportunities}
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
                        {`of ${totalOpportunities} rows`}
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
