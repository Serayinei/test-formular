import React, { InputHTMLAttributes, useState } from 'react';
import './App.css';

export default function App() {
  const [showRegisterForm, setShowRegisterForm] = useState(true);
  return (
    <div className="App">
      <p>
        <button onClick={() => {
          setShowRegisterForm((prevState) => !prevState)
        }}>Zeige {showRegisterForm ? 'Anmelde' : 'Register'} Form</button>
      </p>
      {/* {showRegisterForm && <RegisterForm />}
      {!showRegisterForm && <LogInForm />} */}
      <RegisterForm />
      <LogInForm />
    </div>
  );
}

type RegisterFormState = {
  username: string;
  email: string;
  passwordOne: string;
  passwordTwo: string;
  error: string;
}

//wird nicht benutzt, liest (gerade bei größeren Formularen) die Daten aus per key-value-pair
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: keyof RegisterFormState;
  value: RegisterFormState[InputProps["name"]]
}
//Alternative
/*const InputComponent: React.FC<InputProps> = (props) => <input name={props.name} value={props.value} />*/

const INITIAL_STATE: RegisterFormState = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: '',
}

export const getRegisteredUsers = () => {
  const storedUsers = localStorage.getItem('registeredUsers');
  const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
  console.log('Registered Users:', registeredUsers);
  return registeredUsers;
}

export const storeUser = (newUser: RegisterFormState) => {
  const registeredUsers = getRegisteredUsers();
  registeredUsers.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}

export const RegisterForm: React.FC = () => {
  //Initialisierung Formular
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const onSubmitRegister = (event: React.FormEvent<HTMLFormElement>) => {
    //z.B. default  neuladen der Seite
    event.preventDefault();
    //extrahiert Formulardaten aus dem Zustand
    //Kurschreibweise; const username = formData.username; const email = formData.email; ...
    const { username, email, passwordOne, passwordTwo } = formData;
    //überprüft, ob alle Felder ausgefüllt und Passwörter übereinstimmen
    if (!username || !email || !passwordOne || !passwordTwo || passwordOne !== passwordTwo) {
      //kopiert vorherigen Zustand, fügt dann aktualisierte Felder hinzu (also ggf. error)
      setFormData(prevState => ({ ...prevState, error: 'Ungültig' })); //... = spread-operator, kopiert Eigenschaften eines Objekts in ein anderes oder fügt nur bestimmte Eigenschaften (basierend auf Bedingungen) hinzu
      setRegistrationSuccess(false);
      return;
    }
    //überprüfen, ob User mit gleicher E-Mail bereits registriert
    const registeredUsers = getRegisteredUsers();
    //some = Methode (bool) für Arrays, im Array wird überprüft ob mind. 1Element/ z.B. 1User-email übereinstimmt
    if (registeredUsers.some((user: RegisterFormState) => user.email === email)) {
      setFormData(prevState => ({ ...prevState, error: "Ein Account mit dieser E-Mail Adresse existiert bereits." }));
      setRegistrationSuccess(false);
      return;
    }

    //User registrieren, wenn alle Validierungen erfolgreich
    const newUser = { username, email, passwordOne, passwordTwo, error };
    storeUser(newUser);
    setRegistrationSuccess(true);

    //Formular auf Ausgangszustand (reset)
    setFormData(INITIAL_STATE);
  }

  //aktualisiert den Zustand des Formulars, wenn Wert sich in Eingabefeld ändert, aber setzt vorherigen Zustand fort (kein Neuladen)
  const onChangeRegister = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevState => ({ ...prevState, [event.target.name]: event.target.value, error: '' }));
    setRegistrationSuccess(false);
    /*const {name, value} = e.target;
    //copies all properties from the previous state into a new object
    //correctly updates form, esp. with form-input changes 
    setFormData(prevData => ({...prevData, [name]: value}))*/
  }

  const { username, email, passwordOne, passwordTwo, error } = formData;

  return (
    <div className='formWrapper'>
      <form className="formFields" onSubmit={onSubmitRegister}>
        <div className="field">
          <label htmlFor="username">Username:</label> {/*htmlFor->click auf username label bewirkt, dass im auszufüllenden Feld ist */}
          <input
            id="username" //htmlFor -> ID muss hinzugefügt werden
            name="username"
            value={username}
            onChange={onChangeRegister}
            type="text"
            placeholder="Username"
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            value={email}
            onChange={onChangeRegister}
            type="email"
            placeholder="Email"
          />
        </div>
        <div className="field">
          <label htmlFor="passwordOne">Password:</label>
          <input
            id="passwordOne"
            name="passwordOne"
            value={passwordOne}
            onChange={onChangeRegister}
            type="password"
            placeholder="Password"
          />
        </div>
        <div className="field">
          <label htmlFor="passwordTwo">Confirm Password:</label>
          <input
            id="passwordTwo"
            name="passwordTwo"
            value={passwordTwo}
            onChange={onChangeRegister}
            type="password"
            placeholder="Confirm Password"
          />
        </div>
        <button type="submit">Registrieren</button>
        <div className='field'>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {registrationSuccess && <div style={{ color: 'green' }}>Registrierung erfolgreich! Sie können sich jetzt anmelden.</div>}
        </div>
      </form>
    </div>
  )
};


