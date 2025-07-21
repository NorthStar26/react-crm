// utils/uploadFileToCloudinary.ts
/**
 * Utility for uploading various file types to Cloudinary
 * Supports documents, archives, design files, and images
 */
// We'll use dynamic imports for API services in the attachFileToLead function
// to avoid circular dependencies

// Allowed file extensions
interface AttachmentResponse {
  success: boolean;
  error?: string;
  attachment_id?: string;
  attachment?: string;
  attachment_url?: string;
  attachment_display?: string;
  created_by?: string;
  created_on?: string;
  file_type?: string[];
  download_url?: string;
}
const ALLOWED_FILE_EXTENSIONS = [
  // Documents
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'txt',
  'csv',
  'rtf',
  // Archives
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  // Design files
  'psd',
  'ai',
  'eps',
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Images
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'tiff',
  'ico',
  'heic',
  'svg',
  'avif',
  'jfif',
];

/**
 * Validates if a file type is allowed for upload
 * @param file - The file to validate
 * @returns Boolean indicating if file is allowed
 */
export const isFileTypeAllowed = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return ALLOWED_FILE_EXTENSIONS.includes(extension);
};

/**
 * Uploads a file to Cloudinary
 * @param file - The file to upload
 * @returns Object containing upload success status and URL or error
 */
