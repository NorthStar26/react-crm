// import React, { useState } from 'react';
// import {
//   TextField,
//   AccordionDetails,
//   Accordion,
//   AccordionSummary,
//   Typography,
//   Box,
//   Divider,
//   FormControl,
//   Select,
//   MenuItem,
//   Avatar,
//   FormHelperText,
//   Alert,
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { CompaniesUrl } from '../../services/ApiUrls';
// import { CustomAppBar } from '../../components/CustomAppBar';
// import { fetchData } from '../../components/FetchData';
// import { RequiredTextField } from '../../styles/CssStyled';
// import { SuccessAlert } from '../../components/Button/SuccessAlert';
// import '../../styles/style.css';
// import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
// import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
// import COUNTRIES from '../../data/countries';
// import INDCHOICES from '../../data/INDCHOICES';

// type FormErrors = {
//   name?: string[];
//   email?: string[];
//   phone?: string[];
//   website?: string[];
//   industry?: string[];
//   billing_street?: string[];
//   billing_address_number?: string[];
//   billing_city?: string[];
//   billing_postcode?: string[];
//   billing_country?: string[];
//   non_field_errors?: string[];
//   detail?: string[];
// };

// interface FormData {
//   name: string;
//   email: string;
//   phone: string;
//   website: string;
//   industry: string;
//   billing_street: string;
//   billing_address_number: string;
//   billing_city: string;
//   billing_state: string;
//   billing_postcode: string;
//   billing_country: string;
// }

// function AddCompany() {
//   const navigate = useNavigate();
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showSuccessAlert, setShowSuccessAlert] = useState(false);

//   // Select states
//   const [industrySelectOpen, setIndustrySelectOpen] = useState(false);
//   const [countrySelectOpen, setCountrySelectOpen] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     email: '',
//     phone: '',
//     website: '',
//     industry: 'TECHNOLOGY',
//     billing_street: '',
//     billing_address_number: '',
//     billing_city: '',
//     billing_state: '',
//     billing_postcode: '',
//     billing_country: '',
//   });

//   const [errors, setErrors] = useState<FormErrors>({});

//   // Function to extract clear error text
//   const extractErrorMessage = (error: any): string => {
//     if (typeof error === 'string') {
//       return error;
//     }

//     if (error && typeof error === 'object') {
//       // Django ErrorDetail object
//       if (error.string) {
//         return error.string;
//       }
//       if (error.message) {
//         return error.message;
//       }
//       if (error.toString && typeof error.toString === 'function') {
//         const str = error.toString();
//         // Remove the prefix "ErrorDetail(string='"and suffix "', code='...')"
//         const match = str.match(/ErrorDetail\(string='([^']+)'/);
//         if (match) {
//           return match[1];
//         }
//         return str;
//       }
//     }

//     return String(error);
//   };

//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     // Clear errors when changing a field
//     if (errors[name as keyof FormErrors]) {
//       setErrors({ ...errors, [name]: undefined });
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setErrors({});

//     try {
//       const token = localStorage.getItem('Token');
//       const org = localStorage.getItem('org');

//       const headers = {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         Authorization: token
//           ? `Bearer ${token.replace(/^Bearer\s+/i, '')}`
//           : '',
//         org: org || '',
//       };

//       if (!headers.Authorization || !headers.org) {
//         setError('Missing authentication tokens');
//         return;
//       }

//       const data = {
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         website: formData.website,
//         industry: formData.industry,
//         billing_street: formData.billing_street,
//         billing_address_number: formData.billing_address_number,
//         billing_city: formData.billing_city,
//         billing_postcode: formData.billing_postcode,
//         billing_country: formData.billing_country,
//       };

//       console.log('Submitting company data:', data);

//       const res = await fetchData(
//         CompaniesUrl,
//         'POST',
//         JSON.stringify(data),
//         headers
//       );

//       console.log('API Response:', res);

//       if (res.success || !res.error) {
//         resetForm();
//         setShowSuccessAlert(true);

