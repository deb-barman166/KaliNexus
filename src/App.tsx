import { Desktop } from './components/Desktop';
import { Login } from './components/Login';
import { useSystemStore } from './store/useSystemStore';

export default function App() {
  const isAuthenticated = useSystemStore(state => state.isAuthenticated);

  return isAuthenticated ? <Desktop /> : <Login />;
}
