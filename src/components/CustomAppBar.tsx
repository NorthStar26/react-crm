import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Breadcrumbs, Link, Button } from '@mui/material';
import { useMyContext } from '../context/Context';
import { FaCheckCircle, FaEdit, FaTimesCircle } from 'react-icons/fa';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';

// Типизация пропсов
interface CustomAppBarProps {
  module: string;
  crntPage: string;
  backBtn?: string;
  backbtnHandle?: () => void;
  editHandle?: () => void;
  onCancel?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  disabled?: boolean;
  variant?: 'form' | 'detail' | 'view'; // New prop to define page type
}

export function CustomAppBar({
  module,
  crntPage,
  backBtn,
  backbtnHandle,
  editHandle,
  onCancel,
  onSubmit,
  disabled = false,
  variant,
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
                {backBtn}
              </Button>
            </div>
            <div>
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

      case 'view':
      default:
        return null; // No buttons for view pages
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
