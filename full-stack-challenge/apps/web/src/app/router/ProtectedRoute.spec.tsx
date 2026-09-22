import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ProtectedRoute } from './ProtectedRoute';

const routes = (
  <Routes>
    <Route path="/login" element={<div>Login page</div>} />
    <Route element={<ProtectedRoute />}>
      <Route path="/machines" element={<div>Private page</div>} />
    </Route>
  </Routes>
);

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderWithProviders(routes, { route: '/machines' });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the private page when authenticated', () => {
    renderWithProviders(routes, {
      route: '/machines',
      preloadedState: { auth: { token: 't', user: { id: '1', email: 'a@b.com' }, status: 'idle', error: null } },
    });
    expect(screen.getByText('Private page')).toBeInTheDocument();
  });
});