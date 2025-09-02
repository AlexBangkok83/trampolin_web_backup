import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/dashboard/page';

jest.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Bar: () => <canvas data-testid="bar-chart" />,
  Doughnut: () => <canvas data-testid="doughnut-chart" />,
  Pie: () => <canvas data-testid="pie-chart" />,
}));

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    render(<DashboardPage />);
    const heading = screen.getByRole('heading', { name: /dashboard/i });
    expect(heading).toBeInTheDocument();
  });
});
