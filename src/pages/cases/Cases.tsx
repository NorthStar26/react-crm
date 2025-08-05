import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../components/Spinner';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { CustomToolbar, FabLeft, FabRight } from '../../styles/CssStyled';
import { fetchData } from '../../components/FetchData';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { CasesUrl } from '../../services/ApiUrls';
import { DeleteModal } from '../../components/DeleteModal';
import { Priority } from '../../components/Priority';
import { CustomButton } from '../../components/Button';

// AG Grid imports
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ICellRendererParams } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Grid theme styles
const gridTheme = {
  '--ag-header-background-color': '#2E4258',
  '--ag-header-foreground-color': '#FFFFFF',
  '--ag-header-border-color': 'transparent',
  '--ag-odd-row-background-color': '#FFFFFF',
  '--ag-even-row-background-color': '#F3F8FF',
  '--ag-row-border-color': '#E0E0E0',
  '--ag-cell-horizontal-padding': '4px',
  '--ag-header-cell-padding': '8px',
} as React.CSSProperties;

export default function Cases() {
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [contacts, setContacts] = useState([]);
  const [priority, setPriority] = useState([]);
  const [status, setStatus] = useState([]);
  const [typeOfCases, setTypeOfCases] = useState([]);
  const [account, setAccount] = useState([]);
  const [deleteRowModal, setDeleteRowModal] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [gridApi, setGridApi] = useState<any>(null);

  // Column definitions for AG Grid
  const columnDefs = [
    {
      headerName: 'Name',
      field: 'name',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value ? params.value : '---';
        return (
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => caseDetail(params.data.id)}
          >
            {value}
          </div>
        );
      },
    },
    {
      headerName: 'Account',
      field: 'account.name',
      flex: 2,
      sortable: true,
      filter: true,
      valueGetter: (params: any) =>
        params.data.account ? params.data.account.name : '---',
    },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      sortable: true,
      filter: true,
      valueGetter: (params: any) => params.data.status || '---',
    },
    {
      headerName: 'Priority',
      field: 'priority',
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        return params.value ? <Priority priorityData={params.value} /> : '---';
      },
    },
    {
      headerName: 'Created On',
      field: 'created_on_arrow',
      flex: 1,
      sortable: true,
      filter: true,
      valueGetter: (params: any) => params.data.created_on_arrow || '---',
    },
    {
      headerName: 'Action',
      field: 'id',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => deleteRow(params.value)}>
            <FaTrashAlt style={{ fill: '#1A3353', width: '15px' }} />
          </IconButton>
        </Stack>
      ),
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
      paddingRight: '8px',
    },
  };

  useEffect(() => {
    getCases();
  }, [currentPage, recordsPerPage]);

  const getCases = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    try {
      const offset = (currentPage - 1) * recordsPerPage;
      const res = await fetchData(
        `${CasesUrl}/?offset=${offset}&limit=${recordsPerPage}`,
        'GET',
        null as any,
        Header
      );

      if (!res.error) {
        setCases(res?.cases || []);
        setTotalPages(Math.ceil(res?.cases_count / recordsPerPage));
        setStatus(res?.status || []);
        setPriority(res?.priority || []);
        setTypeOfCases(res?.type_of_case || []);
        setContacts(res?.contacts_list || []);
        setAccount(res?.accounts_list || []);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const onAddCases = () => {
    if (!loading) {
      navigate('/app/cases/add-case', {
        state: {
          detail: false,
          contacts: contacts || [],
          priority: priority || [],
          typeOfCases: typeOfCases || [],
          account: account || [],
          status: status || [],
        },
      });
    }
  };

  const caseDetail = (caseId: string) => {
    navigate(`/app/cases/case-details`, {
      state: {
        caseId,
        detail: true,
        contacts: contacts || [],
        priority: priority || [],
        typeOfCases: typeOfCases || [],
        account: account || [],
        status: status || [],
      },
    });
  };

  const deleteRow = (id: string) => {
    setSelectedId(id);
    setDeleteRowModal(true);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedId('');
  };

  const deleteItem = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    fetchData(`${CasesUrl}/${selectedId}/`, 'DELETE', null as any, Header)
      .then((res: any) => {
        if (!res.error) {
          deleteRowModalClose();
          getCases();
        }
      })
      .catch((err) => {
        console.error('Error deleting case:', err);
      });
  };

  const handlePreviousPage = () => {
    setLoading(true);
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setLoading(true);
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleRecordsPerPage = (event: any) => {
    setLoading(true);
    setRecordsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const recordsList = [
    [10, '10 Records per page'],
    [20, '20 Records per page'],
    [30, '30 Records per page'],
    [40, '40 Records per page'],
    [50, '50 Records per page'],
  ];

  const modalDialog = 'Are You Sure You want to delete this Case?';
  const modalTitle = 'Delete Case';

  return (
    <Box sx={{ mt: '60px' }}>
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
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flexWrap: 'wrap' }}
        >
          {/* Left side of toolbar - can add filters here */}
        </Stack>

        {/* RIGHT: Export + Add Case + Pagination */}
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={recordsPerPage}
              onChange={handleRecordsPerPage}
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {selectOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              )}
              sx={{
                background: '#fff',
                borderRadius: 2,
                fontSize: 14,
                height: 40,
              }}
            >
              {recordsList?.map((item: any, i: number) => (
                <MenuItem key={i} value={item[0]}>
                  {item[1]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              borderRadius: '7px',
              backgroundColor: 'white',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              pl: 1,
              pr: 1,
            }}
          >
            <FabLeft onClick={handlePreviousPage} disabled={currentPage === 1}>
              <FiChevronLeft />
            </FabLeft>
            <Typography
              sx={{
                textTransform: 'lowercase',
                fontSize: '15px',
                color: '#1A3353',
                textAlign: 'center',
                mx: 1,
              }}
            >
              {currentPage} of {totalPages}
            </Typography>
            <FabRight
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </FabRight>
          </Box>

          <CustomButton
            variant="primary"
            shape="rounded"
            startIcon={<FiPlus />}
            onClick={onAddCases}
          >
            Add Case
          </CustomButton>
        </Stack>
      </CustomToolbar>

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
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Spinner />
                </Box>
              ) : (
                <Box
                  className="ag-theme-alpine cases-ag-theme"
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
                    '& .ag-row': {
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .ag-cell': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    },
                    '& .ag-header-cell': {
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    },
                  }}
                >
                  <AgGridReact
                    ref={gridRef}
                    rowData={cases}
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
                    context={{ componentParent: { deleteRow, caseDetail } }}
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
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <DeleteModal
        onClose={deleteRowModalClose}
        open={deleteRowModal}
        id={selectedId}
        modalDialog={modalDialog}
        modalTitle={modalTitle}
        DeleteItem={deleteItem}
      />
    </Box>
  );
}
