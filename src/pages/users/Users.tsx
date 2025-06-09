
// // @ts-nocheck

// import React, { SyntheticEvent, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom';
// import { Box, Button, Card, Stack, Tab, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow, Tabs, Toolbar, Typography, Paper, TableCell, IconButton, Checkbox, Tooltip, TableSortLabel, alpha, Select, MenuItem, Container } from '@mui/material'
// import { EnhancedTableHead } from '../../components/EnchancedTableHead';
// import { getComparator, stableSort } from '../../components/Sorting';
// import { DeleteModal } from '../../components/DeleteModal';
// import { Spinner } from '../../components/Spinner';
// import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
// import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
// import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
// import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
// import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
// import { FaAd, FaEdit, FaTrashAlt } from 'react-icons/fa';
// import { fetchData } from '../../components/FetchData';
// import { UsersUrl, UserUrl } from '../../services/ApiUrls';
// import { CustomTab, CustomToolbar, FabLeft, FabRight } from '../../styles/CssStyled';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';



// interface HeadCell {
//     disablePadding: boolean;
//     id: any;
//     label: string;
//     numeric: boolean;
// }

// const headCells: readonly HeadCell[] = [
//     // {
//     //     id: 'user_name',
//     //     numeric: false,
//     //     disablePadding: false,
//     //     label: 'User Name'
//     // },
//     // {
//     //     id: 'first_name',
//     //     numeric: false,
//     //     disablePadding: false,
//     //     label: 'First Name'
//     // },
//     // {
//     //     id: 'last_name',
//     //     numeric: true,
//     //     disablePadding: false,
//     //     label: 'Last Name'
//     // },
//     {
//         id: 'email',
//         numeric: true,
//         disablePadding: false,
//         label: 'Email Address'
//     }, {
//         id: 'phone',
//         numeric: true,
//         disablePadding: false,
//         label: 'Mobile Number'
//     },
//     {
//         id: 'role',
//         numeric: true,
//         disablePadding: false,
//         label: 'Role'
//     },
//     // {
//     //     id: 'user_type',
//     //     numeric: true,
//     //     disablePadding: false,
//     //     label: 'User Type'
//     // },
//     {
//         id: 'actions',
//         numeric: true,
//         disablePadding: false,
//         label: 'Actions'
//     }
// ]

// type Item = {
//     id: string;
//     // Other properties
// };
// export default function Users() {
//     const navigate = useNavigate()
//     const [tab, setTab] = useState('active');
//     const [loading, setLoading] = useState(true);
//     const [order, setOrder] = useState('asc')
//     const [orderBy, setOrderBy] = useState('Website')
//     // const [selected, setSelected] = useState([])
//     // const [selected, setSelected] = useState<string[]>([]);

//     // const [selectedId, setSelectedId] = useState([])
//     // const [isSelectedId, setIsSelectedId] = useState([])
//     const [deleteItems, setDeleteItems] = useState([])
//     const [page, setPage] = useState(0)
//     const [values, setValues] = useState(10)
//     const [dense] = useState(false)
//     const [rowsPerPage, setRowsPerPage] = useState(10)
//     const [usersData, setUsersData] = useState([])
//     const [deleteItemId, setDeleteItemId] = useState('')
//     const [loader, setLoader] = useState(true)
//     const [isDelete, setIsDelete] = useState(false)
//     const [activeUsers, setActiveUsers] = useState<Item[]>([])
//     console.log(activeUsers)
//     const rowData = activeUsers?.map((user: any) => ({
//         id: user.id,
//         email: user.user_details?.email || '',
//         phone: user.phone || '---',
//         role: user.role,
//         profilePic: user.user_details?.profile_pic,
//         isActive: user.user_details?.is_active,
//     }));
//     console.log("rowData:", rowData); // Check if data is present
//     const [activeUsersCount, setActiveUsersCount] = useState(0)
//     const [activeUsersOffset, setActiveUsersOffset] = useState(0)
//     const [inactiveUsers, setInactiveUsers] = useState([])
//     const [InactiveUsersCount, setInactiveUsersCount] = useState(0)
//     const [inactiveUsersOffset, setInactiveUsersOffset] = useState(0)
//     const [deleteRowModal, setDeleteRowModal] = useState(false)
//     // const [selectedId, setSelectedId] = useState('')

//     const [selectOpen, setSelectOpen] = useState(false);
//     const [selected, setSelected] = useState<string[]>([]);
//     const [selectedId, setSelectedId] = useState<string[]>([]);
//     const [isSelectedId, setIsSelectedId] = useState<boolean[]>([]);

//     const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
//     const [activeRecordsPerPage, setActiveRecordsPerPage] = useState<number>(10);
//     const [activeTotalPages, setActiveTotalPages] = useState<number>(0);
//     const [activeLoading, setActiveLoading] = useState(true);


//     const [inactiveCurrentPage, setInactiveCurrentPage] = useState<number>(1);
//     const [inactiveRecordsPerPage, setInactiveRecordsPerPage] = useState<number>(10);
//     const [inactiveTotalPages, setInactiveTotalPages] = useState<number>(0);
//     const [inactiveLoading, setInactiveLoading] = useState(true);

//     useEffect(() => {
//         getUsers()
//     }, [activeCurrentPage, activeRecordsPerPage, inactiveCurrentPage, inactiveRecordsPerPage]);

//     const handleChangeTab = (e: SyntheticEvent, val: any) => {
//         setTab(val)
//     }

//     const handleChangePage = (event: unknown, newPage: number) => {
//         setPage(newPage);
//     };


//     const getUsers = async () => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         try {
//             const activeOffset = (activeCurrentPage - 1) * activeRecordsPerPage;
//             const inactiveOffset = (inactiveCurrentPage - 1) * inactiveRecordsPerPage;
//             await fetchData(`${UsersUrl}/?offset=${tab === "active" ? activeOffset : inactiveOffset}&limit=${tab === "active" ? activeRecordsPerPage : inactiveRecordsPerPage}`, 'GET', null as any, Header)
//                 // fetchData(`${UsersUrl}/`, 'GET', null as any, Header)
//                 .then((res: any) => {
//                     if (!res.error) {
//                         // console.log(res, 'users')
//                         setActiveUsers(res?.active_users?.active_users)
//                         setActiveTotalPages(Math.ceil(res?.active_users?.active_users_count / activeRecordsPerPage));
//                         setActiveUsersOffset(res?.active_users?.offset)
//                         setInactiveUsers(res?.inactive_users?.inactive_users)
//                         setInactiveTotalPages(Math.ceil(res?.inactive_users?.inactive_users_count / inactiveRecordsPerPage));
//                         setInactiveUsersOffset(res?.inactive_users?.offset)
//                         setLoading(false)
//                         // setUsersData(
//                         //   ...usersData, {
//                         //     active_users: data.active_users.active_users,
//                         //     active_users_count: data.active_users.active_users_count,
//                         //     inactive_users_count: data.inactive_users.inactive_users_count,
//                         //     inactive_users: data.inactive_users.inactive_users,
//                         //     roles: data.roles,
//                         //     status: data.status
//                         //   }
//                         // )
//                         // setLoader(false)
//                         // setactiveOffset(initial ? 0 : activeOffset)
//                         // setinactiveOffset(initial ? 0 : inactiveOffset)
//                         // setInitial(false)
//                     }
//                 })
//         }
//         catch (error) {
//             console.error('Error fetching data:', error);
//         }
//     }

