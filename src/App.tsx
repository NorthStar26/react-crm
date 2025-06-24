import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Login from './pages/auth/Login';
import { Home } from './pages/home/Home';
import NewUserSetPassword from './pages/auth/NewUserSetPassword';
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import ResetPasswordConfirm from './pages/auth/ResetPasswordConfirm';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* <Route
            path='/'
            element={
              isLoggedIn ? (hasSelectedCompany ? (<Home />) : (<Navigate to='/company' />)) : (<Login />)
            }
          /> */}
          {/* <Route path='*' element={isLoggedIn ? <Home /> : <Login />} /> */}
          <Route path="*" element={<Home />} />
          <Route path="/app" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/activate-account/:activationKey"
            element={<NewUserSetPassword />}
          />
          <Route
            path="/auth/reset-password"
            element={<RequestPasswordReset />}
          />
          <Route
            path="/auth/reset-password/:uidb64/:token"
            element={<ResetPasswordConfirm />}
          />

          {/* <Route path="/" element={<Navigate to="/contacts" replace />} /> */}
          {/* <Route
            path='/'
            element={isLoggedIn ? <Home /> : <Login />
            // <Navigate to='/login' />
          }
          >
          </Route> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
