import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  IconButton, TextField, Select, MenuItem, Button, Checkbox, TableSortLabel, Stack,
  Avatar, Chip, InputAdornment, Toolbar, Container, Fab, SelectChangeEvent
} from '@mui/material';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import { FiPlus, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';
import { CasesUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { Spinner } from '../../components/Spinner';
import { DeleteModal } from '../../components/DeleteModal';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface Case {
  id: string;
  name: string;
  closed_on: string;
  opportunity?: {
    id: string;
    expected_revenue?: number;
    lead?: {
      id: string;
      company?: {
        id: string;
        industry?: string;
      };
      contact?: {
        id: string;
        first_name: string;
        last_name: string;
        salutation?: string;
      };
      assigned_to?: Array<{
        user_details?: {
          id: string;
          first_name: string;
          last_name: string;
          profile_pic?: string;
          email: string;
        };
      }>;
    };
  };
}

interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  // Add other user properties as needed
}

const headCells = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Case Name',
  },
  {
    id: 'industry',
    numeric: false,
    disablePadding: false,
    label: 'Industry',
  },
  {
    id: 'contact',
    numeric: false,
    disablePadding: false,
    label: 'Contact',
  },
  {
    id: 'expected_revenue',
    numeric: false,
    disablePadding: false,
    label: 'Result',
  },
  {
    id: 'closed_on',
    numeric: false,
    disablePadding: false,
    label: 'Close Date',
  },
  {
    id: 'assigned_to',
    numeric: false,
    disablePadding: false,
    label: 'Assigned To',
  },
  {
    id: '',
    numeric: true,
    disablePadding: false,
    label: 'Action',
  },
];