//     const userDetail = (userId: any) => {
//         navigate(`/app/users/user-details`, { state: { userId, detail: true } })
//     }
//     const handleRecordsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
//         if (tab == 'active') {
//             setActiveLoading(true)
//             setActiveRecordsPerPage(parseInt(event.target.value));
//             setActiveCurrentPage(1);
//         } else {
//             setInactiveLoading(true)
//             setInactiveRecordsPerPage(parseInt(event.target.value));
//             setInactiveCurrentPage(1);
//         }

//     };
//     const handlePreviousPage = () => {
//         if (tab == 'active') {
//             setActiveLoading(true)
//             setActiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
//         } else {
//             setInactiveLoading(true)
//             setInactiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
//         }
//     };

//     const handleNextPage = () => {
//         if (tab == 'active') {
//             setActiveLoading(true)
//             setActiveCurrentPage((prevPage) => Math.min(prevPage + 1, activeTotalPages));
//         } else {
//             setInactiveLoading(true)
//             setInactiveCurrentPage((prevPage) => Math.min(prevPage + 1, inactiveTotalPages));
//         }
//     };
//     const handleRequestSort = (event: any, property: any) => {
//         const isAsc = orderBy === property && order === 'asc'
//         setOrder(isAsc ? 'desc' : 'asc')
//         setOrderBy(property)
//     }

//     // const handleSelectAllClick = (event: any) => {
//     // if (event.target.checked) {
//     //     const newSelected = rows.map((n) => n.name);
//     //     setSelected(newSelected);
//     //     return;
//     //   }
//     //   setSelected([]);
//     // }
//     // const selected: string[] = [...];1
//     const handleClick = (event: React.MouseEvent<unknown>, name: any) => {
//         // const selectedIndex = selected.indexOf(name as string);
//         // let newSelected: string[] = [];

//         // if (selectedIndex === -1) {
//         //     newSelected = newSelected.concat(selected, name);
//         // } else if (selectedIndex === 0) {
//         //     newSelected = newSelected.concat(selected.slice(1));
//         // } else if (selectedIndex === selected.length - 1) {
//         //     newSelected = newSelected.concat(selected.slice(0, -1));
//         // } else if (selectedIndex > 0) {
//         //     newSelected = newSelected.concat(
//         //         selected.slice(0, selectedIndex),
//         //         selected.slice(selectedIndex + 1),
//         //     );
//         // }

//         // setSelected(newSelected);
//     };



//     // const isSelected = (name: string) => selected.indexOf(name) !== -1;

//     type SelectedItem = string[];
//     const isSelected = (name: string, selected: SelectedItem): boolean => {
//         return selected.indexOf(name) !== -1;
//     };



//     const deleteItemBox = (deleteId: any) => {
//         setDeleteItemId(deleteId)
//         setIsDelete(!isDelete)
//     }

//     const onclose = () => {
//         setIsDelete(!isDelete)
//     }

//     const onDelete = (id: any) => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         fetchData(`${UsersUrl}/${id}/`, 'delete', null as any, Header)
//             .then((data) => {
//                 if (!data.error) {
//                     getUsers()
//                     setIsDelete(false)
//                 }
//             })
//             .catch(() => {
//             })
//     }

//     const emptyRows =
//         page > 0 ? Math.max(0, (1 + page) * rowsPerPage - 7) : 0
//     // (tab === 0 ? accountData.accountLength : accountData.closed_accounts_length)

//     const onAddUser = () => {
//         if (!loading) {
//             navigate('/app/users/add-users')
//         }
//         // navigate('/users/add-users', {
//         //   state: {
//         //     roles: usersData.roles,
//         //     status: usersData.status
//         //   }
//         // })
//     }
//     const deleteRow = (id: any) => {
//         setSelectedId(id)
//         setDeleteRowModal(!deleteRowModal)
//     }

//     const getUserDetail = (id: any) => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         fetchData(`${UserUrl}/${id}/`, 'GET', null as any, Header)
//             .then((res) => {
//                 console.log(res, 'res');
//                 if (!res.error) {
//                     const data = res?.data?.profile_obj
//                     navigate('/app/users/edit-user', {
//                         state: {
//                             value: {
//                                 email: data?.user_details?.email,
//                                 role: data?.role,
//                                 phone: data?.phone,
//                                 alternate_phone: data?.alternate_phone,
//                                 address_line: data?.address?.address_line,
//                                 street: data?.address?.street,
//                                 city: data?.address?.city,
//                                 state: data?.address?.state,
//                                 pincode: data?.address?.postcode,
//                                 country: data?.address?.country,
//                                 profile_pic: data?.user_details?.profile_pic,
//                                 has_sales_access: data?.has_sales_access,
//                                 has_marketing_access: data?.has_marketing_access,
//                                 is_organization_admin: data?.is_organization_admin,
//                             }, id: id, edit: true
//                         }
//                     })
//                 }
//             })
//     }

//     const EditItem = (userId: any) => {
//         getUserDetail(userId)
//     }
//     // const [selectedRows, setSelectedRows] = useState([]);
//     // const [selectedRowId, setSelectedRowId] = useState(null);

//     // const handleCheckboxClick = (rowId) => {
//     //     const isSelected = selectedRows.includes(rowId);
//     //     let updatedSelectedRows;

//     //     if (isSelected) {
//     //       updatedSelectedRows = selectedRows.filter((id) => id !== rowId);
//     //     } else {
//     //       updatedSelectedRows = [...selectedRows, rowId];
//     //     }

