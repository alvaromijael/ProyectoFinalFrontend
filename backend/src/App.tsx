import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Income from './Pages/Income';

import './App.css'

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Income />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
