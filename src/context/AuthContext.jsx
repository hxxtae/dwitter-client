import {
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import Header from '../components/Header';
import Login from '../pages/Login';

const AuthContext = createContext({});

const contextRef = createRef();
const csrfRef = createRef();

export function AuthProvider({ authService, authErrorEventBus, children }) {
  console.log("AuthProvider");

  const [user, setUser] = useState(undefined);
  const [csrfToken, setCsrfToken] = useState(undefined);
  console.log('AuthContext');

  useImperativeHandle(contextRef, () => (user ? user.token : undefined));
  useImperativeHandle(csrfRef, () => csrfToken);

  useEffect(() => {
    authErrorEventBus.listen((err) => {
      console.log(err);
      setUser(undefined);
    });
  }, [authErrorEventBus]);

  useLayoutEffect(() => {
    authService.csrfToken().then(setCsrfToken).catch(console.error);
  }, [authService]);

  useLayoutEffect(() => {
    authService.me().then(setUser).catch(console.error);
  }, [authService]);  
  // - 어플리케이션이 실행될 때 한번만 실행 된다.
  
  const signUp = useCallback(
    async (username, password, name, email, url) =>
      authService
        .signup(username, password, name, email, url)
        .then((user) => setUser(user)),
    [authService]
  );

  const logIn = useCallback(
    async (username, password) =>
      authService.login(username, password).then((user) => setUser(user)),
    [authService]
  );

  const logout = useCallback(
    async () => authService.logout().then(() => setUser(undefined)),
    [authService]
  );

  const context = useMemo(
    () => ({
      user,
      signUp,
      logIn,
      logout,
    }),
    [user, signUp, logIn, logout]
  );

  return (
    <AuthContext.Provider value={context}>
      {user ? (
        children
      ) : (
        <div className='app'>
          <Header />
          <Login onSignUp={signUp} onLogin={logIn} />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export class AuthErrorEventBus {
  listen(callback) { // 인자로 함수를 넘겨준다.
    this.callback = callback;
  }
  notify(error) {
    this.callback(error);
  }
  // notify() 의 메소드를 호출하면 this.callback 함수에 error 인자를 넘겨주어 해당 함수를 호출한다.
}

export default AuthContext;
export const fetchToken = () => contextRef.current;
export const fetchCsrfToken = () => csrfRef.current;
export const useAuth = () => useContext(AuthContext); // custom hook

