import React from 'react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import { FaPlus, FaDownload, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
import { CustomButton, CustomIconButton, CustomFab } from './index';

/**
 * ButtonExamples - Comprehensive examples of all button variants
 * This component demonstrates how to use the reusable button components
 */
export const ButtonExamples: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Reusable Button Components
      </Typography>
      
      {/* Button Variants */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Button Variants
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
          <CustomButton variant="primary">Primary</CustomButton>
          <CustomButton variant="secondary">Secondary</CustomButton>
          <CustomButton variant="outline">Outline</CustomButton>
          <CustomButton variant="ghost">Ghost</CustomButton>
          <CustomButton variant="danger">Danger</CustomButton>
          <CustomButton variant="success">Success</CustomButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Button Sizes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Button Sizes
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <CustomButton variant="primary" size="small">Small</CustomButton>
          <CustomButton variant="primary" size="medium">Medium</CustomButton>
          <CustomButton variant="primary" size="large">Large</CustomButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Button Shapes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Button Shapes
        </Typography>
        <Stack direction="row" spacing={2}>
          <CustomButton variant="primary" shape="square">Square</CustomButton>
          <CustomButton variant="primary" shape="rounded">Rounded</CustomButton>
          <CustomButton variant="primary" shape="pill">Pill</CustomButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Buttons with Icons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Buttons with Icons
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
          <CustomButton variant="primary" startIcon={<FaPlus />}>
            Add Item
          </CustomButton>
          <CustomButton variant="outline" startIcon={<FaDownload />}>
            Export
          </CustomButton>
          <CustomButton variant="secondary" endIcon={<FaSave />}>
            Save Changes
          </CustomButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Loading States */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Loading States
        </Typography>
        <Stack direction="row" spacing={2}>
          <CustomButton variant="primary" loading>
            Loading...
          </CustomButton>
          <CustomButton variant="outline" loading startIcon={<FaDownload />}>
            Downloading...
          </CustomButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Disabled States */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Disabled States
        </Typography>
        <Stack direction="row" spacing={2}>
          <CustomButton variant="primary" disabled>
            Disabled Primary
          </CustomButton>
          <CustomButton variant="outline" disabled>
            Disabled Outline
          </CustomButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Icon Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Icon Buttons
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <CustomIconButton variant="default">
            <FaEdit />
          </CustomIconButton>
          <CustomIconButton variant="primary">
            <FaPlus />
          </CustomIconButton>
          <CustomIconButton variant="secondary">
            <FaDownload />
          </CustomIconButton>
          <CustomIconButton variant="danger">
            <FaTrash />
          </CustomIconButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Fab Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Floating Action Buttons (Navigation)
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <CustomFab direction="left">
            <FiChevronLeft />
          </CustomFab>
          <CustomFab direction="default">
            <FaPlus />
          </CustomFab>
          <CustomFab direction="right">
            <FiChevronRight />
          </CustomFab>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Real-world Usage Examples */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Real-world Examples
        </Typography>
        
        {/* Form Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Form Actions
          </Typography>
          <Stack direction="row" spacing={2}>
            <CustomButton variant="ghost">
              Cancel
            </CustomButton>
            <CustomButton variant="primary" startIcon={<FaSave />}>
              Save Changes
            </CustomButton>
          </Stack>
        </Box>

        {/* Toolbar Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Toolbar Actions
          </Typography>
          <Stack direction="row" spacing={1}>
            <CustomButton variant="outline" startIcon={<FaDownload />} shape="pill">
              Export
            </CustomButton>
            <CustomButton variant="primary" startIcon={<FaPlus />} shape="pill">
              Add User
            </CustomButton>
          </Stack>
        </Box>

        {/* Danger Actions */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Danger Actions
          </Typography>
          <Stack direction="row" spacing={2}>
            <CustomButton variant="outline">
              Cancel
            </CustomButton>
            <CustomButton variant="danger" startIcon={<FaTrash />}>
              Delete Item
            </CustomButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ButtonExamples;
