import { EnhancedMatchAnalyticsScreen } from '../../screens/cricket/EnhancedMatchAnalyticsScreen';

interface AnalyticsPageProps {
  params: {
    id: string;
  };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  return <EnhancedMatchAnalyticsScreen matchId={params.id} />;
} 