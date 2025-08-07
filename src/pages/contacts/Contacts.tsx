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
  InputBase,
  FormControl,
  Container,
  Pagination,
  IconButton,
} from '@mui/material';
import { SuccessAlert, ErrorAlert } from '../../components/Button/SuccessAlert';
import { Spinner } from '../../components/Spinner';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FaDownload, FaFileExport } from 'react-icons/fa';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { MdLanguage, MdBusinessCenter } from 'react-icons/md';
import { fetchData } from '../../components/FetchData';
import { ContactUrl } from '../../services/ApiUrls';
import { DeleteModal } from '../../components/DeleteModal';
import * as XLSX from 'xlsx';
import { CustomButton } from '../../components/Button/CustomButton';
// AG Grid imports
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ICellRendererParams, ColDef } from 'ag-grid-community';
import { SelectChangeEvent } from '@mui/material/Select';
ModuleRegistry.registerModules([ClientSideRowModelModule]);
import LANGUAGE_CHOICES from '../../data/LANGUAGE';
import '../../styles/contacts-table.css';
import { CustomToolbar } from '../../styles/CssStyled';
import { useUser } from '../../context/UserContext';
// const JOB_TITLES = [
//   'Head of Sales',
//   'Project Manager',
//   'HR Specialist',
//   'Sales',
//   'Marketing Manager',
//   'Software Engineer',
//   'Business Analyst',
//   'Account Manager',
//   'Operations Manager',
//   'Product Manager',
// ];

const LANGUAGES = [
  'English',
  'Dutch',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
];