//     //     setSelectedRows(updatedSelectedRows);
//     //   };
//     const deleteRowModalClose = () => {
//         setDeleteRowModal(false)
//         setSelectedId([])
//     }
//     const DeleteItem = () => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         fetchData(`${UserUrl}/${selectedId}/`, 'DELETE', null as any, Header)
//             .then((res: any) => {
//                 console.log('delete:', res);
//                 if (!res.error) {
//                     deleteRowModalClose()
//                     getUsers()
//                 }
//             })
//             .catch(() => {
//             })
//     }


//     const handleSelectAllClick = () => {
//         if (selected.length === activeUsers.length) {
//             setSelected([]);
//             setSelectedId([]);
//             setIsSelectedId([]);
//         } else {
//             const newSelectedIds = activeUsers.map((user) => user.id);
//             setSelected(newSelectedIds);
//             setSelectedId(newSelectedIds);
//             setIsSelectedId(newSelectedIds.map(() => true));
//         }
//     };

//     const handleRowSelect = (userId: string) => {
//         const selectedIndex = selected.indexOf(userId);
//         let newSelected: string[] = [...selected];
//         let newSelectedIds: string[] = [...selectedId];
//         let newIsSelectedId: boolean[] = [...isSelectedId];

//         if (selectedIndex === -1) {
//             newSelected.push(userId);
//             newSelectedIds.push(userId);
//             newIsSelectedId.push(true);
//         } else {
//             newSelected.splice(selectedIndex, 1);
//             newSelectedIds.splice(selectedIndex, 1);
//             newIsSelectedId.splice(selectedIndex, 1);
//         }

//         setSelected(newSelected);
//         setSelectedId(newSelectedIds);
//         setIsSelectedId(newIsSelectedId);
//     };
//     const handleDelete = (id: any) => {
//         console.log(id, 's;ected')
//     }
//     const modalDialog = 'Are You Sure You want to delete this User?'
//     const modalTitle = 'Delete User'

//     const recordsList = [[10, '10 Records per page'], [20, '20 Records per page'], [30, '30 Records per page'], [40, '40 Records per page'], [50, '50 Records per page']]
//     // console.log(!!(selectedId?.length === 0), 'asd');

//     return (
//         <Box sx={{ mt: '60px' }}>
//             <CustomToolbar>
//                 <Tabs defaultValue={tab} onChange={handleChangeTab} sx={{ mt: '26px' }}>
//                     <CustomTab value="active" label="Active"
//                         sx={{
//                             backgroundColor: tab === 'active' ? '#F0F7FF' : '#284871',
//                             color: tab === 'active' ? '#3f51b5' : 'white',
//                         }}></CustomTab>
//                     <CustomTab value="inactive" label="In Active"
//                         sx={{
//                             backgroundColor: tab === 'inactive' ? '#F0F7FF' : '#284871',
//                             color: tab === 'inactive' ? '#3f51b5' : 'white',
//                             ml: '5px',
//                         }}
//                     ></CustomTab>
//                 </Tabs>

//                 <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
//                     <Select
//                         value={tab === 'active' ? activeRecordsPerPage : inactiveRecordsPerPage}
//                         onChange={(e: any) => handleRecordsPerPage(e)}
//                         open={selectOpen}
//                         onOpen={() => setSelectOpen(true)}
//                         onClose={() => setSelectOpen(false)}
//                         className={`custom-select`}
//                         onClick={() => setSelectOpen(!selectOpen)}
//                         IconComponent={() => (
//                             <div onClick={() => setSelectOpen(!selectOpen)} className="custom-select-icon">
//                                 {selectOpen ? <FiChevronUp style={{ marginTop: '12px' }} /> : <FiChevronDown style={{ marginTop: '12px' }} />}
//                             </div>
//                         )}
//                         sx={{
//                             '& .MuiSelect-select': { overflow: 'visible !important' }
//                         }}
//                     >
//                         {recordsList?.length && recordsList.map((item: any, i: any) => (
//                             <MenuItem key={i} value={item[0]} >
//                                 {item[1]}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                     <Box sx={{ borderRadius: '7px', backgroundColor: 'white', height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', mr: 1, p: '0px' }}>
//                         <FabLeft onClick={handlePreviousPage} disabled={tab === 'active' ? activeCurrentPage === 1 : inactiveCurrentPage === 1}>
//                             <FiChevronLeft style={{ height: '15px' }} />
//                         </FabLeft>
//                         <Typography sx={{ mt: 0, textTransform: 'lowercase', fontSize: '15px', color: '#1A3353', textAlign: 'center' }}>
//                             {tab === 'active' ? `${activeCurrentPage} to ${activeTotalPages}` : `${inactiveCurrentPage} to ${inactiveTotalPages}`}

//                         </Typography>
//                         <FabRight onClick={handleNextPage} disabled={tab === 'active' ? (activeCurrentPage === activeTotalPages) : (inactiveCurrentPage === inactiveTotalPages)}>
//                             <FiChevronRight style={{ height: '15px' }} />
//                         </FabRight>
//                     </Box>
//                     <Button
//                         variant='contained'
//                         startIcon={<FiPlus className='plus-icon' />}
//                         onClick={onAddUser}
//                         className={'add-button'}
//                     >
//                         Add User
//                     </Button>
//                 </Stack>
//             </CustomToolbar>
//             <Container sx={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}>
//                 <Box sx={{ width: '100%', minWidth: '100%', m: '15px 0px 0px 0px' }}>
//                     <Paper sx={{ width: 'cal(100%-15px)', mb: 2, p: '0px 15px 15px 15px' }}>
//                         {/* <Toolbar sx={{pl: { sm: 2 },pr: { xs: 1, sm: 1 }}}>
//                             <Tooltip title='Delete'>
//                                 <Button
//                                     variant='outlined'
//                                     onClick={() => !!(selectedId?.length !== 0) && handleDelete(selectedId)}
//                                     startIcon={<FaTrashAlt color='red' style={{ width: '12px' }} />}
//                                     size='small'
//                                     color='error'
//                                     sx={{
//                                         // opacity: 0.7,
//                                         fontWeight: 'bold',
//                                         textTransform: 'capitalize',
//                                         color: 'red',
//                                         borderColor: 'darkgrey',
//                                     }}
//                                 >
//                                     Delete
//                                 </Button>
//                             </Tooltip>
//                             {selected.length > 0 ? (
//                                 <Typography
//                                     sx={{ flex: '1 1 100%', margin: '5px' }}
//                                     color='inherit'
//                                     variant='subtitle1'
//                                     component='div'
//                                 >
//                                     {selected.length} selected
//                                 </Typography>
//                             ) : (
//                                 ''
//                             )}
//                         </Toolbar> */}
//                         <div className="ag-theme-alpine" style={{ height: "400px", width: '100%' }}>
//                             <AgGridReact
//                                 rowData={rowData}
//                                 columnDefs={[
//                                     {
//                                         field: 'email',
//                                         headerName: 'Email Address',
//                                         flex: 1,
//                                         cellRenderer: (params: any) => (
//                                             <a href={`mailto:${params.value}`} style={{ color: '#1a73e8' }}>
//                                                 {params.value}
//                                             </a>
//                                         )
//                                     },
//                                     {
//                                         field: 'phone',
//                                         headerName: 'Mobile Number',
//                                         flex: 1
//                                     },
//                                     {
//                                         field: 'role',
//                                         headerName: 'Role',
//                                         flex: 1
//                                     },
//                                     {
//                                         headerName: 'Actions',
//                                         field: 'actions',
//                                         flex: 1,
//                                         cellRenderer: (params: any) => (
//                                             <>
//                                                 <IconButton onClick={() => handleDelete(params.data.id)}>
//                                                     <FaTrashAlt />
//                                                 </IconButton>
//                                             </>
//                                         )
//                                     }
//                                 ]}
//                                 pagination={true}
//                                 paginationPageSize={10}
//                             />
//                         </div>


