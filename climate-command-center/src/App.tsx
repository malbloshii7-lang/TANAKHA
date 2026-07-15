import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import DataIntelligence from './pages/DataIntelligence'
import StrategicFramework from './pages/StrategicFramework'
import Partnerships from './pages/Partnerships'
import Governance from './pages/Governance'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="data-intelligence" element={<DataIntelligence />} />
        <Route path="strategic-framework" element={<StrategicFramework />} />
        <Route path="partnerships" element={<Partnerships />} />
        <Route path="governance" element={<Governance />} />
      </Route>
    </Routes>
  )
}
