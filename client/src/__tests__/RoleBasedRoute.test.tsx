import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Navigate } from 'react-router-dom';
import RoleBasedRoute from '../components/RoleBasedRoute';
import { useAppSelector } from '../hooks/redux';
import { hasRole, getDashboardRoute } from '../utils/roleUtils';

jest.mock('../hooks/redux');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(() => <div>Navigate</div>),
}));
jest.mock('../utils/roleUtils');

describe('RoleBasedRoute', () => {
  const mockChild = <div data-testid="child">Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to /login if not authenticated', () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter>
        <RoleBasedRoute allowedRoles={['admin']}>{mockChild}</RoleBasedRoute>
      </MemoryRouter>
    );

    expect(Navigate).toHaveBeenCalled();
    const mockNavigate = Navigate as jest.Mock;
    expect(mockNavigate.mock.calls[0][0]).toMatchObject({ to: '/login', replace: true });
  });

  it('should render children if user has the correct role', () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true, user: { role: 'admin' } });
    (hasRole as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter>
        <RoleBasedRoute allowedRoles={['admin']}>{mockChild}</RoleBasedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should redirect to appropriate dashboard if user does not have the correct role', () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true, user: { role: 'housekeeping' } });
    (hasRole as jest.Mock).mockReturnValue(false);
    (getDashboardRoute as jest.Mock).mockReturnValue('/housekeeping-dashboard');

    render(
      <MemoryRouter>
        <RoleBasedRoute allowedRoles={['admin']}>{mockChild}</RoleBasedRoute>
      </MemoryRouter>
    );

    expect(Navigate).toHaveBeenCalled();
    const mockNavigate = Navigate as jest.Mock;
    expect(mockNavigate.mock.calls[0][0]).toMatchObject({ to: '/housekeeping-dashboard', replace: true });
  });
});