//                     </Paper>
//                 </Box>
//             </Container>
//             <DeleteModal
//                 onClose={deleteRowModalClose}
//                 open={deleteRowModal}
//                 id={selectedId}
//                 modalDialog={modalDialog}
//                 modalTitle={modalTitle}
//                 DeleteItem={DeleteItem}
//             />
//         </Box>
//     )
// }

// @ts-nocheck
// import React, { SyntheticEvent, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom';
// import { Box, Button, Card, Stack, Tab, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow, Tabs, Toolbar, Typography, Paper, TableCell, IconButton, Checkbox, Tooltip, TableSortLabel, alpha, Select, MenuItem, Container } from '@mui/material'
// import { EnhancedTableHead } from '../../components/EnchancedTableHead';
// import { getComparator, stableSort } from '../../components/Sorting';
// import { DeleteModal } from '../../components/DeleteModal';
// import { Spinner } from '../../components/Spinner';
// import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
// import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
// import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
// import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
// import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
// import { FaAd, FaEdit, FaTrashAlt } from 'react-icons/fa';
// import { fetchData } from '../../components/FetchData';
// import { UsersUrl, UserUrl } from '../../services/ApiUrls';
// import { CustomTab, CustomToolbar, FabLeft, FabRight } from '../../styles/CssStyled';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';

// interface HeadCell {
//     disablePadding: boolean;
//     id: any;
//     label: string;
//     numeric: boolean;
// }

// const headCells: readonly HeadCell[] = [
//     {
//         id: 'email',
//         numeric: true,
//         disablePadding: false,
//         label: 'Email Address'
//     }, {
//         id: 'phone',
//         numeric: true,
//         disablePadding: false,
//         label: 'Mobile Number'
//     },
//     {
//         id: 'role',
//         numeric: true,
//         disablePadding: false,
//         label: 'Role'
//     },
//     {
//         id: 'actions',
//         numeric: true,
//         disablePadding: false,
//         label: 'Actions'
//     }
// ]

// type Item = {
//     id: string;
//     // Other properties
// };

// export default function Users() {
//     const navigate = useNavigate()
//     const [tab, setTab] = useState('active');
//     const [loading, setLoading] = useState(true);
//     const [order, setOrder] = useState('asc')
//     const [orderBy, setOrderBy] = useState('Website')
//     const [deleteItems, setDeleteItems] = useState([])
//     const [page, setPage] = useState(0)
//     const [values, setValues] = useState(10)
//     const [dense] = useState(false)
//     const [rowsPerPage, setRowsPerPage] = useState(10)
//     const [usersData, setUsersData] = useState([])
//     const [deleteItemId, setDeleteItemId] = useState('')
//     const [loader, setLoader] = useState(true)
//     const [isDelete, setIsDelete] = useState(false)
//     const [activeUsers, setActiveUsers] = useState<Item[]>([])
//     const [activeUsersCount, setActiveUsersCount] = useState(0)
//     const [activeUsersOffset, setActiveUsersOffset] = useState(0)
//     const [inactiveUsers, setInactiveUsers] = useState([])
//     const [InactiveUsersCount, setInactiveUsersCount] = useState(0)
//     const [inactiveUsersOffset, setInactiveUsersOffset] = useState(0)
//     const [deleteRowModal, setDeleteRowModal] = useState(false)

//     const [selectOpen, setSelectOpen] = useState(false);
//     const [selected, setSelected] = useState<string[]>([]);
//     const [selectedId, setSelectedId] = useState<string[]>([]);
//     const [isSelectedId, setIsSelectedId] = useState<boolean[]>([]);

//     const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
//     const [activeRecordsPerPage, setActiveRecordsPerPage] = useState<number>(10);
//     const [activeTotalPages, setActiveTotalPages] = useState<number>(0);
//     const [activeLoading, setActiveLoading] = useState(true);

//     const [inactiveCurrentPage, setInactiveCurrentPage] = useState<number>(1);
//     const [inactiveRecordsPerPage, setInactiveRecordsPerPage] = useState<number>(10);
//     const [inactiveTotalPages, setInactiveTotalPages] = useState<number>(0);
//     const [inactiveLoading, setInactiveLoading] = useState(true);

//     useEffect(() => {
//         getUsers()
//     }, [activeCurrentPage, activeRecordsPerPage, inactiveCurrentPage, inactiveRecordsPerPage]);

//     const handleChangeTab = (e: SyntheticEvent, val: any) => {
//         setTab(val)
//     }

//     const handleChangePage = (event: unknown, newPage: number) => {
//         setPage(newPage);
//     };

