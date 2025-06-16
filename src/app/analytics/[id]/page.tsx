import { CricketAnalyticsScreen } from '../../screens/cricket/CricketAnalyticsScreen';

interface AnalyticsPageProps {
  params: {
    id: string;
  };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  return <CricketAnalyticsScreen matchId={params.id} />;
} 