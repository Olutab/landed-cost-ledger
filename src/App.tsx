import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Method from './pages/Method';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Research from './pages/Research';

function App() {
  return (
    <Routes><Route path="/research" element={<Research />} />
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/method" element={<Method />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;