//     const getUsers = async () => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         try {
//             const activeOffset = (activeCurrentPage - 1) * activeRecordsPerPage;
//             const inactiveOffset = (inactiveCurrentPage - 1) * inactiveRecordsPerPage;
//             await fetchData(`${UsersUrl}/?offset=${tab === "active" ? activeOffset : inactiveOffset}&limit=${tab === "active" ? activeRecordsPerPage : inactiveRecordsPerPage}`, 'GET', null as any, Header)
//                 .then((res: any) => {
//                     if (!res.error) {
//                         console.log(res, 'users')
//                         setActiveUsers(res?.active_users?.active_users || [])
//                         setActiveTotalPages(Math.ceil(res?.active_users?.active_users_count / activeRecordsPerPage));
//                         setActiveUsersOffset(res?.active_users?.offset)
//                         setInactiveUsers(res?.inactive_users?.inactive_users || [])
//                         setInactiveTotalPages(Math.ceil(res?.inactive_users?.inactive_users_count / inactiveRecordsPerPage));
//                         setInactiveUsersOffset(res?.inactive_users?.offset)
//                         setLoading(false)
//                     }
//                 })
//         }
//         catch (error) {
//             console.error('Error fetching data:', error);
//         }
//     }

//     const userDetail = (userId: any) => {
//         navigate(`/app/users/user-details`, { state: { userId, detail: true } })
//     }

//     const handleRecordsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
//         if (tab == 'active') {
//             setActiveLoading(true)
//             setActiveRecordsPerPage(parseInt(event.target.value));
//             setActiveCurrentPage(1);
//         } else {
//             setInactiveLoading(true)
//             setInactiveRecordsPerPage(parseInt(event.target.value));
//             setInactiveCurrentPage(1);
//         }
//     };

//     const handlePreviousPage = () => {
//         if (tab == 'active') {
//             setActiveLoading(true)
//             setActiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
//         } else {
//             setInactiveLoading(true)
//             setInactiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
//         }
//     };

//     const handleNextPage = () => {
//         if (tab == 'active') {
//             setActiveLoading(true)
//             setActiveCurrentPage((prevPage) => Math.min(prevPage + 1, activeTotalPages));
//         } else {
//             setInactiveLoading(true)
//             setInactiveCurrentPage((prevPage) => Math.min(prevPage + 1, inactiveTotalPages));
//         }
//     };

//     const handleRequestSort = (event: any, property: any) => {
//         const isAsc = orderBy === property && order === 'asc'
//         setOrder(isAsc ? 'desc' : 'asc')
//         setOrderBy(property)
//     }

//     const handleClick = (event: React.MouseEvent<unknown>, name: any) => {
//         // Handle selection logic here
//     };

//     const isSelected = (name: string, selected: string[]): boolean => {
//         return selected.indexOf(name) !== -1;
//     };

//     const deleteItemBox = (deleteId: any) => {
//         setDeleteItemId(deleteId)
//         setIsDelete(!isDelete)
//     }

//     const onclose = () => {
//         setIsDelete(!isDelete)
//     }

//     const onDelete = (id: any) => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         fetchData(`${UsersUrl}/${id}/`, 'delete', null as any, Header)
//             .then((data) => {
//                 if (!data.error) {
//                     getUsers()
//                     setIsDelete(false)
//                 }
//             })
//             .catch(() => {
//             })
//     }

//     const emptyRows =
//         page > 0 ? Math.max(0, (1 + page) * rowsPerPage - 7) : 0

//     const onAddUser = () => {
//         if (!loading) {
//             navigate('/app/users/add-users')
//         }
//     }

//     const deleteRow = (id: any) => {
//         setSelectedId(id)
//         setDeleteRowModal(!deleteRowModal)
//     }

//     const getUserDetail = (id: any) => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         fetchData(`${UserUrl}/${id}/`, 'GET', null as any, Header)
//             .then((res) => {
//                 console.log(res, 'res');
//                 if (!res.error) {
//                     const data = res?.data?.profile_obj
//                     navigate('/app/users/edit-user', {
//                         state: {
//                             value: {
//                                 email: data?.user_details?.email,
//                                 role: data?.role,
//                                 phone: data?.phone,
//                                 alternate_phone: data?.alternate_phone,
//                                 address_line: data?.address?.address_line,
//                                 street: data?.address?.street,
//                                 city: data?.address?.city,
//                                 state: data?.address?.state,
//                                 pincode: data?.address?.postcode,
//                                 country: data?.address?.country,
//                                 profile_pic: data?.user_details?.profile_pic,
//                                 has_sales_access: data?.has_sales_access,
//                                 has_marketing_access: data?.has_marketing_access,
//                                 is_organization_admin: data?.is_organization_admin,
//                             }, id: id, edit: true
//                         }
//                     })
//                 }
//             })
//     }

//     const EditItem = (userId: any) => {
//         getUserDetail(userId)
//     }

//     const deleteRowModalClose = () => {
//         setDeleteRowModal(false)
//         setSelectedId([])
//     }

//     const DeleteItem = () => {
//         const Header = {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: localStorage.getItem('Token'),
//             org: localStorage.getItem('org')
//         }
//         fetchData(`${UserUrl}/${selectedId}/`, 'DELETE', null as any, Header)
//             .then((res: any) => {
//                 console.log('delete:', res);
//                 if (!res.error) {
//                     deleteRowModalClose()
//                     getUsers()
//                 }
//             })
//             .catch(() => {
//             })
//     }

//     const handleSelectAllClick = () => {
//         if (selected.length === activeUsers.length) {
//             setSelected([]);
//             setSelectedId([]);
//             setIsSelectedId([]);
//         } else {
//             const newSelectedIds = activeUsers.map((user) => user.id);
//             setSelected(newSelectedIds);
//             setSelectedId(newSelectedIds);
//             setIsSelectedId(newSelectedIds.map(() => true));
//         }
//     };

//     const handleRowSelect = (userId: string) => {
//         const selectedIndex = selected.indexOf(userId);
//         let newSelected: string[] = [...selected];
//         let newSelectedIds: string[] = [...selectedId];
//         let newIsSelectedId: boolean[] = [...isSelectedId];

//         if (selectedIndex === -1) {
//             newSelected.push(userId);
//             newSelectedIds.push(userId);
//             newIsSelectedId.push(true);
//         } else {
//             newSelected.splice(selectedIndex, 1);
//             newSelectedIds.splice(selectedIndex, 1);
//             newIsSelectedId.splice(selectedIndex, 1);
//         }

//         setSelected(newSelected);
//         setSelectedId(newSelectedIds);
//         setIsSelectedId(newIsSelectedId);
//     };

//     const handleDelete = (id: any) => {
//         console.log(id, 'selected')
//     }

//     const modalDialog = 'Are You Sure You want to delete this User?'
//     const modalTitle = 'Delete User'

//     const recordsList = [[10, '10 Records per page'], [20, '20 Records per page'], [30, '30 Records per page'], [40, '40 Records per page'], [50, '50 Records per page']]