//         // Redirect after 2 seconds
//         setTimeout(() => {
//           navigate('/app/companies');
//         }, 2000);
//       } else {
//         //Error handling for format API
//         if (res.details && typeof res.details === 'object') {
//           console.log('Field errors received:', res.details);
//           const newErrors: FormErrors = {};

//           Object.keys(res.details).forEach((field) => {
//             const fieldErrors = res.details[field];
//             console.log(`Error for field ${field}:`, fieldErrors);

//             if (Array.isArray(fieldErrors)) {
//               newErrors[field as keyof FormErrors] =
//                 fieldErrors.map(extractErrorMessage);
//             } else {
//               newErrors[field as keyof FormErrors] = [
//                 extractErrorMessage(fieldErrors),
//               ];
//             }
//           });

//           setErrors(newErrors);
//         } else if (typeof res.message === 'string') {
//           setError(res.message);
//         } else {
//           setError('Failed to create company. Please try again.');
//         }
//       }
//     } catch (err: any) {
//       console.error('API Error:', err);

//       // Processing for API format
//       if (err.data?.details && typeof err.data.details === 'object') {
//         console.log('Catch - Field errors received:', err.data.details);
//         const newErrors: FormErrors = {};

//         Object.keys(err.data.details).forEach((field) => {
//           const fieldErrors = err.data.details[field];
//           console.log(`Catch - Error for field ${field}:`, fieldErrors);

//           if (Array.isArray(fieldErrors)) {
//             newErrors[field as keyof FormErrors] =
//               fieldErrors.map(extractErrorMessage);
//           } else {
//             newErrors[field as keyof FormErrors] = [
//               extractErrorMessage(fieldErrors),
//             ];
//           }
//         });

//         setErrors(newErrors);
//       } else if (err.data?.message) {
//         setError(err.data.message);
//       } else if (err.responseText) {
//         try {
//           const parsedError = JSON.parse(err.responseText);

//           if (parsedError.details && typeof parsedError.details === 'object') {
//             const newErrors: FormErrors = {};

//             Object.keys(parsedError.details).forEach((field) => {
//               const fieldErrors = parsedError.details[field];

//               if (Array.isArray(fieldErrors)) {
//                 newErrors[field as keyof FormErrors] =
//                   fieldErrors.map(extractErrorMessage);
//               } else {
//                 newErrors[field as keyof FormErrors] = [
//                   extractErrorMessage(fieldErrors),
//                 ];
//               }
//             });

//             setErrors(newErrors);
//           } else if (parsedError.message) {
//             setError(parsedError.message);
//           } else {
//             setError('Failed to create company. Please try again.');
//           }
//         } catch (parseErr) {
//           console.error('Error parsing response:', parseErr);
//           setError('Failed to create company. Please try again.');
//         }
//       } else {
//         setError(err?.message || 'Failed to create company. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloseSuccessAlert = () => {
//     setShowSuccessAlert(false);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       email: '',
//       phone: '',
//       website: '',
//       industry: 'TECHNOLOGY',
//       billing_street: '',
//       billing_address_number: '',
//       billing_city: '',
//       billing_state: '',
//       billing_postcode: '',
//       billing_country: '',
//     });
//     setErrors({});
//     setError(null);
//   };

//   //   const backbtnHandle = () => {
//   //     navigate('/app/companies');
//   //   };

//   const module = 'Companies';
//   const crntPage = 'Add Company';

//   const onCancel = () => {
//     resetForm();
//   };

//   return (
//     <Box sx={{ mt: '60px' }}>
//       <CustomAppBar
//         module={module}
//         crntPage={crntPage}
//         onCancel={onCancel}
//         onSubmit={handleSubmit}
//       />
//       <Box sx={{ mt: '120px' }}>
//         <form onSubmit={handleSubmit}>
//           <div style={{ padding: '10px' }}>
//             {/* Общая ошибка */}
//             {error && (
//               <Box sx={{ mb: 2 }}>
//                 <Alert severity="error" onClose={() => setError(null)}>
//                   {error}
//                 </Alert>
//               </Box>
//             )}