// Custom cell renderers
const NameCellRenderer = (props: ICellRendererParams) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/app/contacts/contact-details`, {
      state: { contactId: props.data, detail: true },
    });
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
      {props.data.first_name} {props.data.last_name}
    </span>
  );
};
const PhoneNumberCellRenderer = (props: ICellRendererParams) => {
  const phoneNumber = props.value;
  const doNotCall = props.data.do_not_call;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        position: 'relative',
      }}
    >
      <span
        style={{
          color: doNotCall ? '#D32F2F' : 'inherit',
          fontWeight: doNotCall ? 500 : 'normal',
        }}
      >
        {phoneNumber || '---'}
      </span>
      {doNotCall && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {/* SVG "Do Not Call" icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            style={{
              flex: 'none',
              order: 1,
              flexGrow: 0,
              position: 'relative',
              marginLeft: 2,
            }}
          >
            <circle cx="12" cy="12" r="12" fill="#D32F2F" />
            <rect x="6" y="11" width="12" height="2" rx="1" fill="#fff" />
          </svg>
        </span>
      )}
    </div>
  );
};

const ActionsCellRenderer = (props: ICellRendererParams) => {
  const navigate = useNavigate();
  const user = props.context.user; // Get user from context

  const handleEdit = () => {
    navigate(`/app/contacts/contact-details`, {
      state: { contactId: props.data, detail: false },
    });
  };

  const handleDelete = () => {
    props.context.componentParent.deleteRow(props.data.id);
  };

  // Check if user can edit (ADMIN/MANAGER always, USER only if they created the contact)
  const canEdit =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    (user?.role === 'USER' &&
      user?.user_details?.id === props.data.created_by?.id);

  // Check if user can delete (only ADMIN and MANAGER)
  const canDelete = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {canEdit && (
        <FaEdit
          style={{ cursor: 'pointer', color: '#1976d2', fontSize: '16px' }}
          onClick={handleEdit}
        />
      )}
      {canDelete && (
        <FaTrashAlt
          style={{ cursor: 'pointer', color: '#d32f2f', fontSize: '16px' }}
          onClick={handleDelete}
        />
      )}
    </div>
  );
};

export default function Contacts() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [contactList, setContactList] = useState([]);
  const [deleteRowModal, setDeleteRowModal] = useState(false);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>(
    []
  );
  // 1. Добавить состояния для департаментов
  const [departments, setDepartments] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departmentSelectOpen, setDepartmentSelectOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalContacts, setTotalContacts] = useState<number>(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [jobTitleSelectOpen, setJobTitleSelectOpen] = useState(false);
  const [languageSelectOpen, setLanguageSelectOpen] = useState(false);
  const [companySelectOpen, setCompanySelectOpen] = useState(false);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  // AG Grid column definitions
  const columnDefs: ColDef[] = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      suppressSizeToFit: true,
      width: 20,
      maxWidth: 20,
      sortable: false,
      filter: false,
    },
    {
      field: 'name',
      headerName: 'Full Name',
      cellRenderer: NameCellRenderer,
      valueGetter: (params) =>
        `${params.data.first_name} ${params.data.last_name}`,
      minWidth: 150,
      width: 150,
      flex: 1,
      sortable: true,
    },
    {
      field: 'primary_email',
      headerName: 'Email',
      minWidth: 300,
      width: 260,
      flex: 1,
      sortable: true,
    },
    {
      field: 'mobile_number',
      headerName: 'Phone Number',
      cellRenderer: PhoneNumberCellRenderer,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'title',
      headerName: 'Job Title',
      minWidth: 20,
      sortable: true,
    },

    {
      field: 'language',
      headerName: 'Language',
      minWidth: 80, // Увеличьте с 20 до 80
      width: 130, // Добавьте фиксированную ширину
      maxWidth: 130, // Ограничьте максимальную ширину
      valueGetter: (params) => {
        const code = params.data.language;
        const found = LANGUAGE_CHOICES.find(([c]) => c === code);
        return found ? found[1] : code;
      },
      sortable: true,
    },
    {
      field: 'created_at',
      headerName: 'Creation Date',
      minWidth: 80, // Увеличьте с 20 до 80
      width: 140, // Увеличьте с 100 до 120
      maxWidth: 140, // Добавьте максимальную ширину
      valueFormatter: (params) => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
        return '';
      },
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      minWidth: 70,
      maxWidth: 70,
      sortable: false,
      filter: false,
      pinned: 'right',
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    // filter: true,
    wrapText: true,
    autoHeight: true,
    unSortIcon: true,
    suppressSizeToFit: true,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingRight: '1px',
      paddingLeft: '1px',
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
    getContacts();
    // eslint-disable-next-line
  }, [
    currentPage,
    recordsPerPage,
    jobTitleFilter,
    languageFilter,
    companyFilter,
    departmentFilter, // Добавить это
  ]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      {
        getContacts();
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [search]);

  const getContacts = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    try {
      const offset = (currentPage - 1) * recordsPerPage;
      let url = `${ContactUrl}/?offset=${offset}&limit=${recordsPerPage}`;
      if (search.trim()) {
        url += `&name=${encodeURIComponent(search.trim())}`;
      }
      //   if (jobTitleFilter) url += `&title=${jobTitleFilter}`;
      if (languageFilter) url += `&language=${languageFilter}`;
      if (companyFilter) url += `&company=${companyFilter}`;
      // После строки с companyFilter
      if (departmentFilter)
        url += `&department=${encodeURIComponent(departmentFilter)}`;

      const data = await fetchData(url, 'GET', null as any, Header);

      if (!data.error) {
        setContactList(data.data?.contact_obj_list || []);
        setCountries(data.data?.companies || data.data?.countries || []);
        setJobTitles(data.data?.job_titles || []);
        setDepartments(data.data?.departments || []);
        setTotalContacts(
          data.data?.contacts_count || data.data?.contact_obj_list?.length || 0
        );
        setTotalPages(
          Math.ceil(
            (data.data?.contacts_count ||
              data.data?.contact_obj_list?.length ||
              0) / recordsPerPage
          )
        );
        setLoading(false);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch contacts');
      setLoading(false);
    }
  };

  const addContact = () => {
    navigate('/app/contacts/add-contacts', { state: { countries } });
  };

  const deleteRow = (deleteId: any) => {
    setDeleteRowModal(true);
    setSelectedId(deleteId);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedId('');
  };

  const DeleteItem = async () => {
    setDeleteLoading(true);
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    try {
      const res = await fetchData(
        `${ContactUrl}/${selectedId}/`,
        'DELETE',
        null as any,
        Header
      );

      if (!res.error) {
        setSuccessMessage('Contact deleted successfully');
        deleteRowModalClose();
        getContacts();
      } else {
        setErrorMessage('Failed to delete contact');
      }
    } catch (error) {
      setErrorMessage('Failed to delete contact');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedData = selectedNodes?.map((node) => node.data) || [];
    const dataToExport = selectedData.length > 0 ? selectedData : contactList;

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    XLSX.writeFile(wb, 'contacts.xlsx');
  };

  const handlePageChange = (_e: any, page: number) => {
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRecordsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const modalDialog = 'Are you sure you want to delete this contact?';
  const modalTitle = 'Delete Contact';

  return (
    <Box sx={{ mt: '60px' }}>
      {/* Toolbar */}
      <Box
        className="CustomToolbar"
        sx={{
          bgcolor: '#1A3353',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '6px 24px',
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
              placeholder="Search contacts..."
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
          {/* Job Title Filter
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={jobTitleFilter}
              onChange={(e) => {
                setJobTitleFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setJobTitleSelectOpen(true)}
              onClose={() => setJobTitleSelectOpen(false)}
              open={jobTitleSelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {jobTitleSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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
                <em>All Job Titles</em>
              </MenuItem>
              {jobTitles.map((title) => (
                <MenuItem key={title} value={title}>
                  {title}
                </MenuItem>
              ))}
            </Select> */}
          {/* </FormControl> */}
          {/* Language Filter
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setLanguageSelectOpen(true)}
              onClose={() => setLanguageSelectOpen(false)}
              open={languageSelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {languageSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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
                <em>Language</em>
              </MenuItem>
              {LANGUAGE_CHOICES.map(([code, label]) => (
                <MenuItem key={code} value={code}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          {/* Company Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setCompanySelectOpen(true)}
              onClose={() => setCompanySelectOpen(false)}
              open={companySelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {companySelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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
                <em>Company</em>
              </MenuItem>
              {countries.map((company: any) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Department Filter */}
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              onOpen={() => setDepartmentSelectOpen(true)}
              onClose={() => setDepartmentSelectOpen(false)}
              open={departmentSelectOpen}
              IconComponent={() => (
                <div style={{ marginRight: 8 }}>
                  {departmentSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
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
                <em>All Departments</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {/* Export + Add Contact */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
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
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={addContact}
            sx={[
              {
                fontFamily: 'Roboto !important',
                fontWeight: '500 !important',
                fontSize: '16px !important',
                lineHeight: '19px !important',
                height: '40px !important', //
                minWidth: '140px !important',
                
                '&:hover': { backgroundColor: '#1565c0 !important' },
                textTransform: 'none !important',
                padding: '8px 24px !important',
                boxSizing: 'border-box !important',
                display: 'flex !important',
                alignItems: 'center !important',
                justifyContent: 'center !important',
              },
            ]}
          >
            Add Contact
          </Button>
        </Stack>
      </Box>

      {/* Grid + Pagination */}
      {/* <Container maxWidth={false} disableGutters sx={{ px: 0.5, mt: 2 }}> */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ pl: 1, pr: 1, mt: 2, px: 1, ml: 1.5 }}
      >
        <Paper sx={{ width: '98%', mb: 2, p: 0 }} elevation={0} square>
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
                  rowData={contactList}
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
                  context={{ componentParent: { deleteRow }, user }}
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
                className="contacts-pagination"
                sx={{width: '100%',
                  mt: 3,
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
                    sx={{ height: 32, width: 80, fontSize: 14 }}
                  >
                    {[10, 20, 30, 40, 50, 100].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography
                    sx={{ ml: 1, width: '100px' }}
                  >{`of ${totalContacts} rows`}</Typography>
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
      </Container>

      {/* Delete Modal */}
      <DeleteModal
        onClose={deleteRowModalClose}
        open={deleteRowModal}
        id={selectedId}
        modalDialog={modalDialog}
        modalTitle={modalTitle}
        DeleteItem={DeleteItem}
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
