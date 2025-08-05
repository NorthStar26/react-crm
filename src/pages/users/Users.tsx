// @ts-nocheck
import React, { SyntheticEvent, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  Stack,
  Tab,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Toolbar,
  Typography,
  Paper,
  TableCell,
  IconButton,
  Checkbox,
  Tooltip,
  TableSortLabel,
  alpha,
  Select,
  MenuItem,
  Container,
  Pagination,
  Avatar,
} from '@mui/material';
import { EnhancedTableHead } from '../../components/EnchancedTableHead';
import { getComparator, stableSort } from '../../components/Sorting';
import { DeleteModal } from '../../components/DeleteModal';
import { Spinner } from '../../components/Spinner';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FaAd, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { fetchData } from '../../components/FetchData';
import { UsersUrl, UserUrl } from '../../services/ApiUrls';
import {
  CustomTab,
  CustomToolbar,
  FabLeft,
  FabRight,
} from '../../styles/CssStyled';
import { FaDownload, FaFileExport } from 'react-icons/fa';
//import { FiDownload, } from 'react-icons/fi';
import * as XLSX from 'xlsx';

//

import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ICellRendererParams } from 'ag-grid-community';
import { Grid } from '@mui/material';
import { useUser } from '../../context/UserContext';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface HeadCell {
  disablePadding: boolean;
  id: any;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'email',
    numeric: true,
    disablePadding: false,
    label: 'Email Address',
  },
  {
    id: 'phone',
    numeric: true,
    disablePadding: false,
    label: 'Mobile Number',
  },
  {
    id: 'role',
    numeric: true,
    disablePadding: false,
    label: 'Role',
  },
  {
    id: 'actions',
    numeric: true,
    disablePadding: false,
    label: 'Actions',
  },
];