//     // Prepare row data for AG Grid
//     const rowData = activeUsers?.map((user: any) => ({
//         id: user.id,
//         email: user.user_details?.email || '',
//         phone: user.phone || '---',
//         role: user.role,
//         profilePic: user.user_details?.profile_pic,
//         isActive: user.user_details?.is_active,
//     }));

//     // Column definitions for AG Grid
//     const columnDefs = [
//         {
//             field: 'email',
//             headerName: 'Email Address',
//             flex: 1,
//             cellRenderer: (params: any) => (
//                 <a href={`mailto:${params.value}`} style={{ color: '#1a73e8' }}>
//                     {params.value}
//                 </a>
//             )
//         },
//         {
//             field: 'phone',
//             headerName: 'Mobile Number',
//             flex: 1
//         },
//         {
//             field: 'role',
//             headerName: 'Role',
//             flex: 1
//         },
//         {
//             headerName: 'Actions',
//             field: 'id',
//             flex: 1,
//             cellRenderer: (params: any) => (
//                 <>
//                     <IconButton onClick={() => EditItem(params.value)}>
//                         <FaEdit color='primary' />
//                     </IconButton>
//                     <IconButton onClick={() => deleteRow(params.value)}>
//                         <FaTrashAlt color='error' />
//                     </IconButton>
//                 </>
//             )
//         }
//     ];

//     return (
//         <Box sx={{ mt: '60px' }}>
//             <CustomToolbar>
//                 <Tabs value={tab} onChange={handleChangeTab} sx={{ mt: '26px' }}>
//                     <CustomTab value="active" label="Active"
//                         sx={{
//                             backgroundColor: tab === 'active' ? '#F0F7FF' : '#284871',
//                             color: tab === 'active' ? '#3f51b5' : 'white',
//                         }} />
//                     <CustomTab value="inactive" label="In Active"
//                         sx={{
//                             backgroundColor: tab === 'inactive' ? '#F0F7FF' : '#284871',
//                             color: tab === 'inactive' ? '#3f51b5' : 'white',
//                             ml: '5px',
//                         }}
//                     />
//                 </Tabs>

//                 <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
//                     <Select
//                         value={tab === 'active' ? activeRecordsPerPage : inactiveRecordsPerPage}
//                         onChange={(e: any) => handleRecordsPerPage(e)}
//                         open={selectOpen}
//                         onOpen={() => setSelectOpen(true)}
//                         onClose={() => setSelectOpen(false)}
//                         className={`custom-select`}
//                         onClick={() => setSelectOpen(!selectOpen)}
//                         IconComponent={() => (
//                             <div onClick={() => setSelectOpen(!selectOpen)} className="custom-select-icon">
//                                 {selectOpen ? <FiChevronUp style={{ marginTop: '12px' }} /> : <FiChevronDown style={{ marginTop: '12px' }} />}
//                             </div>
//                         )}
//                         sx={{
//                             '& .MuiSelect-select': { overflow: 'visible !important' }
//                         }}
//                     >
//                         {recordsList?.map((item: any, i: any) => (
//                             <MenuItem key={i} value={item[0]}>
//                                 {item[1]}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                     <Box sx={{ borderRadius: '7px', backgroundColor: 'white', height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', mr: 1, p: '0px' }}>
//                         <FabLeft onClick={handlePreviousPage} disabled={tab === 'active' ? activeCurrentPage === 1 : inactiveCurrentPage === 1}>
//                             <FiChevronLeft style={{ height: '15px' }} />
//                         </FabLeft>
//                         <Typography sx={{ mt: 0, textTransform: 'lowercase', fontSize: '15px', color: '#1A3353', textAlign: 'center' }}>
//                             {tab === 'active' ? `${activeCurrentPage} to ${activeTotalPages}` : `${inactiveCurrentPage} to ${inactiveTotalPages}`}
//                         </Typography>
//                         <FabRight onClick={handleNextPage} disabled={tab === 'active' ? (activeCurrentPage === activeTotalPages) : (inactiveCurrentPage === inactiveTotalPages)}>
//                             <FiChevronRight style={{ height: '15px' }} />
//                         </FabRight>
//                     </Box>
//                     <Button
//                         variant='contained'
//                         startIcon={<FiPlus className='plus-icon' />}
//                         onClick={onAddUser}
//                         className={'add-button'}
//                     >
//                         Add User
//                     </Button>
//                 </Stack>
//             </CustomToolbar>

//             <Container sx={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}>
//                 <Box sx={{ width: '100%', minWidth: '100%', m: '15px 0px 0px 0px' }}>
//                     <Paper sx={{ width: 'calc(100%-15px)', mb: 2, p: '0px 15px 15px 15px' }}>
//                         {/* AG Grid Table */}
//                         <div 
//                             className="ag-theme-alpine" 
//                             style={{ 
//                                 height: '500px', 
//                                 width: '100%',
//                                 marginTop: '15px'
//                             }}
//                         >
//                             <AgGridReact
//                                 rowData={rowData}
//                                 columnDefs={columnDefs}
//                                 pagination={true}
//                                 paginationPageSize={10}
//                                 domLayout='autoHeight'
//                                 defaultColDef={{
//                                     resizable: true,
//                                     sortable: true,
//                                     filter: true,
//                                 }}
//                             />
//                         </div>
//                     </Paper>
//                 </Box>
//             </Container>

//             <DeleteModal
//                 onClose={deleteRowModalClose}
//                 open={deleteRowModal}
//                 id={selectedId}
//                 modalDialog={modalDialog}
//                 modalTitle={modalTitle}
//                 DeleteItem={DeleteItem}
//             />
//         </Box>
//     )
// }



import React, {
    SyntheticEvent,
    useEffect,
    useState,
    useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Container,
    IconButton,
    MenuItem,
    Paper,
    Pagination,
    Select,
    Stack,
    Tabs,
    Typography,
} from '@mui/material';
import {
    FiPlus,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
    FiChevronDown,
    FiDownload,
} from 'react-icons/fi';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

import {
    CustomTab,
    CustomToolbar,
    FabLeft,
    FabRight,
} from '../../styles/CssStyled';
import { DeleteModal } from '../../components/DeleteModal';
import { fetchData } from '../../components/FetchData';
import { UsersUrl, UserUrl } from '../../services/ApiUrls';
import * as XLSX from 'xlsx';

/* ---------- types ---------- */
interface Item {
    id: string;
    [key: string]: any;
}