//             {/* Company Information */}
//             <div className="leadContainer">
//               <Accordion style={{ width: '98%' }} defaultExpanded>
//                 <AccordionSummary
//                   expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
//                 >
//                   <Typography className="accordion-header">
//                     Company Information
//                   </Typography>
//                 </AccordionSummary>
//                 <Divider className="divider" />
//                 <AccordionDetails>
//                   <Box
//                     sx={{
//                       width: '98%',
//                       color: '#1A3353',
//                       mb: 1,

//                       '& .fieldContainer, & .fieldContainer2': {
//                         paddingLeft: '1%', //Left padding for all containers
//                         paddingRight: '8%', // Right indent for alignment
//                       },
//                     }}
//                     component="form"
//                     noValidate
//                     autoComplete="off"
//                   >
//                     {/* Company Logo */}
//                     <div
//                       style={{
//                         display: 'flex',
//                         justifyContent: 'center',
//                         marginBottom: '20px',
//                       }}
//                     >
//                       <Avatar
//                         sx={{
//                           width: 100,
//                           height: 100,
//                           backgroundColor: '#f5f5f5',
//                           border: '2px solid #ddd',
//                         }}
//                       >
//                         <Typography variant="caption" color="textSecondary">
//                           Logo
//                         </Typography>
//                       </Avatar>
//                     </div>

//                     {/* Row 1 */}
//                     <div className="fieldContainer">
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Company Name</div>
//                         <RequiredTextField
//                           name="name"
//                           value={formData.name}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           //   !!!!!!!!!!!!
//                           size="small"
//                           helperText={errors?.name?.[0] || ''}
//                           error={!!errors?.name?.[0]}
//                           required
//                         />
//                       </div>
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Website</div>
//                         <TextField
//                           name="website"
//                           value={formData.website}
//                           onChange={handleChange}
//                           style={{ width: '70%' }} //   !!!!!!!!!!!!
//                           size="small"
//                           placeholder="https://company.com"
//                           helperText={errors?.website?.[0] || ''}
//                           error={!!errors?.website?.[0]}
//                         />
//                       </div>
//                     </div>

//                     {/* Row 2 */}
//                     <div className="fieldContainer2">
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Email</div>
//                         <TextField
//                           name="email"
//                           type="email"
//                           value={formData.email}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           size="small"
//                           helperText={errors?.email?.[0] || ''}
//                           error={!!errors?.email?.[0]}
//                         />
//                       </div>
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Phone</div>
//                         <TextField
//                           name="phone"
//                           value={formData.phone}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           size="small"
//                           placeholder="+12345678900"
//                           helperText={
//                             errors?.phone?.[0]
//                               ? errors.phone[0]
//                               : 'International format: +1234567890'
//                           }
//                           error={!!errors?.phone?.[0]}
//                         />
//                       </div>
//                     </div>

//                     {/* Row 3 */}
//                     <div className="fieldContainer2">
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Industry</div>
//                         <FormControl sx={{ width: '70%' }}>
//                           <Select
//                             name="industry"
//                             value={formData.industry}
//                             onOpen={() => setIndustrySelectOpen(true)}
//                             onClose={() => setIndustrySelectOpen(false)}
//                             open={industrySelectOpen}
//                             IconComponent={() => (
//                               <div className="select-icon-background">
//                                 {industrySelectOpen ? (
//                                   <FiChevronUp className="select-icon" />
//                                 ) : (
//                                   <FiChevronDown className="select-icon" />
//                                 )}
//                               </div>
//                             )}
//                             className={'select'}
//                             onChange={handleChange}
//                             error={!!errors?.industry?.[0]}
//                           >
//                             {INDCHOICES.map(([code, name]) => (
//                               <MenuItem key={code} value={code}>
//                                 {name}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                           <FormHelperText error={!!errors?.industry?.[0]}>
//                             {errors?.industry?.[0] || ''}
//                           </FormHelperText>
//                         </FormControl>
//                       </div>
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Tags</div>
//                         <TextField
//                           name="tags"
//                           value=""
//                           style={{ width: '70%' }}
//                           size="small"
//                           placeholder="Tags (Coming Soon)"
//                           disabled={true}
//                           helperText="Tag functionality will be available soon"
//                         />
//                       </div>
//                     </div>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//             </div>