type Item = {
  id: string;
  user_details?: {
    email: string;
  };
  phone?: string;
  role?: string;
};
export default function Users() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('Website');
  const [deleteItems, setDeleteItems] = useState([]);
  const [page, setPage] = useState(0);
  const [values, setValues] = useState(10);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [usersData, setUsersData] = useState([]);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [loader, setLoader] = useState(true);
  const [isDelete, setIsDelete] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Item[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [activeUsersOffset, setActiveUsersOffset] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [inactiveUsersCount, setInactiveUsersCount] = useState(0);
  const [inactiveUsersOffset, setInactiveUsersOffset] = useState(0);
  const [deleteRowModal, setDeleteRowModal] = useState(false);
  const { user, logout: contextLogout } = useUser();
  const [selectOpen, setSelectOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  const [isSelectedId, setIsSelectedId] = useState<boolean[]>([]);

  const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
  const [activeRecordsPerPage, setActiveRecordsPerPage] = useState<number>(10);
  const [activeTotalPages, setActiveTotalPages] = useState<number>(0);
  const [activeLoading, setActiveLoading] = useState(true);

  const [inactiveCurrentPage, setInactiveCurrentPage] = useState<number>(1);
  const [inactiveRecordsPerPage, setInactiveRecordsPerPage] =
    useState<number>(10);
  const [inactiveTotalPages, setInactiveTotalPages] = useState<number>(0);
  const [inactiveLoading, setInactiveLoading] = useState(true);

  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  useEffect(() => {
    getUsers();
  }, [
    tab,
    activeCurrentPage,
    activeRecordsPerPage,
    inactiveCurrentPage,
    inactiveRecordsPerPage,
  ]);

  const handleChangeTab = (e: SyntheticEvent, val: any) => {
    setTab(val);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const getUsers = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    try {
      const activeOffset = (activeCurrentPage - 1) * activeRecordsPerPage;
      const inactiveOffset = (inactiveCurrentPage - 1) * inactiveRecordsPerPage;
      console.log(
        'activeOffset, activeRecordsPerPage',
        activeOffset,
        activeRecordsPerPage
      );
      await fetchData(
        `${UsersUrl}/?offset=${
          tab === 'active' ? activeOffset : inactiveOffset
        }&limit=${
          tab === 'active' ? activeRecordsPerPage : inactiveRecordsPerPage
        }`,
        'GET',
        null as any,
        Header
      ).then((res: any) => {
        if (!res.error) {
          console.log('res', res);
          setActiveUsersCount(res.active_users.active_users_count);
          //console.log("res?.active_users?.active_users", res?.active_users?.active_users)
          setActiveUsers(res?.active_users?.active_users);
          setInactiveUsersCount(res.inactive_users.inactive_users_count);
          setActiveTotalPages(
            Math.ceil(
              res?.active_users?.active_users_count / activeRecordsPerPage
            )
          );
          setActiveUsersOffset(res?.active_users?.offset);
          setInactiveUsers(res?.inactive_users?.inactive_users);
          setInactiveTotalPages(
            Math.ceil(
              res?.inactive_users?.inactive_users_count / inactiveRecordsPerPage
            )
          );
          setInactiveUsersOffset(res?.inactive_users?.offset);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const userDetail = (userId: any) => {
    navigate(`/app/users/user-details`, { state: { userId, detail: true } });
  };
  const handleRecordsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (tab == 'active') {
      setActiveLoading(true);
      setActiveRecordsPerPage(parseInt(event.target.value));
      setActiveCurrentPage(1);
    } else {
      setInactiveLoading(true);
      setInactiveRecordsPerPage(parseInt(event.target.value));
      setInactiveCurrentPage(1);
    }
  };
  const handlePreviousPage = () => {
    if (tab == 'active') {
      setActiveLoading(true);
      setActiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    } else {
      setInactiveLoading(true);
      setInactiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (tab == 'active') {
      setActiveLoading(true);
      setActiveCurrentPage((prevPage) =>
        Math.min(prevPage + 1, activeTotalPages)
      );
    } else {
      setInactiveLoading(true);
      setInactiveCurrentPage((prevPage) =>
        Math.min(prevPage + 1, inactiveTotalPages)
      );
    }
  };
  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: any) => {};

  type SelectedItem = string[];
  const isSelected = (name: string, selected: SelectedItem): boolean => {
    return selected.indexOf(name) !== -1;
  };

  const deleteItemBox = (deleteId: any) => {
    setDeleteItemId(deleteId);
    setIsDelete(!isDelete);
  };

  const onclose = () => {
    setIsDelete(!isDelete);
  };

  const onDelete = (id: any) => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    fetchData(`${UsersUrl}/${id}/`, 'delete', null as any, Header)
      .then((data) => {
        if (!data.error) {
          getUsers();
          setIsDelete(false);
        }
      })
      .catch(() => {});
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - 7) : 0;

  const onAddUser = () => {
    if (!loading) {
      navigate('/app/users/add-users');
    }
  };
  const deleteRow = (id: any) => {
    setSelectedId(id);
    setDeleteRowModal(true);
  };

  const getUserDetail = (id: any) => {
    console.log('getUserDetail called with ID:', id);
    console.log('Current localStorage Token:', localStorage.getItem('Token'));
    console.log('Current localStorage org:', localStorage.getItem('org'));

    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    console.log('Headers being sent:', Header);
    console.log('API URL being called:', `${UserUrl}/${id}/`);

    fetchData(`${UserUrl}/${id}/`, 'GET', null as any, Header)
      .then((res) => {
        console.log(res, 'res');
        if (!res.error) {
          const data = res?.data?.profile_obj;
          navigate('/app/users/edit-user', {
            state: {
              value: {
                email: data?.user_details?.email,
                role: data?.role,
                phone: data?.phone,
                alternate_phone: data?.alternate_phone,
                address_line: data?.address?.address_line,
                street: data?.address?.street,
                city: data?.address?.city,
                state: data?.address?.state,
                postcode: data?.address?.postcode,
                country: data?.address?.country,
                profile_pic: data?.user_details?.profile_pic,
                first_name: data?.user_details?.first_name,
                last_name: data?.user_details?.last_name,
                has_sales_access: data?.has_sales_access,
                has_marketing_access: data?.has_marketing_access,
                is_organization_admin: data?.is_organization_admin,
              },
              id: id,
              edit: true,
            },
          });
        } else {
          console.error('Error response from getUserDetail API:', res);
        }
      })
      .catch((error) => {
        console.error('Network/fetch error in getUserDetail:', error);
      });
  };

  const EditItem = (userId: any) => {
    getUserDetail(userId);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedId([]);
  };
  const DeleteItem = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    fetchData(`${UserUrl}/${selectedId}/`, 'DELETE', null as any, Header)
      .then((res: any) => {
        console.log('delete:', res);
        if (!res.error) {
          deleteRowModalClose();
          getUsers();
        }
      })
      .catch(() => {});
  };

  const handleSelectAllClick = () => {
    if (selected.length === activeUsers.length) {
      setSelected([]);
      setSelectedId([]);
      setIsSelectedId([]);
    } else {
      const newSelectedIds = activeUsers.map((user) => user.id);
      setSelected(newSelectedIds);
      setSelectedId(newSelectedIds);
      setIsSelectedId(newSelectedIds.map(() => true));
    }
  };

  const handleRowSelect = (userId: string) => {
    const selectedIndex = selected.indexOf(userId);
    let newSelected: string[] = [...selected];
    let newSelectedIds: string[] = [...selectedId];
    let newIsSelectedId: boolean[] = [...isSelectedId];

    if (selectedIndex === -1) {
      newSelected.push(userId);
      newSelectedIds.push(userId);
      newIsSelectedId.push(true);
    } else {
      newSelected.splice(selectedIndex, 1);
      newSelectedIds.splice(selectedIndex, 1);
      newIsSelectedId.splice(selectedIndex, 1);
    }

    setSelected(newSelected);
    setSelectedId(newSelectedIds);
    setIsSelectedId(newIsSelectedId);
  };
  const handleDelete = (id: any) => {
    console.log(id, 's;ected');
  };
  const modalDialog = 'Are You Sure You want to delete this User?';
  const modalTitle = 'Delete User';

  const recordsList = [
    [10, '10 Records per page'],
    [20, '20 Records per page'],
    [30, '30 Records per page'],
    [40, '40 Records per page'],
    [50, '50 Records per page'],
  ];
  // console.log(!!(selectedId?.length === 0), 'asd');
  const getColumnDefs = () => {
    const baseColumns = [
      {
        headerName: 'Email Address',
        field: 'email',
        flex: 2,
        sortable: true,
        filter: true,
        domLayout: 'normal',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: '100%',
          paddingLeft: '8px',
        },
        cellRenderer: (params: any) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              sx={{ bgcolor: '#284871', width: 32, height: 32, fontSize: 14 }}
            >
              {params.value?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography
              sx={{
                color: '#1a73e8',
                cursor: 'pointer',
                textTransform: 'none',
              }}
              onClick={() => userDetail(params.data.id)}
            >
              {params.value}
            </Typography>
          </Stack>
        ),
      },
      {
        headerName: 'Mobile Number',
        field: 'phone',
        flex: 1,
        sortable: true,
        filter: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        },
      },
      {
        headerName: 'Role',
        field: 'role',
        flex: 1,
        sortable: true,
        filter: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        },
      },
    ];

    // Only add Actions column for ADMIN role
    if (user?.role === 'ADMIN') {
      baseColumns.push({
        headerName: 'Actions',
        field: 'id',
        width: 120,
        sortable: false,
        suppressClickEventBubbling: true,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        },
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  EditItem(params.value);
                }}
                sx={{ color: '#0F2A55' }} // dark-blue edit icon
              >
                <FaEdit />
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRow(params.value);
                }}
                sx={{ color: '#D32F2F' }} // red trash icon
              >
                <FaTrashAlt />
              </IconButton>
            </Stack>
          );
        },
      });
    }

    return baseColumns;
  };

  const columnDefs = getColumnDefs();
  const rowData = (tab === 'active' ? activeUsers : inactiveUsers).map((u) => ({
    email: u.user_details?.email || '—',
    phone: u.phone || '—',
    role: u.role || '—',
    id: u.user_details?.id, // Use the actual user ID, not the profile ID
    profileId: u.id, // Keep the profile ID for reference if needed
  }));

  // Export all users to Excel
  const exportExcel = async () => {
    // Decide which total to use
    const total = tab === 'active' ? activeUsersCount : inactiveUsersCount;
    if (total === 0) {
      console.warn('No rows to export.');
      return;
    }

    // Fetch every row from the API
    const offset = 0;
    const limit = total;
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') ?? '',
      org: localStorage.getItem('org') ?? '',
    };
    const res: any = await fetchData(
      `${UsersUrl}/?offset=${offset}&limit=${limit}`,
      'GET',
      null,
      Header
    );
    if (res?.error) {
      console.error('Failed to fetch all users for export');
      return;
    }

    // Flatten rows into a simple array of objects
    const list: any[] =
      tab === 'active'
        ? res.active_users.active_users
        : res.inactive_users.inactive_users;

    const rows = list.map((u) => ({
      Email: u.user_details?.email ?? '',
      Mobile:
        u.phone ||
        u.user_details?.phone ||
        u.user_details?.phone_number ||
        u.user_details?.mobile ||
        '',
      Role: u.role ?? '',
    }));

    // Create a worksheet & workbook
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Download it
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `users_${today}.xlsx`);
  };

  const gridTheme = {
    '--ag-header-background-color': '#2E4258',
    '--ag-header-foreground-color': '#FFFFFF',
    '--ag-header-border-color': '#0F2A55',
    '--ag-odd-row-background-color': '#FFFFFF',
    '--ag-even-row-background-color': '#F3F8FF',
    '--ag-row-border-color': '#E0E0E0',
  } as React.CSSProperties;
  // Center every cell both vertically and horizontally
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
      justifyContent: 'center',
    },
  };

  return (
    <Box sx={{ mt: '60px' }}>
      {/* ---------- top toolbar ---------- */}
      <CustomToolbar
        sx={{
          bgcolor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '8px 16px',
        }}
      >
        {/* LEFT: Tabs */}
        <Tabs value={tab} onChange={handleChangeTab} sx={{ mt: 0 }}>
          <CustomTab value="active" label="Active" />
          <CustomTab value="inactive" label="Inactive" sx={{ ml: 1 }} />
        </Tabs>

        {/* RIGHT: Export + Add User */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FaDownload />}
            onClick={exportExcel}
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              color: '#0F2A55',
              borderColor: '#0F2A55',
              fontWeight: 600,
              bgcolor: 'white',
              px: 2,
              '&:hover': { bgcolor: '#f0f4ff', borderColor: '#0F2A55' },
            }}
          >
            Export
          </Button>
          {/* Only show Add User button for ADMIN role */}
          {user?.role === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={onAddUser}
              sx={{
                borderRadius: '999px',
                textTransform: 'none',
                bgcolor: '#1E3A5F',
                color: 'white',
                fontWeight: 600,
                px: 2,
                '&:hover': { bgcolor: '#1E3A5F' },
              }}
            >
              Add User
            </Button>
          )}
        </Stack>
      </CustomToolbar>

      {/* ---------- grid + pagination ---------- */}
      {/* <Container maxWidth={false} disableGutters sx={{ px: 2 }}> */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ pl: 1, pr: 1, mt: 2, px: 1 }}
      >
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper
              sx={{ width: '100%', mb: 2, p: 0 }}
              elevation={0}
              square
              variant="none"
            >
              {/* 1) ag-Grid wrapper (unchanged) */}
              <Box
                className="ag-theme-alpine users-ag-theme"
                sx={{
                  width: '100%',
                  ...gridTheme,
                  '--ag-icon-color': '#FFFFFF',

                  '& .ag-root-wrapper': {
                    border: 'none',
                  },

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
                  '& .ag-row': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& .ag-cell': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingLeft: '8px',
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
                  suppressCellSelection
                  suppressCellFocus
                  rowHeight={56}
                  headerHeight={40}
                  // onFirstDataRendered={params => params.api.sizeColumnsToFit()}
                  // onGridSizeChanged={params => params.api.sizeColumnsToFit()}
                  onGridReady={(params) => {
                    setGridApi(params.api);
                    params.api.sizeColumnsToFit();
                  }}
                />
              </Box>

              {/* 2) Pagination footer (unchanged) */}
              <Box
                sx={{
                  mt: 1,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* ROWS‐PER‐PAGE */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>Rows&nbsp;per&nbsp;page:</Typography>
                  <Select
                    size="small"
                    value={
                      tab === 'active'
                        ? activeRecordsPerPage
                        : inactiveRecordsPerPage
                    }
                    onChange={(e) => {
                      const v = parseInt(
                        (e.target as HTMLSelectElement).value,
                        10
                      );
                      if (tab === 'active') {
                        setActiveRecordsPerPage(v);
                        setActiveCurrentPage(1);
                      } else {
                        setInactiveRecordsPerPage(v);
                        setInactiveCurrentPage(1);
                      }
                    }}
                    sx={{ height: 32 }}
                  >
                    {[10, 20, 30, 40, 50].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography sx={{ ml: 1 }}>
                    {`of ${
                      tab === 'active' ? activeUsersCount : inactiveUsersCount
                    } rows`}
                  </Typography>
                </Stack>

                {/* PAGE PILL NAV */}
                <Pagination
                  page={
                    tab === 'active' ? activeCurrentPage : inactiveCurrentPage
                  }
                  count={
                    tab === 'active' ? activeTotalPages : inactiveTotalPages
                  }
                  onChange={(_e, page) => {
                    if (tab === 'active') setActiveCurrentPage(page);
                    else setInactiveCurrentPage(page);
                  }}
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
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ---------- delete modal ---------- */}
      <DeleteModal
        onClose={deleteRowModalClose}
        open={deleteRowModal}
        id={selectedId}
        modalDialog={modalDialog}
        modalTitle={modalTitle}
        DeleteItem={DeleteItem}
      />
    </Box>
  );
}
