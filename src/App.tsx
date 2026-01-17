import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout';
import {
  Dashboard,
  PotlineOverview,
  AlertManagement,
  OrderQueue,
  TappingArrangementPage,
  PotSelector,
  Schedule,
  DailyTappingPlanner,
} from '@/pages';

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pot-health" element={<PotlineOverview />} />
            <Route path="pot-health/alerts" element={<AlertManagement />} />
            <Route path="production" element={<OrderQueue />} />
            <Route path="production/arrangement" element={<TappingArrangementPage />} />
            <Route path="production/select-pots" element={<PotSelector />} />
            <Route path="production/schedule" element={<Schedule />} />
            <Route path="production-v2" element={<DailyTappingPlanner />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