export const uploadFileToCloudinary = async (file: File) => {
  if (!isFileTypeAllowed(file)) {
    return {
      success: false,
      error: 'File type not allowed. Please select a supported file format.',
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    return {
      success: false,
      error:
        'Cloudinary upload preset is not defined in environment variables.',
    };
  }

  formData.append('upload_preset', uploadPreset);

  // Determine the appropriate resource_type and content-type based on file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const documentTypes = [
    'pdf',
    'doc',
    'docx',
    'txt',
    'rtf',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
    'csv',
  ];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];

  // Map file extensions to MIME types for explicit content-type setting
  const mimeTypeMap: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    rtf: 'application/rtf',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    psd: 'image/vnd.adobe.photoshop',
    ai: 'application/postscript',
    eps: 'application/postscript',
  };

  // For documents and archives, use 'raw' resource type
  // For images, use 'image' resource type
  let resourceType = 'auto';

  if (documentTypes.includes(extension) || archiveTypes.includes(extension)) {
    resourceType = 'raw';
    formData.append('resource_type', 'raw');

    // For PDFs, use context parameter which is allowed in unsigned uploads
    if (extension === 'pdf') {
      // Context is one of the allowed parameters in unsigned uploads
      // Use the proper format for context as per Cloudinary docs
      formData.append('context', 'file_type=pdf');
    }
  }

  try {
    console.log(`Uploading file with resource_type: ${resourceType}`);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      let fileUrl = data.secure_url;

      // Store the original URL for backend API
      const originalUrl = fileUrl;

      // For PDFs, we need to ensure we have the proper URL structure
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (extension === 'pdf') {
        // Log the original URL for debugging
        console.log('Original Cloudinary URL:', fileUrl);

        // For PDFs uploaded as raw files, add a download flag
        // For raw files access, we need special handling
        if (fileUrl.includes('/raw/upload/')) {
          // Add fl_attachment to make it directly downloadable
          fileUrl = fileUrl + '?dl=1';
        } else if (fileUrl.includes('/image/upload/')) {
          // If Cloudinary incorrectly categorized it as an image, correct it
          fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
          fileUrl = fileUrl + '?dl=1';
        }

        console.log('Modified PDF URL for download:', fileUrl);
      }

      // Return both URLs - one for display/download and one for backend API
      return {
        success: true,
        url: fileUrl, // Modified URL for frontend download/display
        originalUrl: originalUrl, // Original unmodified URL for backend API
        publicId: data.public_id,
        fileType: file.type,
        fileName: data.original_filename || file.name, // Use the original filename from Cloudinary if available
        display_name: data.display_name || file.name, // Include display_name from Cloudinary
      };
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Attaches a file to a lead by posting to the API
 * @param leadId - ID of the lead to attach the file to
 * @param fileUrl - URL of the uploaded file (from Cloudinary)
 * @param fileName - Name of the file
 * @param fileType - MIME type of the file
 * @param headers - Request headers
 * @returns Response from the API
 */
export const attachFileToLead = async (
  leadId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  headers: any
) => {
  try {
    // Import the necessary components directly to avoid any potential issues
    const { fetchData } = await import('../components/FetchData');
    const { LeadUrl } = await import('../services/ApiUrls');

    // The correct endpoint for attachments
    const attachmentEndpoint = `${LeadUrl}/attachment/`;

    console.log('Preparing to attach file to lead:', {
      url: attachmentEndpoint,
      leadId,
      fileUrl,
      fileName,
      fileType,
    });

    // Create the payload according to the API requirements
    const payload = {
      lead_id: leadId,
      file_name: fileName,
      file_type: fileType,
      file_url: fileUrl,
    };

    const data = JSON.stringify(payload);
    console.log('Sending payload to API:', payload);

    // Use the fetchData function to post to the attachment endpoint
    const result = await fetchData(attachmentEndpoint, 'POST', data, headers);

    if (result.error) {
      throw new Error(result.error || 'Failed to attach file to lead');
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Attaches a file to an opportunity by posting to the API
 * @param opportunityId - ID of the opportunity to attach the file to
 * @param fileUrl - URL of the uploaded file (from Cloudinary)
 * @param fileName - Name of the file
 * @param fileType - MIME type of the file
 * @param headers - Request headers
 * @returns Response from the API
 */
export const attachFileToOpportunity = async (
  opportunityId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  headers: { Authorization: string; org: string },
  attachmentType?: string // Добавляем новый параметр
): Promise<AttachmentResponse> => {
  try {
    const { OpportunityUrl } = await import('../services/ApiUrls');

    // Формируем полный URL

    const attachmentEndpoint = `${OpportunityUrl}/attachment/`;

    console.log('Preparing to attach file to opportunity:', {
      endpoint: attachmentEndpoint,
      opportunityId,
      fileUrl,
      fileName,
      fileType,
      attachmentType, // Логируем новый параметр
    });

    // Создаем payload согласно требованиям API
    const payload = {
      opportunity_id: opportunityId,
      file_name: fileName,
      file_type: fileType,
      file_url: fileUrl,
      attachment_type: attachmentType || 'proposal', // Добавляем attachment_type в payload
    };

    console.log('Sending payload to API:', payload);

    // Делаем прямой fetch запрос с правильными заголовками
    const response = await fetch(attachmentEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: headers.Authorization,
        org: headers.org,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (!response.ok || result.error) {
      throw new Error(
        result.detail ||
          result.errors ||
          result.error ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Возвращаем типизированный ответ
    return {
      success: true,
      attachment_id: result.attachment_id,
      attachment: result.attachment,
      attachment_url: result.attachment_url,
      attachment_display: result.attachment_display,
      created_by: result.created_by,
      created_on: result.created_on,
      file_type: result.file_type,
      download_url: result.download_url,
    };
  } catch (error) {
    console.error('Error in attachFileToOpportunity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Deletes an attachment from an opportunity
 * @param opportunityId - ID of the opportunity
 * @param attachmentId - ID of the attachment to delete
 * @param headers - Request headers
 * @returns Response from the API
 */
export const deleteOpportunityAttachment = async (
  opportunityId: string,
  attachmentId: string,
  headers: any
) => {
  try {
    const { fetchData } = await import('../components/FetchData');
    const { OpportunityUrl } = await import('../services/ApiUrls');

    // Для удаления используем endpoint с pk и attachment_id
    const deleteEndpoint = `${OpportunityUrl}/attachment/${opportunityId}/${attachmentId}/`;

    const result = await fetchData(
      deleteEndpoint,
      'DELETE',
      null as any,
      headers
    );

    if (result.error) {
      throw new Error(
        result.errors || result.error || 'Failed to delete attachment'
      );
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Gets all attachments for an opportunity
 * @param opportunityId - ID of the opportunity
 * @param headers - Request headers
 * @returns List of attachments
 */
export const getOpportunityAttachments = async (
  opportunityId: string,
  headers: any
) => {
  try {
    const { fetchData } = await import('../components/FetchData');
    const { OpportunityUrl } = await import('../services/ApiUrls');

    // Для получения списка attachments используем endpoint с pk
    const attachmentsEndpoint = `${OpportunityUrl}/attachment/${opportunityId}/`;

    const result = await fetchData(
      attachmentsEndpoint,
      'GET',
      null as any,
      headers
    );

    if (result.error) {
      throw new Error(
        result.errors || result.error || 'Failed to get attachments'
      );
    }

    return {
      success: true,
      attachments: result.attachments || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      attachments: [],
    };
  }
};

/**
 * Complete process to upload a file and attach it to a lead
 * @param leadId - ID of the lead to attach the file to
 * @param file - The file to upload and attach
 * @param headers - Request headers
 * @returns Result of the operation
 */
export const uploadAndAttachFileToLead = async (
  leadId: string,
  file: File,
  headers: any
) => {
  console.log('Starting file upload process for lead ID:', leadId);

  // First upload to Cloudinary
  const uploadResult = await uploadFileToCloudinary(file);
  console.log('Cloudinary upload result:', uploadResult);

  if (!uploadResult.success) {
    console.error('Cloudinary upload failed:', uploadResult.error);
    return uploadResult;
  }

  // Then attach the file URL to the lead
  console.log('Attaching file to lead with URL:', uploadResult.url);

  // Make sure we use the correct URL for the backend
  // The backend should store the original secure_url
  const apiUrl = uploadResult.originalUrl || uploadResult.url;

  console.log('Using API URL for attachment:', apiUrl);

  // Get the file information needed for the API
  const fileName = file.name;
  const fileType = file.type;

  const attachResult = await attachFileToLead(
    leadId,
    apiUrl,
    fileName,
    fileType,
    headers
  );
  console.log('Attachment API result:', attachResult);

  if (!attachResult.success) {
    console.error('File attachment failed:', attachResult.error);
    return {
      success: false,
      error: `File uploaded but failed to attach: ${attachResult.error}`,
      cloudinaryUrl: uploadResult.url, // Still return the URL in case needed
    };
  }

  return {
    success: true,
    url: uploadResult.url,
    fileName: file.name,
    fileType: file.type,
    attachmentData: attachResult.data,
  };
};

/**
 * Complete process to upload a file and attach it to an opportunity
 * @param opportunityId - ID of the opportunity to attach the file to
 * @param file - The file to upload and attach
 * @param headers - Request headers
 * @returns Result of the operation
 */
export const uploadAndAttachFileToOpportunity = async (
  opportunityId: string,
  file: File,
  headers: { Authorization: string; org: string },
  attachmentType?: string // Добавляем параметр attachmentType
) => {
  console.log(
    'Starting file upload process for opportunity ID:',
    opportunityId
  );

  // First upload to Cloudinary
  const uploadResult = await uploadFileToCloudinary(file);
  console.log('Cloudinary upload result:', uploadResult);

  if (!uploadResult.success) {
    console.error('Cloudinary upload failed:', uploadResult.error);
    return uploadResult;
  }

  // Then attach the file URL to the opportunity
  console.log('Attaching file to opportunity with URL:', uploadResult.url);

  // Use the original URL for the backend
  const apiUrl = uploadResult.originalUrl || uploadResult.url;

  console.log('Using API URL for attachment:', apiUrl);

  // Get the file information needed for the API
  const fileName = file.name;
  const fileType = file.type;

  const attachResult = await attachFileToOpportunity(
    opportunityId,
    apiUrl,
    fileName,
    fileType,
    headers,
    attachmentType // Передаем attachmentType
  );
  console.log('Attachment API result:', attachResult);

  if (!attachResult.success) {
    console.error('File attachment failed:', attachResult.error);
    return {
      success: false,
      error: `File uploaded but failed to attach: ${attachResult.error}`,
      cloudinaryUrl: uploadResult.url, // Still return the URL in case needed
    };
  }

  return {
    success: true,
    url: uploadResult.url,
    originalUrl: uploadResult.originalUrl,
    fileName: file.name,
    fileType: file.type,
    attachmentData: attachResult,
  };
};
