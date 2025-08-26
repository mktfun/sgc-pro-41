import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import './index.css';

// Pages
import Index from './pages/Index.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Clients from './pages/Clients.tsx';
import ClientDetails from './pages/ClientDetails.tsx';
import Policies from './pages/Policies.tsx';
import PolicyDetails from './pages/PolicyDetails.tsx';
import Appointments from './pages/Appointments.tsx';
import Billing from './pages/Billing.tsx';
import Faturamento from './pages/Faturamento.tsx';
import Renovacoes from './pages/Renovacoes.tsx';
import Tasks from './pages/Tasks.tsx';
import Reports from './pages/Reports.tsx';
import Sinistros from './pages/Sinistros.tsx';
import SheetsSync from './pages/SheetsSync.tsx';
import Settings from './pages/Settings.tsx';
import ProfileSettings from './pages/settings/ProfileSettings.tsx';
import SecuritySettings from './pages/settings/SecuritySettings.tsx';
import CompanySettings from './pages/settings/CompanySettings.tsx';
import ProducerSettings from './pages/settings/ProducerSettings.tsx';
import BrokerageSettings from './pages/settings/BrokerageSettings.tsx';
import TransactionSettings from './pages/settings/TransactionSettings.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/clients/:id" element={<ClientDetails />} />
                      <Route path="/policies" element={<Policies />} />
                      <Route path="/policies/:id" element={<PolicyDetails />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/faturamento" element={<Faturamento />} />
                      <Route path="/renovacoes" element={<Renovacoes />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/sinistros" element={<Sinistros />} />
                      <Route path="/sheets-sync" element={<SheetsSync />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route element={<SettingsLayout />}>
                        <Route path="/settings/profile" element={<ProfileSettings />} />
                        <Route path="/settings/security" element={<SecuritySettings />} />
                        <Route path="/settings/companies" element={<CompanySettings />} />
                        <Route path="/settings/producers" element={<ProducerSettings />} />
                        <Route path="/settings/brokerages" element={<BrokerageSettings />} />
                        <Route path="/settings/transactions" element={<TransactionSettings />} />
                      </Route>
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
