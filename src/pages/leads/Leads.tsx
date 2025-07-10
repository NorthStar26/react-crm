import React, { SyntheticEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarGroup, Box, Button, Card, List, Stack, Tab, TablePagination, Tabs, Toolbar, Typography, Link, MenuItem, Select, dividerClasses } from '@mui/material'
import styled from '@emotion/styled';
import { LeadUrl } from '../../services/ApiUrls';
import { DeleteModal } from '../../components/DeleteModal';
import { Label } from '../../components/Label';
import { fetchData } from '../../components/FetchData';
import { Spinner } from '../../components/Spinner';
import FormateTime from '../../components/FormateTime';
import { getComparator, stableSort } from '../../components/Sorting';
import { FaTrashAlt } from 'react-icons/fa';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
import { CustomTab, CustomToolbar, FabLeft, FabRight } from '../../styles/CssStyled';
import '../../styles/style.css'
import { TextField } from '@mui/material';
import { FaEdit } from 'react-icons/fa';


export const CustomTablePagination = styled(TablePagination)`
  .MuiToolbar-root {
    min-width: 100px;
  }
  .MuiTablePagination-toolbar {
    background-color: #f0f0f0;
    color: #333;
  }
  .MuiTablePagination-caption {
    color: #999;
  }
  '.MuiTablePagination-displayedRows': {
    display: none;
  }
  '.MuiTablePagination-actions': {
    display: none;
  }
  '.MuiTablePagination-selectLabel': {
    margin-top: 4px;
    margin-left: -15px;
  }
  '.MuiTablePagination-select': {
    color: black;
    margin-right: 0px;
    margin-left: -12px;
    margin-top: -6px;
  }
  '.MuiSelect-icon': {
    color: black;
    margin-top: -5px;
  }
  background-color: white;
  border-radius: 1;
  height: 10%;
  overflow: hidden;
  padding: 0;
  margin: 0;
  width: 39%;
  padding-bottom: 5;
  color: black;
  margin-right: 1;
`;

export const Tabss = styled(Tab)({
  height: '34px',
  textDecoration: 'none',
  fontWeight: 'bold'
});

export const ToolbarNew = styled(Toolbar)({
  minHeight: '48px', height: '48px', maxHeight: '48px',
  width: '100%', display: 'flex', justifyContent: 'space-between', backgroundColor: '#1A3353',
  '& .MuiToolbar-root': { minHeight: '48px !important', height: '48px !important', maxHeight: '48px !important' },
  '@media (min-width:600px)': {
    '& .MuiToolbar-root': {
      minHeight: '48px !important', height: '48px !important', maxHeight: '48px !important'
    }
  }
});

export default function Leads(props: any) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [contacts, setContacts] = useState([])
  const [status, setStatus] = useState([])
  const [source, setSource] = useState([])
  const [companies, setCompanies] = useState([])
  const [tags, setTags] = useState([])
  const [users, setUsers] = useState([])
  const [countries, setCountries] = useState([])
  const [industries, setIndustries] = useState([])
  const [selectOpen, setSelectOpen] = useState(false);
  const [sortField, setSortField] = useState('created_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const handleSort = (field: string) => {
  const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };


  const [deleteLeadModal, setDeleteLeadModal] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const statusList = [
      { value: '', label: 'Status' },
      { value: 'assigned', label: 'Assigned' },
      { value: 'in process', label: 'In Process' },
      { value: 'converted', label: 'Converted' },
      { value: 'recycled', label: 'Recycled' },
      { value: 'closed', label: 'Closed' },
    ];

  const sourceList = [
      { value: '', label: 'Source' },
      { value: 'call', label: 'Call' },
      { value: 'email', label: 'Email' },
      { value: 'existing customer', label: 'Existing Customer' },
      { value: 'partner', label: 'Partner' },
      { value: 'public relations', label: 'Public Relations' },
      { value: 'compaign', label: 'Campaign' },
      { value: 'other', label: 'Other' },
    ];

