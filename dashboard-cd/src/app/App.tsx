import React, { Suspense } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useAuth } from './context/auth-context';

import Loading from './components/Loading';

const loadAuthenticatedApp = () => import('./Authenticated');
const AuthenticatedApp = React.lazy(loadAuthenticatedApp);
const UnAuthenticatedApp = React.lazy(() => import('./UnAuthenticated'));

function App(): React.ReactElement {
  const auth = useAuth();
  // pre-load the authenticated side in the background while the user's
  // filling out the login form.
  React.useEffect(() => {
    loadAuthenticatedApp();
  });
  return (
    <>
      <CssBaseline>
        <Suspense fallback={<Loading />}>
          {auth.isLoggedIn ? <AuthenticatedApp /> : <UnAuthenticatedApp />}
        </Suspense>
      </CssBaseline>
    </>
  );
}

export default App;
