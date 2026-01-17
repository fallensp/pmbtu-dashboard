import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout';
import {
  Dashboard,
  PotlineOverview,
  AlertManagement,
  OrderQueue,
  TappingArrangement,
  PotSelector,
  ScheduleCalendar,
  DailyTappingPlanner,
} from '@/pages';

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            {/* Pot Health Routes */}
            <Route path="pot-health" element={<PotlineOverview />} />
            <Route path="pot-health/alerts" element={<AlertManagement />} />

            {/* Production v1 Routes */}
            <Route path="production" element={<OrderQueue />} />
            <Route path="production/arrangement" element={<TappingArrangement />} />
            <Route path="production/select-pots" element={<PotSelector />} />
            <Route path="production/schedule" element={<ScheduleCalendar />} />

            {/* Production v2 Routes */}
            <Route path="production-v2" element={<DailyTappingPlanner />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
