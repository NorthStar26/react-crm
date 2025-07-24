import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Breadcrumbs,
  Link,
  Button,
  CircularProgress,
} from '@mui/material';
import { useMyContext } from '../context/Context';
import { FaCheckCircle, FaEdit, FaTimesCircle } from 'react-icons/fa';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { PipelineSaveButton, PipelineCancelButton } from './PipelineButtons';
import VectorStop from '../assets/images/VectorStop.png';
// Типизация пропсов
interface CustomAppBarProps {
  module: string;
  crntPage: string;
  backBtn?: string;
  backbtnHandle?: () => void;
  editHandle?: () => void;
  onCancel?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  onSave?: () => void;
  disabled?: boolean;
  saving?: boolean;
  variant?: 'form' | 'detail' | 'view' | 'pipeline'; // New prop to define page type
  customButtons?: React.ReactNode; // New prop to add custom buttons
}

export function CustomAppBar({
  module,
  crntPage,
  backBtn,
  backbtnHandle,
  editHandle,
  onCancel,
  onSubmit,
  onSave,
  disabled = false,
  saving = false,
  variant,
  customButtons,
}: CustomAppBarProps) {
  const location = useLocation();
  const sharedData = useMyContext();
  const navigate = useNavigate();

  const moduleUrl = module.toLowerCase();

  // Determine page type automatically if variant is not passed
  const pageVariant =
    variant ||
    (location.state?.detail
      ? 'detail'
      : onCancel || onSubmit
      ? 'form'
      : 'view');

  // Render buttons depending on page type
  const renderActionButtons = () => {
    switch (pageVariant) {
      case 'detail':
        return (
          <div className="saveClose">
            <div style={{ marginRight: '10px' }}>
              <Button
                size="small"
                className="header-button"
                onClick={backbtnHandle}
                startIcon={
                  <FiChevronLeft
                    style={{ fontSize: '20px', marginRight: '-2px' }}
                  />
                }
                style={{ backgroundColor: 'white', color: '#5B5C63' }}
              >
                {backBtn || 'Back'}
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {customButtons}
              <Button
                type="submit"
                variant="contained"
                className="header-button"
                size="small"
                onClick={editHandle}
                startIcon={<FaEdit style={{ fill: 'white', width: '16px' }} />}
                style={{
                  textTransform: 'capitalize',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="saveClose">
            <div style={{ marginRight: '10px' }}>
              <Button
                className="header-button"
                onClick={onCancel}
                size="small"
                variant="contained"
                startIcon={
                  <FaTimesCircle
                    style={{ fill: 'white', width: '16px', marginLeft: '2px' }}
                  />
                }
                sx={{
                  backgroundColor: '#2b5075',
                  ':hover': { backgroundColor: '#1e3750' },
                }}
              >
                Cancel
              </Button>
            </div>

            <div style={{ display: disabled ? 'none' : 'block' }}>
              <Button
                className="header-button"
                onClick={onSubmit}
                variant="contained"
                size="small"
                disabled={disabled}
                startIcon={
                  <FaCheckCircle
                    style={{
                      fill: disabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      width: '16px',
                      marginLeft: '2px',
                    }}
                  />
                }
              >
                Save
              </Button>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="saveClose">
            {backbtnHandle && (
              <div style={{ marginRight: '10px' }}>
                <Button
                  size="small"
                  onClick={backbtnHandle}
                  startIcon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="#1A3353"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  sx={{
                    position: 'relative',
                    width: '164px',
                    height: '40px',
                    backgroundColor: '#FFFFFF',
                    color: '#1A3353',
                    border: '1px solid #A9B4BE',
                    boxShadow:
                      '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)',
                    borderRadius: '4px',
                    textTransform: 'capitalize',
                    fontFamily: 'Roboto',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '28px',
                    letterSpacing: '0.457px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #A9B4BE',
                    },
                    '& .MuiButton-startIcon': {
                      position: 'absolute',
                      left: '13px',
                      marginLeft: 0,
                      marginRight: 0,
                    },
                  }}
                >
                  {backBtn || 'Back To List'}
                </Button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {customButtons}

              {/* Кнопка Save в тулбаре */}
              {/* <Button
                onClick={onSave}
                variant="contained"
                disabled={saving}
                startIcon={
                  saving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                      <path
                        d="M2 16V2C2 1.44772 2.44772 1 3 1H11L14 4V16C14 16.5523 13.5523 17 13 17H3C2.44772 17 2 16.5523 2 16Z"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      <path d="M11 1V4H14" stroke="white" strokeWidth="1.5" />
                    </svg>
                  )
                }
                sx={{
                  position: 'relative',
                  width: '164px',
                  height: '40px',
                  backgroundColor: '#1976D2',
                  boxShadow:
                    '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)',
                  borderRadius: '4px',
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '28px',
                  letterSpacing: '0.457px',
                  textTransform: 'capitalize',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#1565C0',
                  },
                  '&:disabled': {
                    backgroundColor: '#1976D2',
                    opacity: 0.6,
                  },
                  '& .MuiButton-startIcon': {
                    position: 'absolute',
                    left: '36px',
                    marginLeft: 0,
                    marginRight: 0,
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button> */}

              {/* Кнопка Close Step */}
              <Button
                onClick={onCancel}
                variant="contained"
                startIcon={
                  <img
                    src={VectorStop}
                    alt="Stop"
                    style={{ width: 20, height: 20 }}
                  />
                }
                sx={{
                  position: 'rilative',
                  height: '40px',
                  width: '164px',
                  backgroundColor: '#D32F2F',
                  boxShadow:
                    '0px 1px 5px rgba(0, 0, 0, 0.12), 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14)',
                  borderRadius: '5px',
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '0.15px',
                  textTransform: 'none',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#B71C1C',
                  },
                  '& .MuiButton-startIcon': {
                    position: 'absolute',
                    left: '15px',
                    marginLeft: 0,
                    marginRight: 0,
                  },
                }}
              >
                Close Step
              </Button>
            </div>
          </div>
        );
      case 'view':
        return backbtnHandle && backBtn ? (
          <div className="saveClose">
            <div style={{ marginRight: '10px' }}>
              <Button
                size="small"
                className="header-button"
                onClick={backbtnHandle}
                startIcon={
                  <FiChevronLeft
                    style={{ fontSize: '20px', marginRight: '-2px' }}
                  />
                }
                style={{ backgroundColor: 'white', color: '#5B5C63' }}
              >
                {backBtn}
              </Button>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <AppBar
      sx={{
        backgroundColor: '#1A3353',
        height: '50px',
        justifyContent: 'center',
        marginTop: '-3px',
        boxShadow: 'none',
        top: '64px',
        left: sharedData.drawerWidth === 200 ? '200px' : '60px',
        width: '-webkit-fill-available',
      }}
      position="fixed"
    >
      <div className="breadcomContainer">
        <div role="presentation" style={{ marginLeft: '10px' }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{ '.MuiBreadcrumbs-separator': { color: 'white' } }}
          >
            <Link
              underline="hover"
              color="lightgray"
              fontSize="15px"
              href="/app/dashboard"
              sx={{ ml: '15px', fontWeight: 600 }}
            >
              Dashboard
            </Link>
            <Link
              underline="hover"
              color="lightgray"
              fontSize="15px"
              onClick={() => navigate(`/app/${moduleUrl}`)}
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            >
              {module}
            </Link>
            <Link
              style={{ color: 'white', fontWeight: 600 }}
              underline="none"
              fontSize="15px"
            >
              {crntPage}
            </Link>
          </Breadcrumbs>
        </div>
        {renderActionButtons()}
      </div>
    </AppBar>
  );
}
