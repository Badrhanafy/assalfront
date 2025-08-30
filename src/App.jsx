import { RouterProvider } from 'react-router-dom';
import router from './router/router.jsx';
import './App.css';
import '../src/i18n.js'; 
function App() {
  return <RouterProvider router={router} />;
}

export default App;