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
  //   Snackbar,
  //   Alert,
} from '@mui/material';
import { SuccessAlert, ErrorAlert } from '../../components/Button/SuccessAlert';
import { Spinner } from '../../components/Spinner';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FaDownload, FaFileExport } from 'react-icons/fa';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { fetchData } from '../../components/FetchData';
import { CompaniesUrl } from '../../services/ApiUrls';
import { CustomToolbar } from '../../styles/CssStyled';
import { DeleteModal } from '../../components/DeleteModal';
import COUNTRIES from '../../data/countries';
import INDCHOICES from '../../data/INDCHOICES';
import * as XLSX from 'xlsx';
import { CustomButton } from '../../components/Button';


// AG Grid imports
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ICellRendererParams } from 'ag-grid-community';
import { Grid } from '@mui/material';
import { useUser } from '../../context/UserContext';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function Company() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [deleteRowModal, setDeleteRowModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [industrySelectOpen, setIndustrySelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  // Automatically call getCompanies when any filter changes
  useEffect(() => {
    getCompanies();
  }, [currentPage, recordsPerPage, industryFilter, countryFilter, search]);

  const getCompanies = async () => {
    const token = localStorage.getItem('Token');
    const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
      org: localStorage.getItem('org'),
    };

    try {
      const offset = (currentPage - 1) * recordsPerPage;

      // Build request parameters
      let url = `${CompaniesUrl}?offset=${offset}&limit=${recordsPerPage}`;
      if (search) url += `&name=${search}`;
      if (industryFilter) url += `&industry=${industryFilter}`;
      if (countryFilter) url += `&billing_country=${countryFilter}`;

      const data = await fetchData(url, 'GET', null as any, Header);

      if (!data.error) {
        setCompanyList(data.results || []);
        setTotalCompanies(data.count || (data.results?.length ?? 0));
        setTotalPages(Math.ceil((data.count || 0) / recordsPerPage));
        setLoading(false);
      }

      // if (!data.error) {
      //   console.log('Companies data:', data);
      //   setCompanyList(data.data || []);
      //   setTotalCompanies(data.total || data.data?.length || 0);
      //   setTotalPages(
      //     Math.ceil((data.total || data.data?.length || 0) / recordsPerPage)
      //   );
      //   setLoading(false);
      // }

    } catch (error) {
      console.error('Error fetching companies:', error);
      setLoading(false);
    }
  };

  const addCompany = () => {
    if (!loading) {
      navigate('/app/companies/add-company');
    }
  };

  const companyDetail = (companyId: any) => {
    navigate(`/app/companies/company-details`, {
      state: { companyId: { id: companyId }, detail: true },
    });
  };

  const editCompany = (companyId: any) => {
    navigate(`/app/companies/edit-company/${companyId}`);
  };

  const deleteRow = (deleteId: any) => {
    console.log('Preparing to delete company ID:', deleteId);
    setDeleteRowModal(true);
    setSelectedId(deleteId);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedId('');
  };

  // Improved DeleteItem function with proper error handling
  const DeleteItem = async () => {
    console.log('DeleteItem function called for ID:', selectedId);
    setDeleteLoading(true);

    try {
      const token = localStorage.getItem('Token');
      const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';

      if (!cleanToken || !selectedId) {
        console.error('Missing token or company ID');
        setErrorMessage('Authentication error. Please login again.');
        setDeleteLoading(false);
        return;
      }

      const Header = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
        org: localStorage.getItem('org'),
      };

      // Make sure the URL is properly formatted with trailing slash
      const deleteUrl = `${CompaniesUrl}${selectedId}/`;
      console.log('Delete URL:', deleteUrl);

      const res = await fetchData(deleteUrl, 'DELETE', null as any, Header);
      console.log('Delete response:', res);

      if (res && !res.error) {
        // Success case
        setSuccessMessage('Company successfully deleted');
        deleteRowModalClose();
        getCompanies(); // Refresh the companies list
      } else {
        // Error from API
        console.error('API Error:', res?.error || 'Unknown error');
        setErrorMessage(
          res?.error || 'Failed to delete company. Please try again.'
        );
      }
    } catch (error) {
      console.error('Exception during delete:', error);
      setErrorMessage('An error occurred during deletion. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Clear error and success messages
  const handleCloseError = () => {
    setErrorMessage(null);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getIndustryName = (industryCode: string) => {
    const industry = INDCHOICES.find(([code]) => code === industryCode);
    return industry ? industry[1] : industryCode;
  };

  const getCountryName = (countryCode: string) => {
    const country = COUNTRIES.find(([code]) => code === countryCode);
    return country ? country[1] : countryCode;
  };

  // Export all companies to Excel
  const exportExcel = async () => {
    if (totalCompanies === 0) {
      console.warn('No companies to export.');
      return;
    }

    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    const res: any = await fetchData(
      `${CompaniesUrl}?limit=${totalCompanies}`,
      'GET',
      '',
      Header
    );

    if (res?.error) {
      console.error('Failed to fetch all companies for export');
      return;
    }
    //const rows = (res.data || []).map((company: any) => ({
    const rows = (res.results || []).map((company: any) => ({
      'Company Name': company.name || '',
      Email: company.email || '',
      Phone: company.phone || '',
      Website: company.website || '',
      Industry: getIndustryName(company.industry),
      Country: getCountryName(company.billing_country),
      'Creation Date': formatDate(company.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Companies');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `companies_${today}.xlsx`);
  };

  // AG Grid column definitions
  const columnDefs = [
    {
      headerName: 'Company Name',
      field: 'name',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            src={params.data.logo_url || undefined}
            alt={params.value}
            sx={{ width: 32, height: 32, fontSize: 14, bgcolor: '#284871' }}
          >
            {params.value?.charAt(0).toUpperCase() || 'C'}
          </Avatar>
          <Typography
            sx={{ color: '#1a73e8', cursor: 'pointer', textTransform: 'none' }}
            onClick={() => companyDetail(params.data.id)}
          >
            {params.value || '—'}
          </Typography>
        </Stack>
      ),
    },
    {
      headerName: 'Email',
      field: 'email',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => params.value || '—',
    },
    {
      headerName: 'Phone',
      field: 'phone',
      flex: 1.5,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => params.value || '—',
    },
    {
      headerName: 'Industry',
      field: 'industry',
      flex: 1.5,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => getIndustryName(params.value) || '—',
    },
    {
      headerName: 'Country',
      field: 'billing_country',
      flex: 1.5,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => getCountryName(params.value) || '—',
    },
    {
      headerName: 'Creation Date',
      field: 'created_at',
      flex: 1.5,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => formatDate(params.value) || '—',
    },
    {
      headerName: 'Actions',
      field: 'id',
      minWidth: 120,
      sortable: false,
      suppressClickEventBubbling: true,
      cellRenderer: (params: ICellRendererParams) => (
        <Stack direction="row" spacing={1}>
          {/* Show edit button for ADMIN/MANAGER always, or for USER only if they created the company */}
          {(user?.role === 'ADMIN' ||
            user?.role === 'MANAGER' ||
            (user?.role === 'USER' &&
              user?.user_details?.id === params.data.created_by?.id)) && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                editCompany(params.value);
              }}
              sx={{ color: '#0F2A55' }}
            >
              <FaEdit />
            </IconButton>
          )}
          {/* Only show delete button for ADMIN and MANAGER roles */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                deleteRow(params.value);
              }}
              sx={{ color: '#D32F2F' }}
            >
              <FaTrashAlt />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const rowData = companyList;

  const gridTheme = {
    '--ag-header-background-color': '#2E4258',
    '--ag-header-foreground-color': '#FFFFFF',
    '--ag-header-border-color': 'transparent',
    '--ag-odd-row-background-color': '#FFFFFF',
    '--ag-even-row-background-color': '#F3F8FF',
    '--ag-row-border-color': '#E0E0E0',
  } as React.CSSProperties;

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

  const modalDialog = 'Are You Sure you want to delete this company?';
  const modalTitle = 'Delete Company';

  return (
    <Box sx={{ mt: '60px' }}>
      {/* Top Toolbar with Filters */}
      <CustomToolbar
        sx={{
          bgcolor: '#F3F8FF !important',
          //   bgcolor: '#1A3353 !important',
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
        {/* LEFT: Filters*/}
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
              placeholder="Search companies..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setIndustrySelectOpen(true)}
              onClose={() => setIndustrySelectOpen(false)}
              open={industrySelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {industrySelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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

          {/* Country Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setCountrySelectOpen(true)}
              onClose={() => setCountrySelectOpen(false)}
              open={countrySelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {countrySelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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
                <em>Country</em>
              </MenuItem>
              {COUNTRIES.map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* RIGHT: Export + Add Company  */}
        <Stack direction="row" spacing={2}>
          <CustomButton
            variant="outline"
            shape="rounded"
            startIcon={<FaFileExport />}
            onClick={exportExcel}
          >
            Export
          </CustomButton>
          <CustomButton
            variant="primary"
            shape="rounded"
            startIcon={<FiPlus />}
            onClick={addCompany}
          >
            Add Company
          </CustomButton>
        </Stack>
      </CustomToolbar>

      {/* Grid + Pagination */}
      {/* <Container maxWidth={false} disableGutters sx={{ px: 2, mt: 2 }}> */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ pl: 1, pr: 1, mt: 2, px: 1 }}
      >
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper sx={{ width: '100%', mb: 2, p: 0 }} elevation={0} square>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Spinner />
                </Box>
              ) : (
                <>
                  {/* AG Grid */}
                  <Box
                    className="ag-theme-alpine contacts-ag-theme"
                    sx={{
                      width: '100%',
                      ...gridTheme,
                      '--ag-icon-color': '#FFFFFF',
                      '& .ag-root-wrapper': {
                        border: 'none',
                      },
                      // Добавленные стили для закругления углов заголовка
                      '& .ag-header': {
                        borderRadius: '8px 8px 0 0', // Закругление верхних углов
                        overflow: 'hidden', // Обязательно для работы border-radius
                      },
                      '& .ag-header-cell:first-of-type': {
                        borderTopLeftRadius: '8px', // Закругление левого верхнего угла
                      },
                      '& .ag-header-cell:last-of-type': {
                        borderTopRightRadius: '8px', // Закругление правого верхнего угла
                      },
                      '& .ag-header-row': {
                        borderBottom: 'none', // Убрать нижнюю границу у строки заголовка
                      },

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
                      rowData={rowData}
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
                        onChange={(e) => {
                          const v = parseInt(
                            (e.target as HTMLInputElement).value,
                            10
                          );
                          setRecordsPerPage(v);
                          setCurrentPage(1);
                        }}
                        sx={{ height: 32 }}
                      >
                        {[5,10, 20, 30, 40, 50].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography sx={{ ml: 1 }}>
                        {`of ${totalCompanies} rows`}
                      </Typography>
                    </Stack>

                    {/* Page Navigation */}
                    <Pagination
                      page={currentPage}
                      count={totalPages}
                      onChange={(_e, page) => setCurrentPage(page)}
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
        DeleteItem={DeleteItem}
      />

      {/* Error Snackbar */}
      <ErrorAlert
        open={!!errorMessage}
        message={errorMessage || ''}
        onClose={handleCloseError}
      />

      <SuccessAlert
        open={!!successMessage}
        message={successMessage || ''}
        onClose={handleCloseSuccess}
      />
    </Box>
  );
}