/* ---------- component ---------- */
export default function Users() {
    /* -------- state -------- */
    const [tab, setTab] = useState<'active' | 'inactive'>('active');

    const [activeCur, setActiveCur] = useState(1);
    const [activeRpp, setActiveRpp] = useState(10);
    const [activePages, setActivePages] = useState(0);

    const [inactiveCur, setInactiveCur] = useState(1);
    const [inactiveRpp, setInactiveRpp] = useState(10);
    const [inactivePages, setInactivePages] = useState(0);

    const [activeUsers, setActiveUsers] = useState<Item[]>([]);
    const [inactiveUsers, setInactiveUsers] = useState<Item[]>([]);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string>('');
    const [selectOpen, setSelectOpen] = useState(false);

    const navigate = useNavigate();
    const gridRef = useRef<AgGridReact>(null);        // ← ref for grid API
    const [activeTotalRows, setActiveTotalRows] = useState(0);
    const [inactiveTotalRows, setInactiveTotalRows] = useState(0);


    /* -------- helpers -------- */
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token') ?? '',
        org: localStorage.getItem('org') ?? '',
    };

    const getUsers = async () => {
        const offset =
            tab === 'active'
                ? (activeCur - 1) * activeRpp
                : (inactiveCur - 1) * inactiveRpp;
        const limit = tab === 'active' ? activeRpp : inactiveRpp;

        const res: any = await fetchData(
            `${UsersUrl}/?offset=${offset}&limit=${limit}`,
            'GET',
            null,
            headers,
        );
        if (res?.error) return;

        setActiveUsers(res?.active_users?.active_users || []);
        setActivePages(
            Math.ceil((res?.active_users?.active_users_count || 0) / activeRpp),
        );
        setActiveTotalRows(res?.active_users?.active_users_count || 0);

        setInactiveUsers(res?.inactive_users?.inactive_users || []);
        setInactivePages(
            Math.ceil((res?.inactive_users?.inactive_users_count || 0) / inactiveRpp),
        );
        setInactiveTotalRows(res?.inactive_users?.inactive_users_count || 0);
    };

    const deleteUser = async (id: string) => {
        const res: any = await fetchData(`${UserUrl}/${id}/`, 'DELETE', null, headers);
        if (!res.error) {
            setDeleteOpen(false);
            getUsers();
        }
    };

    /* -------- effects -------- */
    useEffect(() => {
        getUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, activeCur, activeRpp, inactiveCur, inactiveRpp]);

    /* -------- handlers -------- */
    const changeRpp = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = parseInt(e.target.value, 10);
        if (tab === 'active') {
            setActiveRpp(v);
            setActiveCur(1);
        } else {
            setInactiveRpp(v);
            setInactiveCur(1);
        }
    };
    const prevPage = () =>
        tab === 'active'
            ? setActiveCur((p) => Math.max(p - 1, 1))
            : setInactiveCur((p) => Math.max(p - 1, 1));
    const nextPage = () =>
        tab === 'active'
            ? setActiveCur((p) => Math.min(p + 1, activePages))
            : setInactiveCur((p) => Math.min(p + 1, inactivePages));

    const addUser = () => navigate('/app/users/add-users');
    const editUser = (id: string) =>
        navigate('/app/users/user-details', { state: { userId: id, detail: true } });

    /* -------- grid data -------- */
    const rowData = (tab === 'active' ? activeUsers : inactiveUsers).map(
        (u: any) => ({
            ...u,
            emailFull: u.user_details?.email ?? '',
            phoneDisplay:
                u.phone ||
                u.user_details?.phone ||
                u.user_details?.phone_number ||
                u.user_details?.mobile ||
                '—',
        }),
    );

    const columnDefs = [
        {
            headerName: 'Email Address',
            minWidth: 260,
            flex: 2,
            tooltipField: 'emailFull',
            wrapText: true,
            autoHeight: true,
            cellStyle: { whiteSpace: 'normal' },
            valueGetter: (p: any) => p.data.emailFull,
            cellRenderer: (p: any) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                        sx={{ width: 32, height: 32, bgcolor: '#284871', fontSize: 14 }}
                    >
                        {p.value?.charAt(0).toUpperCase()}
                    </Avatar>
                    <a href={`mailto:${p.value}`} style={{ color: '#1a73e8' }}>
                        {p.value}
                    </a>
                </Stack>
            ),
        },
        {
            headerName: 'Mobile Number',
            field: 'phoneDisplay',
            flex: 1,
        },
        { field: 'role', headerName: 'Role', flex: 1 },
        {
            headerName: 'Actions',
            field: 'id',
            minWidth: 120,
            sortable: false,
            suppressMenu: true,
            flex: 1,
            cellRenderer: (p: any) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        onClick={() => editUser(p.value)}
                        sx={{ color: '#0F2A55' }}
                    >
                        <FaEdit />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => { setSelectedId(p.value); setDeleteOpen(true); }}
                        sx={{ color: '#D32F2F' }}
                    >
                        <FaTrashAlt />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    /* -------- grid theme -------- */
    const gridTheme = {
        '--ag-header-background-color': '#0F2A55',
        '--ag-header-foreground-color': '#FFFFFF',
        '--ag-header-border-color': '#0F2A55',
        '--ag-odd-row-background-color': '#FFFFFF',
        '--ag-even-row-background-color': '#F3F8FF',
        '--ag-row-border-color': '#E0E0E0',
    } as React.CSSProperties;

    /* -------- derived numbers -------- */
    const curPage = tab === 'active' ? activeCur : inactiveCur;
    const totalPages = tab === 'active' ? activePages : inactivePages;
    const rpp = tab === 'active' ? activeRpp : inactiveRpp;
    // ----------------- Excel export (no licence needed) -----------------
    // inside Users.tsx, next to your other handlers:

    const exportExcel = async () => {
        const total = tab === 'active' ? activeTotalRows : inactiveTotalRows;
        if (total === 0) {
            console.warn('No rows to export.');
            return;
        }

        // 1️⃣ Fetch every row
        const res: any = await fetchData(
            `${UsersUrl}/?offset=0&limit=${total}`,
            'GET',
            null,
            headers
        );
        if (res?.error) {
            console.error('Failed to fetch all users for export');
            return;
        }

        const fullList: any[] =
            tab === 'active'
                ? res.active_users.active_users
                : res.inactive_users.inactive_users;

        // 2️⃣ Map to flat objects
        const rows = fullList.map((u) => ({
            Email: u.user_details?.email ?? '',
            Mobile:
                u.phone ||
                u.user_details?.phone ||
                u.user_details?.phone_number ||
                u.user_details?.mobile ||
                '',
            Role: u.role ?? '',
        }));

        // 3️⃣ SheetJS export
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');

        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `users_${today}.xlsx`);
    };

    /* ========================================= render ========================================= */
    return (
        <Box sx={{ mt: 8 }}>
            {/* ---------- top toolbar ---------- */}
            <CustomToolbar sx={{ bgcolor: '#ffffff' }}>
                {/* Tabs */}
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3 }}>
                    <CustomTab
                        value="active"
                        label="Active"
                        sx={{
                            backgroundColor: tab === 'active' ? '#F0F7FF' : '#284871',
                            color: tab === 'active' ? '#3f51b5' : '#fff',
                        }}
                    />
                    <CustomTab
                        value="inactive"
                        label="Inactive"
                        sx={{
                            ml: 1,
                            backgroundColor: tab === 'inactive' ? '#F0F7FF' : '#284871',
                            color: tab === 'inactive' ? '#3f51b5' : '#fff',
                        }}
                    />
                </Tabs>

                {/* right-hand controls */}
                <Stack direction="row" alignItems="center" spacing={1}>
                    {/* RPP select */}
                    {/* <Select
                        value={rpp}
                        onChange={changeRpp}
                        open={selectOpen}
                        onOpen={() => setSelectOpen(true)}
                        onClose={() => setSelectOpen(false)}
                        IconComponent={() => (
                            <span onClick={() => setSelectOpen(!selectOpen)}>
                                {selectOpen ? <FiChevronUp /> : <FiChevronDown />}
                            </span>
                        )}
                    >
                        {[10, 20, 30, 40, 50].map((n) => (
                            <MenuItem key={n} value={n}>{`${n} per page`}</MenuItem>
                        ))}
                    </Select> */}

                    {/* page arrows */}
                    {/* <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            borderRadius: 1,
                            p: 0.5,
                        }}
                    >
                        <FabLeft onClick={prevPage} disabled={curPage === 1}>
                            <FiChevronLeft />
                        </FabLeft>
                        <Typography sx={{ mx: 1 }}>{`${curPage} / ${totalPages}`}</Typography>
                        <FabRight
                            onClick={nextPage}
                            disabled={curPage === totalPages || totalPages === 0}
                        >
                            <FiChevronRight />
                        </FabRight>
                    </Box> */}

                    {/* Export pill */}
                    <Button
                        variant="outlined"
                        startIcon={<FiDownload />}
                        sx={{
                            borderRadius: 4,
                            textTransform: 'none',
                            color: '#0F2A55',
                            borderColor: '#0F2A55',
                            fontWeight: 600,
                            bgcolor: 'white',
                            '&:hover': { bgcolor: '#f0f4ff', borderColor: '#0F2A55' },
                            mr: 1,
                        }}
                        onClick={exportExcel}
                    >
                        Export
                    </Button>

                    {/* Add-User pill */}
                    <Button
                        variant="contained"
                        startIcon={<FiPlus />}
                        sx={{
                            borderRadius: 4,
                            textTransform: 'none',
                            bgcolor: '#0F2A55',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#0a1d3f' },
                        }}
                        onClick={addUser}
                    >
                        Add User
                    </Button>
                </Stack>
            </CustomToolbar>

            {/* ---------- grid ---------- */}
            <Container maxWidth={false} sx={{ mt: 2 }}>
                <Paper sx={{ p: 2 }}>
                    <Box
                        className="ag-theme-alpine"
                        sx={{
                            width: '100%',
                            ...gridTheme,
                            '& .ag-header-cell-label .ag-icon': {
                                color: '#FFFFFF',
                                fill: '#FFFFFF',
                            },
                        }}
                    >
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            pagination
                            suppressPaginationPanel
                            paginationPageSize={rpp}
                            defaultColDef={{
                                resizable: true,
                                sortable: true,
                                filter: true,
                                wrapText: true,
                                autoHeight: true,
                                unSortIcon: true,  // shows the sort icon even when unsorted
                            }}
                            domLayout="autoHeight"
                            rowHeight={48}
                            onGridReady={(params) =>
                                params.columnApi?.autoSizeAllColumns
                                    ? params.columnApi.autoSizeAllColumns(false)
                                    : params.api.sizeColumnsToFit()
                            }
                        />
                    </Box>

                    {/* ---------- pagination footer ---------- */}
                    <Box
                        sx={{
                            mt: 1,
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between', // left vs. right
                        }}
                    >
                        {/* LEFT – rows-per-page */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography>Rows&nbsp;per&nbsp;page:</Typography>

                            <Select
                                size="small"
                                value={rpp}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value as string, 10);
                                    if (tab === 'active') { setActiveRpp(v); setActiveCur(1); }
                                    else { setInactiveRpp(v); setInactiveCur(1); }
                                }}
                                sx={{ height: 32 }}
                            >
                                {[10, 20, 30, 40, 50].map((n) => (
                                    <MenuItem key={n} value={n}>{n}</MenuItem>
                                ))}
                            </Select>

                            <Typography sx={{ ml: 1 }}>
                                {`of ${tab === 'active' ? activeTotalRows : inactiveTotalRows} rows`}
                            </Typography>
                        </Stack>

                        {/* RIGHT – pill paginator */}
                        <Pagination
                            page={curPage}
                            count={totalPages}
                            onChange={(_, value) =>
                                tab === 'active' ? setActiveCur(value) : setInactiveCur(value)
                            }
                            variant="outlined"
                            shape="rounded"
                            size="small"
                            showFirstButton
                            showLastButton
                            sx={{
                                /* every pill */
                                '& .MuiPaginationItem-root': {
                                    borderRadius: '50%',
                                    width: 36,
                                    height: 36,
                                    border: '1px solid #CED4DA',
                                },

                                /* hover – only for NON-selected pills */
                                '& .MuiPaginationItem-root:not(.Mui-selected):hover': {
                                    backgroundColor: '#F0F7FF',
                                },

                                /* selected page */
                                '& .MuiPaginationItem-page.Mui-selected': {
                                    backgroundColor: '#0F2A55',
                                    color: '#fff',
                                    border: '1px solid #0F2A55',
                                },
                                '& .Mui-selected:hover': {
                                    backgroundColor: '#0A1D3F',
                                },
                            }}
                        />
                    </Box>
                </Paper>
            </Container>



            {/* ---------- delete modal ---------- */}
            <DeleteModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                id={selectedId}
                modalDialog="Are you sure you want to delete this user?"
                modalTitle="Delete User"
                DeleteItem={() => deleteUser(selectedId)}
            />
        </Box >
    );
}
