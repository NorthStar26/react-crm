import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Link,
  Avatar,
  Box,
  Snackbar,
  Alert,
  Stack,
  Button,
  Chip,
  TextField,
  Typography,
} from '@mui/material';
import { fetchData } from '../../components/FetchData';
import { OpportunityUrl } from '../../services/ApiUrls';
import { Tags } from '../../components/Tags';
import { CustomAppBar } from '../../components/CustomAppBar';
import { FaPlus, FaStar } from 'react-icons/fa';
import FormateTime from '../../components/FormateTime';
import { Label } from '../../components/Label';
import { SuccessAlert, AlertType } from '../../components/Button/SuccessAlert';
import { DialogModal } from '../../components/DialogModal';

export const formatDate = (dateString: any) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to capitalize the first letter of each word in a string
const capitalizeFirstLetter = (string: string | undefined | null): string => {
  if (!string) return '';

  // For URL links, don't capitalize
  if (string.startsWith('http')) return string;

  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
type response = {
  created_by: {
    email: string;
    id: string;
    profile_pic: string;
  };
  user_details: {
    email: string;
    id: string;
    profile_pic: string;
  };
  org: { name: string };
  lead: { account_name: string };
  account_attachment: [];
  assigned_to: [];
  billing_address_line: string;
  billing_city: string;
  billing_country: string;
  billing_state: string;
  billing_postcode: string;
  billing_street: string;
  contact_name: string;
  name: string;

  created_at: string;
  created_on: string;
  created_on_arrow: string;
  date_of_birth: string;
  title: string;
  first_name: string;
  last_name: string;
  account_name: string;
  phone: string;
  email: string;
  lead_attachment: string;
  opportunity_amount: string;
  website: string;
  description: string;
  contacts: string;
  status: string;
  source: string;
  address_line: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  tags: [];
  company: string;
  probability: string;
  industry: string;
  skype_ID: string;
  file: string;

  close_date: string;
  organization: string;
  created_from_site: boolean;
  id: string;
  teams: [];
  leads: string;

  lead_source: string;
  amount: string;
  currency: string;
  users: string;
  stage: string;
  closed_on: string;
  opportunity_attachment: [];
  account: { id: string; name: string };
};
export const OpportunityDetails = (props: any) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [opportunityDetails, setOpportunityDetails] = useState<response | null>(
    null
  );
  const [usersDetails, setUsersDetails] = useState<
    Array<{
      user_details: {
        email: string;
        id: string;
        profile_pic: string;
      };
    }>
  >([]);
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [tags, setTags] = useState([]);
  const [countries, setCountries] = useState<string[][]>([]);
  const [source, setSource] = useState([]);
  const [status, setStatus] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leads, setLeads] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentList, setCommentList] = useState('Recent Last');
  const [note, setNote] = useState('');
  
  // Comment functionality states
  const [noteError, setNoteError] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [commentsToShow, setCommentsToShow] = useState(5);
  
  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('success');
  
  // Add Note modal states
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);

  useEffect(() => {
    getOpportunityDetails(state.opportunityId, true);
  }, [state.opportunityId]);

  const getOpportunityDetails = (id: any, isInitialLoad = false) => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    fetchData(`${OpportunityUrl}/${id}/`, 'GET', null as any, Header)
      .then((res) => {
        console.log(res?.opportunity_obj, 'edd');
        console.log('Opportunity API response - comments:', res?.comments);
        if (!res.error) {
          setOpportunityDetails(res?.opportunity_obj);
          setUsers(res?.users);
          setComments(res?.comments || []);
          // setContacts(res?.contacts)
          // setIndustries(res?.industries)
          // setUsers(res?.users)
          // setStatus(res?.status)
          // setCountries(res?.countries)
          // setLeads(res?.leads)
          // setTags(res?.tags)
          // setTeams(res?.teams)
          // setAttachments(res?.attachments)
          // setTags(res?.tags)
          // setCountries(res?.countries)
          // setIndustries(res?.industries)
          // setStatus(res?.status)
          // setSource(res?.source)
          // setUsers(res?.users)
          // setContacts(res?.contacts)
          // setTeams(res?.teams)
          // setComments(res?.comments)
        }
      })
      .catch((err) => {
        // console.error('Error:', err)
        <Snackbar
          open={err}
          autoHideDuration={4000}
          onClose={() => navigate('/app/opportunities')}
        >
          <Alert
            onClose={() => navigate('/app/opportunities')}
            severity="error"
            sx={{ width: '100%' }}
          >
            Failed to load!
          </Alert>
        </Snackbar>;
      });
  };
  const accountCountry = (country: string) => {
    let countryName: string[] | undefined;
    for (countryName of countries) {
      if (Array.isArray(countryName) && countryName.includes(country)) {
        const ele = countryName;
        break;
      }
    }
    return countryName?.[1];
  };
  const editHandle = () => {
    // navigate('/contacts/edit-contacts', { state: { value: contactDetails, address: newAddress } })
    let country: string[] | undefined;
    for (country of countries) {
      if (
        Array.isArray(country) &&
        country.includes(opportunityDetails?.country || '')
      ) {
        const firstElement = country[0];
        break;
      }
    }
    navigate('/app/opportunities/edit-opportunity', {
      state: {
        value: {
          name: opportunityDetails?.name,
          account: opportunityDetails?.account?.id,
          amount: opportunityDetails?.amount,
          currency: opportunityDetails?.currency,
          stage: opportunityDetails?.stage,
          teams: opportunityDetails?.teams,
          lead_source: opportunityDetails?.lead_source,
          probability: opportunityDetails?.probability,
          description: opportunityDetails?.description,
          assigned_to: opportunityDetails?.assigned_to,
          contact_name: opportunityDetails?.contact_name,
          due_date: opportunityDetails?.closed_on,
          tags: opportunityDetails?.tags,
          opportunity_attachment: opportunityDetails?.opportunity_attachment,
        },
        id: state?.opportunityId,
        contacts: state?.contacts || [],
        leadSource: state?.leadSource || [],
        currency: state?.currency || [],
        tags: state?.tags || [],
        account: state?.account || [],
        stage: state?.stage || [],
        users: state?.users || [],
        teams: state?.teams || [],
        countries: state?.countries || [],
      },
    });
  };

  const backbtnHandle = () => {
    navigate('/app/opportunities');
  };

  // Open add note dialog
  const handleAddNoteClick = () => {
    console.log('handleAddNoteClick called with note:', note);
    if (!note.trim()) {
      setNoteError('Note cannot be empty');
      return;
    }

    // Clear any previous errors
    setNoteError('');

    // Open confirmation dialog
    setAddNoteDialogOpen(true);
  };

  // Submit note after confirmation
  const submitNote = () => {
    // Close the dialog first
    setAddNoteDialogOpen(false);

    setNoteSubmitting(true);

    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    const data = JSON.stringify({
      comment: note,
    });

    console.log('Submitting comment to:', `${OpportunityUrl}/${state.opportunityId}/comment/`);
    console.log('Comment data:', data);
    
    fetchData(`${OpportunityUrl}/${state.opportunityId}/comment/`, 'POST', data, Header)
      .then((res) => {
        console.log('Comment submission response:', res);
        if (!res.error) {
          // Refresh opportunity details to show the new comment (not initial load)
          getOpportunityDetails(state.opportunityId, false);
          setNote('');
          setNoteError('');

          // Show success alert
          setAlertMessage('Note added successfully');
          setAlertType('success');
          setAlertOpen(true);
        } else {
          // Show error alert
          setAlertMessage(res.errors || 'Failed to add note');
          setAlertType('error');
          setAlertOpen(true);
          console.error('Comment submission error:', res);
        }
      })
      .catch((err) => {
        console.error('Error submitting note:', err);
        setNoteError('Failed to submit note. Please try again.');

        // Show error alert
        setAlertMessage('Failed to add note. Please try again.');
        setAlertType('error');
        setAlertOpen(true);
      })
      .finally(() => {
        setNoteSubmitting(false);
      });
  };

  const handleShowMoreComments = () => {
    setCommentsToShow((prev) => prev + 5);
  };

  // Handler for closing the alert
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const module = 'Opportunities';
  const crntPage = 'Opportunity Details';
  const backBtn = 'Back To Opportunities';
  console.log(state, 'oppdetail');

  return (
    <Box sx={{ mt: '60px' }}>
      {/* Success/Error Alert */}
      <SuccessAlert
        open={alertOpen}
        message={alertMessage}
        onClose={handleAlertClose}
        type={alertType}
        autoHideDuration={4000}
        showCloseButton={true}
      />

      {/* Add Note Dialog */}
      <DialogModal
        isDelete={addNoteDialogOpen}
        onClose={() => setAddNoteDialogOpen(false)}
        onConfirm={submitNote}
        modalDialog={`Are you sure you want to add a note to ${
          opportunityDetails?.name || ''
        }'s opportunity?`}
        confirmText="Add"
        cancelText="Cancel"
      />

      <div>
        <CustomAppBar
          backbtnHandle={backbtnHandle}
          module={module}
          backBtn={backBtn}
          crntPage={crntPage}
          editHandle={editHandle}
        />
        <Box
          sx={{
            mt: '110px',
            p: '20px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ width: '65%' }}>
            <Box
              sx={{
                borderRadius: '10px',
                border: '1px solid #80808038',
                backgroundColor: 'white',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid lightgray',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#1a3353f0',
                  }}
                >
                  Opportunity Information
                </div>
                <div
                  style={{
                    color: 'gray',
                    fontSize: '16px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      marginRight: '15px',
                    }}
                  >
                    created &nbsp;
                    {FormateTime(opportunityDetails?.created_at)} &nbsp; by
                    &nbsp;
                    <Avatar
                      src={opportunityDetails?.created_by?.profile_pic}
                      alt={opportunityDetails?.created_by?.email}
                    />
                    &nbsp; &nbsp;
                    {opportunityDetails?.created_by?.email}
                    {/* {opportunityDetails?.first_name}&nbsp;
                                        {opportunityDetails?.last_name} */}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  marginTop: '10px',
                }}
              >
                <div className="title2">
                  {opportunityDetails?.name}
                  <Stack
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      mt: 1,
                    }}
                  >
                    {/* {
                                            lead.assigned_to && lead.assigned_to.map((assignItem) => (
                                                assignItem.user_details.profile_pic
                                                    ? */}
                    {users?.length
                      ? users.map((val: any, i: any) => (
                          <Avatar
                            key={i}
                            alt={val?.user_details?.email}
                            src={val?.user_details?.profile_pic}
                            sx={{ mr: 1 }}
                          />
                        ))
                      : ''}
                  </Stack>
                </div>
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {opportunityDetails?.tags?.length
                    ? opportunityDetails?.tags.map((tagData: any) => (
                        <Label tags={tagData} />
                      ))
                    : ''}
                </Stack>
              </div>
              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ width: '32%' }}>
                  <div className="title2">Name</div>
                  <div className="title3">
                    {opportunityDetails?.name || '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Lead Source</div>
                  <div className="title3">
                    {opportunityDetails?.lead_source || '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Account</div>
                  <div className="title3">
                    {opportunityDetails?.account?.name || '----'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '20px',
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ width: '32%' }}>
                  <div className="title2">Probability</div>
                  <div className="title3">
                    {/* {lead.pipeline ? lead.pipeline : '------'} */}
                    {opportunityDetails?.probability || '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Amount</div>
                  <div className="title3">
                    {opportunityDetails?.amount || '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Team</div>
                  <div className="title3">
                    {opportunityDetails?.teams?.length
                      ? opportunityDetails?.teams.map((team: any) => (
                          <Chip
                            label={team}
                            sx={{ height: '20px', borderRadius: '4px' }}
                          />
                        ))
                      : '----'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '20px',
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ width: '32%' }}>
                  <div className="title2">Currency</div>
                  <div className="title3">
                    {opportunityDetails?.currency || '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Users</div>
                  <div className="title3">
                    {opportunityDetails?.users
                      ? Array.isArray(opportunityDetails.users)
                        ? opportunityDetails.users.map(
                            (user: any, index: number) => (
                              <div key={index}>
                                {user.user_details?.email ||
                                  user.email ||
                                  'User'}
                              </div>
                            )
                          )
                        : typeof opportunityDetails.users === 'string'
                        ? opportunityDetails.users
                        : 'Users assigned'
                      : '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Contacts</div>
                  <div className="title3">
                    {opportunityDetails?.contact_name || '----'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '20px',
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ width: '32%' }}>
                  <div className="title2">Stage</div>
                  <div className="title3">
                    {opportunityDetails?.stage || '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Assigned Users</div>
                  <div className="title3">
                    {opportunityDetails?.assigned_to
                      ? Array.isArray(opportunityDetails.assigned_to)
                        ? opportunityDetails.assigned_to
                            .map(
                              (user: any) =>
                                user.user_details?.email || user.email || 'User'
                            )
                            .join(', ')
                        : typeof opportunityDetails.assigned_to === 'string'
                        ? opportunityDetails.assigned_to
                        : 'Users assigned'
                      : '----'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Closed Date</div>
                  <div className="title3">
                    {opportunityDetails?.closed_on || '----'}
                  </div>
                </div>
              </div>
              {/* </div> */}
              {/* Description */}
              <div style={{ marginTop: '2%' }}>
                <div
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid lightgray',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#1a3353f0',
                    }}
                  >
                    Description
                  </div>
                </div>
                <Box sx={{ p: '15px' }}>
                  {opportunityDetails?.description ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: opportunityDetails?.description,
                      }}
                    />
                  ) : (
                    '---'
                  )}
                </Box>
              </div>
            </Box>
          </Box>
          <Box sx={{ width: '34%' }}>
            <Box
              sx={{
                borderRadius: '10px',
                border: '1px solid #80808038',
                backgroundColor: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Activities and Notes
              </Typography>

              {/* Note input field */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Write a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  error={!!noteError}
                  helperText={noteError}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddNoteClick}
                    disabled={noteSubmitting || !note.trim()}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {noteSubmitting ? 'Submitting...' : 'Add note'}
                  </Button>
                </Box>
              </Box>

              {/* Activity items */}
              <Box sx={{ mt: 3 }}>
                {/* Display comments from API response */}
                {comments && comments.length > 0 ? (
                  <>
                    {[...comments]
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.commented_on).getTime() -
                          new Date(a.commented_on).getTime()
                      )
                      .slice(0, commentsToShow)
                      .map((comment: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{ mr: 1, width: 32, height: 32 }}
                            src={comment.commented_by_user?.profile_pic}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {capitalizeFirstLetter(
                                comment.commented_by_user?.first_name
                              ) || ''}{' '}
                              {capitalizeFirstLetter(
                                comment.commented_by_user?.last_name
                              ) || ''}
                            </Typography>
                            <Typography variant="body2">
                              {comment.comment}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 'auto' }}
                          >
                            {new Date(
                              comment.commented_on
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}

                    {/* Show More button for pagination */}
                    {comments.length > commentsToShow && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleShowMoreComments}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          Show more
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      justifyContent: 'center',
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No notes yet. Add a note to start.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
    </Box>
  );
};