//             {/* Address Information */}
//             <div
//               style={{
//                 display: 'flex',
//                 flexDirection: 'row',
//                 justifyContent: 'center',
//                 marginTop: '20px',
//               }}
//             >
//               <Accordion defaultExpanded style={{ width: '98%' }}>
//                 <AccordionSummary
//                   expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
//                 >
//                   <Typography className="accordion-header">Address</Typography>
//                 </AccordionSummary>
//                 <Divider className="divider" />
//                 <AccordionDetails>
//                   <Box
//                     sx={{
//                       width: '98%',
//                       color: '#1A3353',
//                       mb: 1,
//                       '& .fieldContainer, & .fieldContainer2': {
//                         paddingLeft: '1%',
//                         paddingRight: '8%',
//                       },
//                     }}
//                     component="form"
//                     noValidate
//                     autoComplete="off"
//                   >
//                     {/* Row 1 */}
//                     <div className="fieldContainer">
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Address Number</div>
//                         <TextField
//                           name="billing_address_number"
//                           value={formData.billing_address_number}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           size="small"
//                           helperText={errors?.billing_address_number?.[0] || ''}
//                           error={!!errors?.billing_address_number?.[0]}
//                         />
//                       </div>
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">City</div>
//                         <TextField
//                           name="billing_city"
//                           value={formData.billing_city}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           size="small"
//                           helperText={errors?.billing_city?.[0] || ''}
//                           error={!!errors?.billing_city?.[0]}
//                         />
//                       </div>
//                     </div>

//                     {/* Row 2 */}
//                     <div className="fieldContainer2">
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Street</div>
//                         <TextField
//                           name="billing_street"
//                           value={formData.billing_street}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           size="small"
//                           helperText={errors?.billing_street?.[0] || ''}
//                           error={!!errors?.billing_street?.[0]}
//                         />
//                       </div>
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">State</div>
//                         <TextField
//                           name="billing_state"
//                           value={formData.billing_state}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           size="small"
//                         />
//                       </div>
//                     </div>

//                     {/* Row 3 */}
//                     <div className="fieldContainer2">
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Postcode</div>
//                         <TextField
//                           name="billing_postcode"
//                           value={formData.billing_postcode}
//                           onChange={handleChange}
//                           style={{ width: '70%' }}
//                           size="small"
//                           helperText={errors?.billing_postcode?.[0] || ''}
//                           error={!!errors?.billing_postcode?.[0]}
//                         />
//                       </div>
//                       <div className="fieldSubContainer">
//                         <div className="fieldTitle">Country</div>
//                         <FormControl sx={{ width: '70%' }}>
//                           <Select
//                             name="billing_country"
//                             value={formData.billing_country}
//                             onOpen={() => setCountrySelectOpen(true)}
//                             onClose={() => setCountrySelectOpen(false)}
//                             open={countrySelectOpen}
//                             IconComponent={() => (
//                               <div className="select-icon-background">
//                                 {countrySelectOpen ? (
//                                   <FiChevronUp className="select-icon" />
//                                 ) : (
//                                   <FiChevronDown className="select-icon" />
//                                 )}
//                               </div>
//                             )}
//                             className={'select'}
//                             onChange={handleChange}
//                             error={!!errors?.billing_country?.[0]}
//                           >
//                             {COUNTRIES.map(([code, name]) => (
//                               <MenuItem key={code} value={code}>
//                                 {name}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                           <FormHelperText
//                             error={!!errors?.billing_country?.[0]}
//                           >
//                             {errors?.billing_country?.[0] || ''}
//                           </FormHelperText>
//                         </FormControl>
//                       </div>
//                     </div>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//             </div>
//           </div>
//         </form>
//       </Box>

