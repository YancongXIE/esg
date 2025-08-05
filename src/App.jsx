import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ESGdashboard from './dashboard/ESGdashboard.jsx';
import MarketingPage from './marketing-page/MarketingPage.jsx';
import SignIn from './sign-in/SignIn.jsx';
import SignUp from './sign-up/SignUp.jsx';
import Dashboard from './dashboard/Dashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/ESGdashboard" element={<ESGdashboard />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
