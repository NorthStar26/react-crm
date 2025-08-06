import React, { useEffect, useState } from 'react';
import ApartmentIcon from '@mui/icons-material/Apartment';  
import PersonIcon from '@mui/icons-material/Person';        

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

  const handleExport = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    
    try {
      const res = await fetchData(
        `${CasesUrl}/?export=true`,
        'GET',
        undefined,
        Header
      );
      
      if (res.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'cases_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting cases:', error);
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
    <Box sx={{ 
      mt: '65px',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Container maxWidth={false} sx={{ 
        px: 0,
        maxWidth: '100%',
        backgroundColor: '#1a3353',
      }}>
        <Toolbar
          sx={{
            display: 'flex',
            flexDirection: isExtraSmallScreen ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            minHeight: '30px',
            gap: isExtraSmallScreen ? 2 : 0,
            maxWidth: '100%',
            margin: '0 auto',
            width: '100%',
          }}
        >
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
            startIcon={<FiUpload size={18} />}
            onClick={handleExport}
            sx={{
              backgroundColor: '#3a4c71ff',
              color: 'white',
              fontSize: '0.85rem',
              padding: '6px 16px',
              minHeight: '48px',
              borderRadius: '6px',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#3366ff' },
              width: isExtraSmallScreen ? '100%' : 'auto',
              mt: isExtraSmallScreen ? 1 : 0,
            }}
          >
            Export
          </Button>
        </Toolbar>
      </Container>

      <Container 
        maxWidth={false} 
        sx={{ 
          width: '100%', 
          mt: 3, 
          px: isSmallScreen ? 0 : 2,
          maxWidth: '100%',
        }}
      >
        <Paper sx={{ 
          mb: 2, 
          overflowX: 'auto',
          boxShadow: isSmallScreen ? 'none' : theme.shadows[1],
          width: '100%',
          maxWidth: '100%',
        }}>
          <TableContainer sx={{ 
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
          }}>
            <Table
              sx={{
                width: '100%',
                minWidth: isSmallScreen ? '600px' : '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                '& thead th': {
                  backgroundColor: '#1a3353',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  height: '36px',
                  padding: '6px 12px',
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap',
                },
                '& thead th svg': {
                  fill: '#ffffff',
                },
                '& tbody td': {
                  borderBottom: '1px solid #e0e0e0',
                  padding: isSmallScreen ? '8px' : '12px',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                },
                '& tbody tr:nth-of-type(even) td': {
                  backgroundColor: '#f9fafb',
                },
                '& tbody tr:hover td': {
                  backgroundColor: '#f1f5f9',
                },
              }}
              size={isSmallScreen ? 'small' : 'medium'}
            >
              <TableHead>
                <TableRow>
                  {responsiveHeadCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sx={{ color: 'white' }} // Force white text color
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={(e) => handleRequestSort(e, headCell.id)}
                        sx={{
                          color: 'white',                // Label color
                          '&.Mui-active': {
                            color: 'white',              // Keep active label white
                          },
                          '& .MuiTableSortLabel-icon': {
                            color: 'white !important',   // Force white arrow (sort icon)
                            fill: 'white !important',
                          },
                          '&:hover': {
                            color: 'white',              // Prevent hover color change
                          },
                        }}
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
                    <TableCell colSpan={responsiveHeadCells.length}>
                      <Spinner />
                    </TableCell>
                  </TableRow>
                ) : cases.length > 0 ? (
                  cases.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.name}</TableCell>
                      {!isSmallScreen && (
                        <TableCell>
                          {item.opportunity_data?.lead?.company?.industry || '---'}
                        </TableCell>
                      )}
                      <TableCell>
                        {item.opportunity_data?.lead?.contact?.name || '---'}
                      </TableCell>
                      {!isSmallScreen && (
                        <TableCell>
                          {item.expected_revenue
                            ? `$${Number(item.expected_revenue).toLocaleString()}`
                            : '---'}
                        </TableCell>
                      )}
                      <TableCell>{item.closed_on}</TableCell>
                      {!isSmallScreen && (
                        <TableCell>
                          {item.created_by?.first_name} {item.created_by?.last_name || ''}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={responsiveHeadCells.length} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No cases found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
              <Typography variant="body2">
                of {totalCount} rows
              </Typography>
            </Box>

            {/* Right Side: Pagination */}
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
                  <Box key={`ellipsis-${idx}`} sx={{ px: 1, fontSize: '0.875rem' }}>...</Box>
                ) : (
                  <Button
                    key={page}
                    size="small"
                    variant={page === currentPage ? 'contained' : 'outlined'}
                    onClick={() => setCurrentPage(page)}
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