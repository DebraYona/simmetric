/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useAuth } from '../context/auth-context';

const validateEmail = email => {
  // eslint-disable-next-line
  const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;

  return expression.test(String(email).toLowerCase());
};

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  hasError: {
    color: theme.palette.error.light
  }
}));

export default function Forgot() {
  const classes = useStyles();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [code, setCode] = useState('');
  const [emailSend, setEmailSend] = useState(false);
  const [message, setMessage] = useState('');

  function validateForm() {
    setError(false);

    if (!validateEmail(email)) {
      setError(true);

      setErrorMessage('Verifica tu dirección de correo');
      return false;
    }
    if (email.length > 0) {
      setError(false);
      return true;
    }

    return false;
  }

  async function submitCode(event) {
    setLoading(true);
    event.preventDefault();
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      await auth.forgotCode(email);
      setEmailSend(true);
      setMessage(
        'We have send a code to your email. Please copy and paste it here to change your password.'
      );
    } catch (e) {
      setError(true);
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(event) {
    setLoading(true);
    event.preventDefault();
    // if (!validateForm()) {
    //   setLoading(false);
    //   return;
    // }
    try {
      await auth.forgotConfirm(email, code, password);
      setEmailSend(false);
      setEmail('');
      setCode('');
      setPassword('');
      setMessage(
        'Well done! The password was successfully changed. Please go back to the login page.'
      );
    } catch (e) {
      if (!e.success) {
        setError(true);
        setErrorMessage(e.message);
      }
    }

    setLoading(false);
  }

  return (
    <form className={classes.form} noValidate>
      <div>{message && <p>{message}</p>}</div>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={e => {
          setEmail(e.target.value);
        }}
      />
      {emailSend && (
        <>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="code"
            label="Authorization code"
            name="code"
            autoComplete="code"
            value={code}
            onChange={e => setCode(e.target.value)}
            onBlur={validateForm}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              validateForm();
            }}
            onBlur={validateForm}
          />
        </>
      )}
      <div className={classes.hasError}>{hasError ? errorMessage : ''}</div>
      <Button
        onClick={emailSend ? changePassword : submitCode}
        fullWidth
        variant="contained"
        color={isLoading ? 'secondary' : 'primary'}
        className={classes.submit}
      >
        {isLoading ? (
          <CircularProgress size={24} />
        ) : emailSend ? (
          'Save new password'
        ) : (
          'Send code'
        )}
      </Button>
      <Grid container>
        <Grid item xs>
          <Link to="/" variant="body2">
            Go back to Sign In
          </Link>
        </Grid>
      </Grid>
    </form>
  );
}