//       {/* Success Alert */}
//       <SuccessAlert
//         open={showSuccessAlert}
//         message="Company added successfully"
//         onClose={handleCloseSuccessAlert}
//       />
//     </Box>
//   );
// }

// export default AddCompany;
import React, { useState } from 'react';
import {
  TextField,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  FormHelperText,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CompaniesUrl } from '../../services/ApiUrls';
import { CustomAppBar } from '../../components/CustomAppBar';
import { fetchData } from '../../components/FetchData';
import { RequiredTextField } from '../../styles/CssStyled';
import { SuccessAlert } from '../../components/Button/SuccessAlert';
import '../../styles/style.css';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import COUNTRIES from '../../data/countries';
import INDCHOICES from '../../data/INDCHOICES';

type FormErrors = {
  name?: string[];
  email?: string[];
  phone?: string[];
  website?: string[];
  industry?: string[];
  billing_street?: string[];
  billing_address_number?: string[];
  billing_city?: string[];
  billing_postcode?: string[];
  billing_country?: string[];
  non_field_errors?: string[];
  detail?: string[];
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  billing_street: string;
  billing_address_number: string;
  billing_city: string;
  billing_state: string;
  billing_postcode: string;
  billing_country: string;
  logo?: File | null;
}

// Компонент логотипа компании
const CompanyLogo = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
      }}
    >
      <Avatar
        sx={{
          width: 100,
          height: 100,
          backgroundColor: '#f5f5f5',
          border: '2px dashed #ddd',
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Logo
        </Typography>
      </Avatar>
    </div>
  );
};

// Компонент для отображения общей ошибки
const ErrorDisplay = ({
  error,
  onClose,
}: {
  error: string | null;
  onClose: () => void;
}) => {
  if (!error) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="error" onClose={onClose}>
        {error}
      </Alert>
    </Box>
  );
};