////////////
//Login Form
////////////
//Todo: username und passwordOne haben keine unique ID
export const LogInForm: React.FC = () => {
  const [state, setState] = useState({ username: '', email: '', passwordOne: '', error: '' });
  const [loginSuccess, setLoginSuccess] = useState(false);

  const onSubmitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, email, passwordOne: password } = state;

    // Überprüfen, ob Benutzer im lokalen Speicher vorhanden ist
    const registeredUsers = getRegisteredUsers();
    const matchingUser = registeredUsers.find(
      (user: RegisterFormState) => {
        console.log('user in local storage:', user);
        console.log('input email', email);
        console.log('input username:', username);
        console.log('Comparison result:', (user.email.toLowerCase() === username.toLowerCase() || user.username.toLowerCase() === username.toLowerCase()) && user.passwordOne === password
        );
        return (user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase()) && user.passwordOne === password
      }
    );

    if (!matchingUser) {
      setState((prevState) => ({ ...prevState, error: 'Ungültiger Benutzername, E-Mail oder Passwort.' }));
      setLoginSuccess(false); // Zurücksetzen des Zustandes erfolgreiche Anmeldung ("erfolgreiche Anmeldung" wird nicht parallel zu Ungültig angezeigt)
      return;
    }

    // Benutzer einloggen
    setLoginSuccess(true);
    //const registeredUser = { username, email, password, error };
  };

  const onChangeLogin = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // überprüft ob Eingabe eine E-Mailadresse ist ('@')
    const isEmail = value.includes('@');
    // (isEmail [...] = bedingte Objekterverbreiterung, fügt Objekt nur hinzu, wenn Bedingung true
    setState((prevState) => ({ ...prevState, [name]: value, error: '', ...(isEmail && { email: value }) }));
    setLoginSuccess(false); //Zurücksetzen Zustand erfolgreiche Anmeldung
  };

  return (
    <div className='formWrapper'>
      <form className="formFields" onSubmit={onSubmitLogin}>
        <div className="field">
          <label htmlFor="username1">Username oder E-Mail:</label>
          <input
            id="username1"
            name="username"
            value={state.username}
            onChange={onChangeLogin}
            type="text"
            placeholder="Username oder E-Mail"
          />
        </div>
        <div className="field">
          <label htmlFor="passwordOne1">Passwort:</label>
          <input
            id="passwordOne1"
            name="passwordOne"
            value={state.passwordOne}
            onChange={onChangeLogin}
            type="password"
            placeholder="Passwort"
          />
        </div>
        <button type="submit">Anmelden</button>
        <div className="field">
          {state.error && <div style={{ color: 'red' }}>{state.error}</div>}
          {loginSuccess && <div style={{ color: 'green' }}>Login erfolgreich!</div>}
        </div>
      </form>
    </div>
  );
};
