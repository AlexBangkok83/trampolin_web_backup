import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import DashboardPage from '../app/dashboard/page';

jest.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Bar: () => <canvas data-testid="bar-chart" />,
  Doughnut: () => <canvas data-testid="doughnut-chart" />,
  Pie: () => <canvas data-testid="pie-chart" />,
}));

const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: '2024-12-31',
};

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    render(
      <SessionProvider session={mockSession}>
        <DashboardPage />
      </SessionProvider>,
    );
    const heading = screen.getByRole('heading', { name: /dashboard/i });
    expect(heading).toBeInTheDocument();
  });
});