// Основной компонент формы
function AddCompany() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Select states
  const [industrySelectOpen, setIndustrySelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: 'TECHNOLOGY',
    billing_street: '',
    billing_address_number: '',
    billing_city: '',
    billing_state: '',
    billing_postcode: '',
    billing_country: '',
    logo: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Функция для извлечения чистого текста ошибки
  const extractErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      // Django ErrorDetail объект
      if (error.string) {
        return error.string;
      }
      if (error.message) {
        return error.message;
      }
      if (error.toString && typeof error.toString === 'function') {
        const str = error.toString();
        // Убираем префикс "ErrorDetail(string='" и суффикс "', code='...')"
        const match = str.match(/ErrorDetail\(string='([^']+)'/);
        if (match) {
          return match[1];
        }
        return str;
      }
    }

    return String(error);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Очищаем ошибки при изменении поля
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  // Обработчик загрузки логотипа
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const token = localStorage.getItem('Token');
      const org = localStorage.getItem('org');

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token
          ? `Bearer ${token.replace(/^Bearer\s+/i, '')}`
          : '',
        org: org || '',
      };

      if (!headers.Authorization || !headers.org) {
        setError('Missing authentication tokens');
        return;
      }

      const data = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        industry: formData.industry,
        billing_street: formData.billing_street,
        billing_address_number: formData.billing_address_number,
        billing_city: formData.billing_city,
        billing_postcode: formData.billing_postcode,
        billing_country: formData.billing_country,
      };

      console.log('Submitting company data:', data);

      const res = await fetchData(
        CompaniesUrl,
        'POST',
        JSON.stringify(data),
        headers
      );

      console.log('API Response:', res);

      if (res.success || !res.error) {
        resetForm();
        setShowSuccessAlert(true);

        // Перенаправление через 2 секунды
        setTimeout(() => {
          navigate('/app/companies');
        }, 2000);
      } else {
        // Обработка ошибок для вашего API формата
        if (res.details && typeof res.details === 'object') {
          console.log('Field errors received:', res.details);
          const newErrors: FormErrors = {};

          Object.keys(res.details).forEach((field) => {
            const fieldErrors = res.details[field];
            console.log(`Error for field ${field}:`, fieldErrors);

            if (Array.isArray(fieldErrors)) {
              newErrors[field as keyof FormErrors] =
                fieldErrors.map(extractErrorMessage);
            } else {
              newErrors[field as keyof FormErrors] = [
                extractErrorMessage(fieldErrors),
              ];
            }
          });

          setErrors(newErrors);
        } else if (typeof res.message === 'string') {
          setError(res.message);
        } else {
          setError('Failed to create company. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('API Error:', err);

      // Обработка ошибок строкового формата в неожиданном виде
      if (
        err.message &&
        err.message.includes('An unexpected error occurred:')
      ) {
        try {
          const jsonMatch = err.message.match(
            /An unexpected error occurred: ({.*})/
          );
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[1].replace(/'/g, '"'));
            console.log('Parsed error data:', errorData);

            const newErrors: FormErrors = {};

            Object.keys(errorData).forEach((field) => {
              const fieldErrors = errorData[field];
              console.log(`Error for field ${field}:`, fieldErrors);

              if (Array.isArray(fieldErrors)) {
                newErrors[field as keyof FormErrors] =
                  fieldErrors.map(extractErrorMessage);
              } else {
                newErrors[field as keyof FormErrors] = [
                  extractErrorMessage(fieldErrors),
                ];
              }
            });

            setErrors(newErrors);
            return;
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
        }
      }

      // Обработка для стандартного API формата
      if (err.data?.details && typeof err.data.details === 'object') {
        console.log('Field errors received:', err.data.details);
        const newErrors: FormErrors = {};

        Object.keys(err.data.details).forEach((field) => {
          const fieldErrors = err.data.details[field];

          if (Array.isArray(fieldErrors)) {
            newErrors[field as keyof FormErrors] =
              fieldErrors.map(extractErrorMessage);
          } else {
            newErrors[field as keyof FormErrors] = [
              extractErrorMessage(fieldErrors),
            ];
          }
        });

        setErrors(newErrors);
      } else if (err.data?.message) {
        setError(err.data.message);
      } else if (err.responseText) {
        try {
          const parsedError = JSON.parse(err.responseText);

          if (parsedError.details && typeof parsedError.details === 'object') {
            const newErrors: FormErrors = {};

            Object.keys(parsedError.details).forEach((field) => {
              const fieldErrors = parsedError.details[field];

              if (Array.isArray(fieldErrors)) {
                newErrors[field as keyof FormErrors] =
                  fieldErrors.map(extractErrorMessage);
              } else {
                newErrors[field as keyof FormErrors] = [
                  extractErrorMessage(fieldErrors),
                ];
              }
            });

            setErrors(newErrors);
          } else if (parsedError.message) {
            setError(parsedError.message);
          } else {
            setError('Failed to create company. Please try again.');
          }
        } catch (parseErr) {
          console.error('Error parsing response:', parseErr);
          setError('Failed to create company. Please try again.');
        }
      } else {
        setError(err?.message || 'Failed to create company. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      industry: 'TECHNOLOGY',
      billing_street: '',
      billing_address_number: '',
      billing_city: '',
      billing_state: '',
      billing_postcode: '',
      billing_country: '',
      logo: null,
    });
    setErrors({});
    setError(null);
  };

  const module = 'Companies';
  const crntPage = 'Add Company';

  const onCancel = () => {
    resetForm();
  };

  // Общие стили для полей формы
  const fieldStyles = {
    fieldContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '150px',
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: '20px',
    },
    fieldSubContainer: {
      width: '38%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    fieldTitle: {
      marginBottom: '8px',
    },
    textField: {
      width: '100%',
    },
  };

  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar
        module={module}
        crntPage={crntPage}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
      <Box sx={{ mt: '120px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '10px' }}>
            {/* Отображение общей ошибки */}
            <ErrorDisplay error={error} onClose={() => setError(null)} />

            {/* Company Information */}
            <div className="leadContainer">
              <Accordion style={{ width: '98%' }} defaultExpanded>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Company Information
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{
                      width: '98%',
                      color: '#1A3353',
                      mb: 1,
                      '& .fieldContainer, & .fieldContainer2': {
                        paddingLeft: '1%',
                        paddingRight: '8%',
                      },
                    }}
                  >
                    {/* Company Logo */}
                    <CompanyLogo />

                    {/* Row 1 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Company Name</div>
                        <RequiredTextField
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          helperText={errors?.name?.[0] || ''}
                          error={!!errors?.name?.[0]}
                          required
                        />
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Website</div>
                        <TextField
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          placeholder="https://company.com"
                          helperText={errors?.website?.[0] || ''}
                          error={!!errors?.website?.[0]}
                        />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Email</div>
                        <TextField
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          helperText={errors?.email?.[0] || ''}
                          error={!!errors?.email?.[0]}
                        />
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Phone</div>
                        <TextField
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          placeholder="+12345678900"
                          helperText={
                            errors?.phone?.[0]
                              ? errors.phone[0]
                              : 'International format: +1234567890'
                          }
                          error={!!errors?.phone?.[0]}
                        />
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Industry</div>
                        <FormControl fullWidth>
                          <Select
                            name="industry"
                            value={formData.industry}
                            onOpen={() => setIndustrySelectOpen(true)}
                            onClose={() => setIndustrySelectOpen(false)}
                            open={industrySelectOpen}
                            IconComponent={() => (
                              <div className="select-icon-background">
                                {industrySelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.industry?.[0]}
                          >
                            {INDCHOICES.map(([code, name]) => (
                              <MenuItem key={code} value={code}>
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText error={!!errors?.industry?.[0]}>
                            {errors?.industry?.[0] || ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Tags</div>
                        <TextField
                          name="tags"
                          value=""
                          size="small"
                          fullWidth
                          placeholder="Tags (Coming Soon)"
                          disabled={true}
                          helperText="Tag functionality will be available soon"
                        />
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>

            {/* Address Information */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">Address</Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{
                      width: '98%',
                      color: '#1A3353',
                      mb: 1,
                      '& .fieldContainer, & .fieldContainer2': {
                        paddingLeft: '1%',
                        paddingRight: '8%',
                      },
                    }}
                  >
                    {/* Row 1 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Address Number</div>
                        <TextField
                          name="billing_address_number"
                          value={formData.billing_address_number}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          helperText={errors?.billing_address_number?.[0] || ''}
                          error={!!errors?.billing_address_number?.[0]}
                        />
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>City</div>
                        <TextField
                          name="billing_city"
                          value={formData.billing_city}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          helperText={errors?.billing_city?.[0] || ''}
                          error={!!errors?.billing_city?.[0]}
                        />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Street</div>
                        <TextField
                          name="billing_street"
                          value={formData.billing_street}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          helperText={errors?.billing_street?.[0] || ''}
                          error={!!errors?.billing_street?.[0]}
                        />
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>State</div>
                        <TextField
                          name="billing_state"
                          value={formData.billing_state}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                        />
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Postcode</div>
                        <TextField
                          name="billing_postcode"
                          value={formData.billing_postcode}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          helperText={errors?.billing_postcode?.[0] || ''}
                          error={!!errors?.billing_postcode?.[0]}
                        />
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldTitle}>Country</div>
                        <FormControl fullWidth>
                          <Select
                            name="billing_country"
                            value={formData.billing_country}
                            onOpen={() => setCountrySelectOpen(true)}
                            onClose={() => setCountrySelectOpen(false)}
                            open={countrySelectOpen}
                            IconComponent={() => (
                              <div className="select-icon-background">
                                {countrySelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.billing_country?.[0]}
                          >
                            {COUNTRIES.map(([code, name]) => (
                              <MenuItem key={code} value={code}>
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText
                            error={!!errors?.billing_country?.[0]}
                          >
                            {errors?.billing_country?.[0] || ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </form>
      </Box>

      {/* Success Alert */}
      <SuccessAlert
        open={showSuccessAlert}
        message="Company added successfully"
        onClose={handleCloseSuccessAlert}
      />
    </Box>
  );
}

export default AddCompany;