useEffect(() => {
  getLeads();
}, [currentPage, recordsPerPage, statusFilter, sourceFilter, searchTerm]);

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
  }
};


const handleRecordsPerPage = (event: React.ChangeEvent<{ value: unknown }>) => {
  setRecordsPerPage(event.target.value as number);
  setCurrentPage(1);
};


const handlePreviousPage = () => {
  setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
};

const handleNextPage = () => {
  setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
};


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
      })
    }
  }

  const selectLeadList = (leadId: any) => {
    // Use the new path parameter based navigation
    navigate(`/app/leads/${leadId}`)
    // Keep state for any additional data that might be needed
    // navigate(`/app/leads/lead-details`, { state: { leadId, detail: true, contacts: contacts || [], status: status || [], source: source || [], companies: companies || [], tags: tags || [], users: users || [], countries: countries || [], industries: industries || [] } })
    // navigate('/app/leads/lead-details', { state: { leadId: leadItem.id, edit: storeData, value } })
  }

  const deleteLead = (deleteId: any) => {
    setDeleteLeadModal(true)
    setSelectedId(deleteId)
  }

  const deleteLeadModalClose = () => {
    setDeleteLeadModal(false)
    setSelectedId('')
  }

  const deleteItem = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    }
    fetchData(`${LeadUrl}/${selectedId}/`, 'DELETE', null as any, Header)
      .then((res: any) => {
        if (!res.error) {
          deleteLeadModalClose()
          getLeads()
        }
      })
      .catch(() => {
      })
  }

  const recordsList = [[10, '10 Records per page'], [20, '20 Records per page'], [30, '30 Records per page'], [40, '40 Records per page'], [50, '50 Records per page']]
  
  return (
    <Box sx={{ mt: '60px' }}>
      <CustomToolbar>
        {/* 🔍 Search Field */}
        <Box sx={{ ml: 2 }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchTerm(searchInput);
                setCurrentPage(1); // Optional: reset pagination
              }
            }}
            style={{
              height: '35px',
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          />
        </Box>


        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          displayEmpty
          sx={{ mr: 2 }}
        >
          {statusList.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {status.label}
            </MenuItem>
          ))}
        </Select>

        

  

        <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            displayEmpty
          >
            {sourceList.map((source) => (
              <MenuItem key={source.value} value={source.value}>
                {source.label}
              </MenuItem>
            ))}
          </Select>

        
        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>




          <Button
            variant="contained"
            startIcon={<FiPlus className="plus-icon" />}
            onClick={onAddHandle}
            className={'add-button'}
          >
            Add Lead
          </Button>
        </Stack>
      </CustomToolbar>


          {/* to align */}
          <Box sx={{ p: '10px', mt: '5px' }}>
          {/* Table Headers */}
          <Stack
            direction="row"
            sx={{
              p: '10px',
              backgroundColor: '#1A3353',
              color: 'white',
              borderRadius: '4px',
              mb: '5px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ width: '28%', pl: 1, display: 'flex', alignItems: 'center' }} onClick={() => handleSort('lead_name')}>
              Lead Name {sortField === 'lead_name' && (sortOrder === 'asc' ? <FiChevronUp /> : <FiChevronDown />)}
            </Box>
            <Box sx={{ width: '14%', display: 'flex',  justifyContent: 'center', alignItems: 'center' }} onClick={() => handleSort('contact_name')}>
              Contact {sortField === 'contact_name' && (sortOrder === 'asc' ? <FiChevronUp /> : <FiChevronDown />)}
            </Box>
            <Box
              sx={{ width: '20%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => handleSort('company_name')}
            >
              Company
              {sortField === 'company_name' && (sortOrder === 'asc' ? <FiChevronUp /> : <FiChevronDown />)}
            </Box>
            <Box sx={{ width: '16%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              Source
            </Box>
            <Box sx={{ width: '12%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              Status
            </Box>

            <Box
              sx={{ width: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => handleSort('created_date')}
            >
              Creation Date
              {sortField === 'created_date' && (sortOrder === 'asc' ? <FiChevronUp /> : <FiChevronDown />)}
            </Box>
            <Box sx={{ width: '5%', textAlign: 'right' }}>Actions</Box>
          </Stack>

          {/* Table Body */}
          {leads?.length > 0 ? (
            stableSort(leads, getComparator(sortOrder, sortField)).map((item: any, index: number) => (

              <Box key={index} sx={{ mb: '5px' }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'white', 
                    borderRadius: '4px', 
                    boxShadow: '0px 0px 5px rgba(0,0,0,0.1)', 
                    p: '10px', 
                    fontSize: '14px',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0px 0px 10px rgba(0,0,0,0.15)',
                    }
                  }}
                  onClick={() => selectLeadList(item.id)}
                >
                  <Stack direction="row" alignItems="center">
                    <Box sx={{ width: '28%', pl: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item?.lead_name || '--'}
                    </Box>
                    <Box sx={{ width: '14%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item?.contact_name || '--'}
                    </Box>
                    <Box sx={{ width: '20%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item?.company_name
                        ? `${item.company_name.substring(0, 15)}${item.company_name.length > 15 ? '...' : ''}`
                        : '--'}
                    </Box>
                    <Box sx={{ width: '16%', textAlign: 'center' }}>{item?.lead_source || '--'}</Box>
                    <Box sx={{ width: '12%', textAlign: 'center' }}>
                      <Typography sx={{ color: '#1A3353', fontWeight: 500, textTransform: 'capitalize' }}>
                        {item?.status || '--'}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '10%', textAlign: 'center' }}>{item?.created_date || '--'}</Box>
                    <Box 
                      sx={{ 
                        width: '5%', 
                        textAlign: 'right', 
                        pr: 1, 
                        display: 'flex', 
                        gap: '8px', 
                        justifyContent: 'flex-end',
                        // Prevent click events from bubbling up to parent
                        '& > *': { 
                          zIndex: 2 
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEdit
                        onClick={() => selectLeadList(item.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', color: '#1A3353' }}
                      />
                      <FaTrashAlt
                        onClick={() => deleteLead(item?.id)}
                        style={{ cursor: 'pointer', color: 'red' }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Box>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 2 }}>No Records Found</Typography>
          )}
        </Box>
      
 


      <DeleteModal
        onClose={deleteLeadModalClose}
        open={deleteLeadModal}
        id={selectedId}
        modalDialog={'Are You Sure You want to delete selected Lead?'}
        modalTitle={'Delete Lead'}
        DeleteItem={deleteItem}
      />
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

            <Select
              value={recordsPerPage}
              onChange={(e: any) => handleRecordsPerPage(e)}
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              className={`custom-select`}
              onClick={() => setSelectOpen(!selectOpen)}
              IconComponent={() => (
                <div onClick={() => setSelectOpen(!selectOpen)} className="custom-select-icon">
                  {selectOpen ? (
                    <FiChevronUp style={{ marginTop: '12px' }} />
                  ) : (
                    <FiChevronDown style={{ marginTop: '12px' }} />
                  )}
                </div>
              )}
              sx={{
                '& .MuiSelect-select': { overflow: 'visible !important' },
              }}
            >
              {recordsList?.length &&
                recordsList.map((item: any, i: any) => (
                  <MenuItem key={i} value={item[0]}>
                    {item[1]}
                  </MenuItem>
                ))}
            </Select>

            <FabLeft onClick={handlePreviousPage} disabled={currentPage === 1}>
              <FiChevronLeft style={{ height: '15px' }} />
            </FabLeft>
            <Typography
              sx={{
                mt: 0,
                textTransform: 'lowercase',
                fontSize: '15px',
                color: '#1A3353',
                textAlign: 'center',
              }}
            >
              {`${currentPage} to ${totalPages}`}
            </Typography>
            <FabRight onClick={handleNextPage} disabled={currentPage === totalPages}>
              <FiChevronRight style={{ height: '15px' }} />
            </FabRight>
          </Box>
    </Box>
  )
}