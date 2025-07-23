import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaFileAlt,
  FaFileCode,
  FaFile,
} from 'react-icons/fa';

interface CloudinaryFileUploadProps {
  onFileUpload: (fileData: {
    file_url: string;
    file_name: string;
    file_type: string;
    attachment_type?: string;
  }) => void;
  onError: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  buttonText?: string;
  variant?: 'button' | 'dropzone' | 'icon';
  existingFiles?: Array<{
    file_name: string;
    file_url: string;
    file_type: string;
  }>;
  onDeleteFile?: (index: number) => void;
  disabled?: boolean;
  singleFile?: boolean;
  showFileNameInButton?: boolean;
}

export const CloudinaryFileUpload: React.FC<CloudinaryFileUploadProps> = ({
  onFileUpload,
  onError,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSizeMB = 10,
  buttonText = 'Upload File',
  variant = 'button',
  existingFiles = [],
  onDeleteFile,
  disabled = false,
  singleFile = false,
  showFileNameInButton = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Функция для получения отображаемого текста кнопки
  const getButtonText = () => {
    if (showFileNameInButton && existingFiles.length > 0) {
      const fileName = existingFiles[0].file_name;
      // Обрезаем название файла если оно слишком длинное
      return fileName.length > 30
        ? `${fileName.substring(0, 27)}...`
        : fileName;
    }
    return buttonText;
  };

  const cloudName =
    process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
  const uploadPreset =
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'your_preset';

  // Get file icon based on file extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconProps = { size: 20 };

    switch (extension) {
      case 'pdf':
        return <FaFilePdf color="#d32f2f" {...iconProps} />;
      case 'doc':
      case 'docx':
        return <FaFileWord color="#2b569a" {...iconProps} />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel color="#1e7145" {...iconProps} />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint color="#d24625" {...iconProps} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage color="#4caf50" {...iconProps} />;
      case 'zip':
      case 'rar':
        return <FaFileArchive color="#795548" {...iconProps} />;
      case 'txt':
        return <FaFileAlt color="#607d8b" {...iconProps} />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'py':
      case 'java':
        return <FaFileCode color="#0288d1" {...iconProps} />;
      default:
        return <FaFile color="#757575" {...iconProps} />;
    }
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = accept
      .split(',')
      .map((ext) => ext.trim().toLowerCase());
    if (!acceptedExtensions.includes(extension)) {
      return `File type ${extension} is not allowed`;
    }

    return null;
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      // Create XMLHttpRequest to track upload progress
      return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    }
  };

  // Обработчик успешной загрузки
  const handleUploadSuccess = (result: any) => {
    // Если это singleFile режим и есть существующий файл, удаляем его
    if (singleFile && existingFiles.length > 0 && onDeleteFile) {
      onDeleteFile(0);
    }

    onFileUpload({
      file_url: result.secure_url,
      file_name: result.original_filename || result.public_id,
      file_type: result.resource_type,
    });
  };

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // For now, handle single file

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadToCloudinary(file);

      handleUploadSuccess(response);

      setUploadProgress(100);
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload file';
      onError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = '';
    }
  };

  // Render upload button )
  const renderUploadButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <IconButton
            component="label"
            color="primary"
            disabled={uploading || disabled}
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
            }}
          >
            {uploading ? <CircularProgress size={24} /> : <AttachFileIcon />}
            <input
              type="file"
              hidden
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading || disabled}
              multiple={!singleFile}
            />
          </IconButton>
        );

      case 'dropzone':
        return (
          <Box
            component="label"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: 120,
              border: '2px dashed',
              borderColor: uploading ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              bgcolor: 'background.paper',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: disabled ? 'grey.300' : 'primary.main',
                bgcolor: disabled ? 'background.paper' : 'action.hover',
              },
            }}
          >
            {uploading ? (
              <>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ width: '80%', mt: 1 }}
                />
              </>
            ) : (
              <>
                <CloudUploadIcon
                  sx={{ fontSize: 48, color: 'action.active' }}
                />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {buttonText}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click or drag file here
                </Typography>
              </>
            )}
            <input
              type="file"
              hidden
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading || disabled}
              multiple={!singleFile}
            />
          </Box>
        );

      default: // button
        return (
          <Button
            component="label"
            variant="outlined"
            endIcon={
              uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />
            }
            disabled={uploading || disabled}
            sx={{
              textTransform: 'none',
              width: '200px',
              height: 40, // фиксированная высота кнопки
              minHeight: 40, // чтобы не сжималась
              mb: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              justifyContent: 'flex-start', // чтобы текст не прятался за иконкой
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                width: '100%',
              }}
            >
              {uploading ? `Uploading... ${uploadProgress}%` : getButtonText()}
            </span>
            <input
              type="file"
              hidden
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading || disabled}
              multiple={!singleFile}
            />
          </Button>
        );
    }
  };

  return (
    <Box>
      {/* Show existing files
      {existingFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {existingFiles.map((file, index) => (
            <Chip
              key={index}
              avatar={<Avatar>{getFileIcon(file.file_name)}</Avatar>}
              label={file.file_name}
              onDelete={onDeleteFile ? () => onDeleteFile(index) : undefined}
              deleteIcon={<DeleteIcon />}
              variant="outlined"
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      )} */}

      {/* Upload button */}
      {renderUploadButton()}
    </Box>
  );
};