export default function CasesListPage() {
  const navigate = useNavigate();
  const { user } = useUser() as { user: UserProfile | null };
  const [loading, setLoading] = useState(true);

  const [cases, setCases] = useState<Case[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('name');

  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [isSelectedId, setIsSelectedId] = useState<boolean[]>([]);
  const [deleteRowModal, setDeleteRowModal] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const recordsList = [
    { value: 10, label: '10 Records per page' },
    { value: 20, label: '20 Records per page' },
    { value: 30, label: '30 Records per page' },
    { value: 40, label: '40 Records per page' },
    { value: 50, label: '50 Records per page' },
  ];

  useEffect(() => {
    getCases();
  }, [currentPage, recordsPerPage, searchTerm, industryFilter, contactFilter, order, orderBy]);

  const getCases = async () => {
    setLoading(true);
    const offset = (currentPage - 1) * recordsPerPage;
    const searchParam = searchTerm ? `&search=${searchTerm}` : '';
    const industryParam = industryFilter ? `&industry=${industryFilter}` : '';
    const contactParam = contactFilter ? `&contact=${contactFilter}` : '';
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    };
    
    try {
      const res = await fetchData(
        `${CasesUrl}/?offset=${offset}&limit=${recordsPerPage}&ordering=${order === 'asc' ? '' : '-'}${orderBy}${searchParam}${industryParam}${contactParam}`,
        'GET',
        undefined,
        Header
      );
      
      if (!res.error) {
        setCases(res?.cases || []);
        setTotalCount(res?.cases_count || 0);
        setTotalPages(Math.ceil(res?.cases_count / recordsPerPage));
        
        const industrySet = new Set<string>();
        const contactMap = new Map<string, {id: string, name: string}>();
        
        res?.cases?.forEach((caseItem: Case) => {
          if (caseItem?.opportunity?.lead?.company?.industry) {
            industrySet.add(caseItem.opportunity.lead.company.industry);
          }
          
          if (caseItem?.opportunity?.lead?.contact) {
            const contact = caseItem.opportunity.lead.contact;
            const contactName = `${contact.salutation || ''} ${contact.first_name || ''} ${contact.last_name || ''}`.trim();
            if (!contactMap.has(contact.id)) {
              contactMap.set(contact.id, {
                id: contact.id,
                name: contactName
              });
            }
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

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleRecordsPerPage = (event: SelectChangeEvent<number>) => {
    setRecordsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const csvRows = [];
    const headers = ['Case Name', 'Industry', 'Contact', 'Result', 'Close Date', 'Assigned To'];
    csvRows.push(headers.join(','));

    filteredCases.forEach((item) => {
      const row = [
        `"${item.name || ''}"`,
        `"${item.opportunity?.lead?.company?.industry || ''}"`,
        `"${item.opportunity?.lead?.contact ? 
          `${item.opportunity.lead.contact.first_name || ''} ${item.opportunity.lead.contact.last_name || ''}`.trim() : ''}"`,
        `"${item.opportunity?.expected_revenue || ''}"`,
        `"${item.closed_on || ''}"`,
        `"${item.opportunity?.lead?.assigned_to?.map((u) =>
          u.user_details
            ? `${u.user_details.first_name} ${u.user_details.last_name}`
            : 'User'
        ).join('; ') || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cases_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
      org: localStorage.getItem('org')
    };
    await fetchData(`${CasesUrl}/${selectedCaseIds[0]}/`, 'DELETE', undefined, Header);
    getCases();
    deleteRowModalClose();
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedCaseIds.length} case(s)?`)) return;
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    };
    for (const id of selectedCaseIds) {
      await fetchData(`${CasesUrl}/${id}/`, 'DELETE', undefined, Header);
    }
    setSelectedCaseIds([]);
    getCases();
  };

  const filteredCases = (user?.role === 'ADMIN' || user?.role === 'MANAGER')
    ? cases
    : cases.filter((c) =>
        c.opportunity?.lead?.assigned_to?.some((a) => a.user_details?.id === user?.id)
      );

  const canDeleteAll = user?.role === 'ADMIN' || user?.role === 'MANAGER' || 
    filteredCases
      .filter((c) => selectedCaseIds.includes(c.id))
      .every((c) =>
        c.opportunity?.lead?.assigned_to?.some((a) => a.user_details?.id === user?.id)
      );

  const handleRowSelect = (caseId: string) => {
    const selectedIndex = selectedCaseIds.indexOf(caseId);
    let newSelected: string[] = [...selectedCaseIds];
    let newIsSelectedId: boolean[] = [...isSelectedId];

    if (selectedIndex === -1) {
      newSelected.push(caseId);
      newIsSelectedId.push(true);
    } else {
      newSelected.splice(selectedIndex, 1);
      newIsSelectedId.splice(selectedIndex, 1);
    }

    setSelectedCaseIds(newSelected);
    setIsSelectedId(newIsSelectedId);
  };

  const handleSelectAllClick = () => {
    if (selectedCaseIds.length === filteredCases.length) {
      setSelectedCaseIds([]);
      setIsSelectedId([]);
    } else {
      const newSelectedIds = filteredCases.map((caseItem) => caseItem.id);
      setSelectedCaseIds(newSelectedIds);
      setIsSelectedId(newSelectedIds.map(() => true));
    }
  };

  const modalDialog = 'Are You Sure You want to delete selected Case?';
  const modalTitle = 'Delete Case';

  const onAddCase = () => {
    navigate('/app/cases/add-case');
  };

  return (
    <Box sx={{ mt: '65px' }}>
      <Toolbar sx={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#1a3353',
        padding: '12px 16px',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1, maxWidth: '700px' }}>
          <Box sx={{ maxWidth: '400px', minWidth: '300px' }}>
            <TextField
              fullWidth
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch style={{ color: '#757575' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E0E0E0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />
          </Box>

          <Select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value as string)}
            displayEmpty
            size="small"
            disabled={loading || cases.length === 0}
            sx={{
              minWidth: 120,
              backgroundColor: 'white',
              '& .MuiSelect-select': {
                padding: '8px 14px',
              },
            }}
          >
            <MenuItem value="">
              <Typography sx={{ color: '#757575' }}>All Industries</Typography>
            </MenuItem>
            {industries.map((industry) => (
              <MenuItem key={industry} value={industry}>{industry}</MenuItem>
            ))}
          </Select>

          <Select
            value={contactFilter}
            onChange={(e) => setContactFilter(e.target.value as string)}
            displayEmpty
            size="small"
            disabled={loading || cases.length === 0}
            sx={{
              minWidth: 140,
              backgroundColor: 'white',
              '& .MuiSelect-select': {
                padding: '8px 14px',
              },
            }}
          >
            <MenuItem value="">
              <Typography sx={{ color: '#757575' }}>All Contacts</Typography>
            </MenuItem>
            {contacts.map((contact) => (
              <MenuItem key={contact.id} value={contact.id}>
                {contact.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Select
            value={recordsPerPage}
            onChange={handleRecordsPerPage}
            open={selectOpen}
            onOpen={() => setSelectOpen(true)}
            onClose={() => setSelectOpen(false)}
            onClick={() => setSelectOpen(!selectOpen)}
            sx={{
              '& .MuiSelect-select': { overflow: 'visible !important' },
              backgroundColor: 'white',
              borderRadius: '4px',
            }}
          >
            {recordsList.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <Box
            sx={{
              borderRadius: '7px',
              backgroundColor: 'white',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              mr: 1,
              p: '0px',
            }}
          >
            <Fab onClick={handlePreviousPage} disabled={currentPage === 1}>
              <FiChevronLeft style={{ height: '15px' }} />
            </Fab>
            <Typography
              sx={{
                mt: 0,
                textTransform: 'lowercase',
                fontSize: '15px',
                color: '#1A3353',
                textAlign: 'center',
              }}
            >
              {currentPage} to {totalPages}
            </Typography>
            <Fab
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight style={{ height: '15px' }} />
            </Fab>
          </Box>
          <Button
            variant="contained"
            startIcon={<FiPlus className="plus-icon" />}
            onClick={onAddCase}
            sx={{
              backgroundColor: '#3a79ff',
              color: 'white',
              '&:hover': {
                backgroundColor: '#3366ff',
              },
            }}
          >
            Add Case
          </Button>
          <Button
            variant="contained"
            onClick={handleExportCSV}
            sx={{
              backgroundColor: '#6c757d',
              color: 'white',
              marginLeft: '8px',
              '&:hover': {
                backgroundColor: '#5a6268',
              },
            }}
          >
            Export CSV
          </Button>
          {selectedCaseIds.length > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={handleBulkDelete}
              disabled={!canDeleteAll}
              sx={{
                marginLeft: '8px',
                '&:hover': {
                  backgroundColor: '#dc3545',
                },
              }}
            >
              Delete Selected
            </Button>
          )}
        </Stack>
      </Toolbar>

      <Container sx={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}>
        <Box sx={{ width: '100%', minWidth: '100%', m: '15px 0px 0px 0px' }}>
          <Paper sx={{ width: 'cal(100%-15px)', mb: 2, p: '0px 0px 15px 0px' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={filteredCases.length > 0 && selectedCaseIds.length === filteredCases.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        sortDirection={orderBy === headCell.id ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={(e) => handleRequestSort(e, headCell.id)}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ border: 0 }}>
                        <Spinner />
                      </TableCell>
                    </TableRow>
                  ) : filteredCases.length > 0 ? (
                    filteredCases.map((item, index) => {
                      const isItemSelected = selectedCaseIds.indexOf(item.id) !== -1;
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          tabIndex={-1}
                          key={index}
                          sx={{
                            border: 0,
                            '&:nth-of-type(even)': {
                              backgroundColor: 'whitesmoke',
                            },
                            color: 'rgb(26, 51, 83)',
                            textTransform: 'capitalize',
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ border: 0, color: 'inherit' }}>
                            <Checkbox
                              checked={isItemSelected}
                              onChange={() => handleRowSelect(item.id)}
                              inputProps={{ 'aria-labelledby': labelId }}
                              sx={{ border: 0, color: 'inherit' }}
                            />
                          </TableCell>
                          <TableCell>
                            {item?.name || '---'}
                          </TableCell>
                          <TableCell>
                            {item?.opportunity?.lead?.company?.industry || '---'}
                          </TableCell>
                          <TableCell>
                            {item?.opportunity?.lead?.contact
                              ? `${item.opportunity.lead.contact.first_name || ''} ${item.opportunity.lead.contact.last_name || ''}`.trim()
                              : '---'}
                          </TableCell>
                          <TableCell>
                            {item?.opportunity?.expected_revenue ? (
                              <Stack>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  ${item.opportunity.expected_revenue.toLocaleString()}
                                </Typography>
                              </Stack>
                            ) : (
                              '---'
                            )}
                          </TableCell>
                          <TableCell>
                            {item?.closed_on || '---'}
                          </TableCell>
                          <TableCell>
                            {item?.opportunity?.lead?.assigned_to && item.opportunity.lead.assigned_to.length > 0 ? (
                              <Stack style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar
                                  src={item.opportunity.lead.assigned_to[0]?.user_details?.profile_pic || ''}
                                  alt={item.opportunity.lead.assigned_to[0]?.user_details?.first_name || 'User'}
                                  sx={{ width: 32, height: 32 }}
                                >
                                  {item.opportunity.lead.assigned_to[0]?.user_details?.first_name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                                <Stack sx={{ ml: 1 }}>
                                  {item.opportunity.lead.assigned_to[0]?.user_details?.first_name &&
                                  item.opportunity.lead.assigned_to[0]?.user_details?.last_name
                                    ? `${item.opportunity.lead.assigned_to[0].user_details.first_name} ${item.opportunity.lead.assigned_to[0].user_details.last_name}`
                                    : item.opportunity.lead.assigned_to[0]?.user_details?.email || '---'}
                                </Stack>
                              </Stack>
                            ) : (
                              '---'
                            )}
                          </TableCell>
                          <TableCell>
                            {(user?.role === 'ADMIN' || user?.role === 'MANAGER' ||
                              item.opportunity?.lead?.assigned_to?.some((a) => a.user_details?.id === user?.id)) && (
                              <IconButton onClick={() => handleDelete(item.id)}>
                                <FaTrashAlt
                                  style={{
                                    fill: '#DC3545',
                                    cursor: 'pointer',
                                    width: '15px',
                                  }}
                                />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ border: 0, textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          {searchTerm || industryFilter || contactFilter
                            ? `No cases found matching your search criteria${searchTerm ? ` "${searchTerm}"` : ''}`
                            : 'No cases available'
                          }
                        </Typography>
                        {(searchTerm || industryFilter || contactFilter) && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Try adjusting your search terms or filters
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
      <DeleteModal
        onClose={deleteRowModalClose}
        open={deleteRowModal}
        id={selectedCaseIds[0]}
        modalDialog={modalDialog}
        modalTitle={modalTitle}
        DeleteItem={deleteItem}
      />
    </Box>
  );
}