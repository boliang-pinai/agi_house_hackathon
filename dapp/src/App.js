import React from 'react';
import { Home } from './components/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RainbowProvider from './utils/rainbow';

function App() {
  // 包装返回内容，添加RainbowProvider
  return (
    <RainbowProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/horoscope" element={<HoroscopeDetail />} />
          <Route path="/daily-x-post" element={<DailyPost />} />
          <Route path="/memetag_cn" element={<MemeCoinTagCNDetail />} />
          <Route path="/memetag_en" element={<MemeCoinTagENDetail />} />
          <Route path="/mbti" element={<MBTIDetail />} />
          <Route path="/deep-research" element={<DeepResearchDetail />} />
          <Route path="/binance-ido" element={<BinanceIDODetail />} />
          <Route path="/ai-event-tracker" element={<AIEventTrackerDetail />} />
          <Route path="/smart-yield-move" element={<SmartYieldMoveDetail />} />
          <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
      </Router>
    </RainbowProvider>
  );
}

export default App;
