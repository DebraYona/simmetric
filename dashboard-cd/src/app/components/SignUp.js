import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { withRouter, Link } from 'react-router-dom';

import { useAuth } from '../context/auth-context';

const useStyles = makeStyles(theme =>
  createStyles({
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(2)
    },
    submit: {
      margin: theme.spacing(3, 0, 2)
    },
    error: {
      color: '#f44336'
    }
  })
);

function SignUp(props) {
  const classes = useStyles();
  const auth = useAuth();

  const [errors, setErrors] = useState('');
  const [userExists, setExists] = useState('false');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      acceptTerms: false
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .max(100, 'Máximo 100 caracteres')
        .required('Necesitamos tu nombre!'),
      lastName: Yup.string()
        .max(100, 'Máximo 100 caracteres')
        .required('Necesitamos tu apellido!'),
      email: Yup.string()
        .email('Dirección de email inválida')
        .required('Necesitamos tu email!'),
      password: Yup.string()
        .min(8, 'Tu contraseña debe ser de al menos 8 caracteres')
        .required('La contraseña es obligatoria')
    }),
    onSubmit: async values => {
      try {
        await auth.register(
          values.email,
          values.password,
          values.firstName,
          values.lastName
        );
        props.history.push(`/confirm/${values.email}`);
      } catch (error) {
        if (error.code === 'UsernameExistsException') {
          setExists(true);
        }
        setErrors(error.message);
      }
    }
  });

  return (
    <form className={classes.form} onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <TextField
            name="firstName"
            id="firstName"
            label="Nombre"
            variant="outlined"
            required
            fullWidth
            autoFocus
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.errors.firstName && formik.touched.firstName}
            helperText={
              formik.touched.firstName && formik.errors.firstName
                ? formik.errors.firstName
                : null
            }
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            name="lastName"
            id="lastName"
            label="Apellido"
            variant="outlined"
            required
            fullWidth
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.errors.lastName && formik.touched.firstName}
            helperText={
              formik.touched.lastName && formik.errors.lastName
                ? formik.errors.lastName
                : null
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="email"
            id="email"
            label="Email"
            variant="outlined"
            required
            fullWidth
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.email && formik.touched.email}
            helperText={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : null
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="password"
            id="password"
            label="Contraseña"
            variant="outlined"
            required
            fullWidth
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.errors.password && formik.touched.password}
            helperText={
              formik.touched.password && formik.errors.password
                ? formik.errors.password
                : 'La contraseña debe ser de al menos 8 caracteres'
            }
          />
        </Grid>
      </Grid>
      {errors && !userExists ? (
        <p className={classes.error}>{errors}</p>
      ) : (
        <p />
      )}
      {errors && userExists ? (
        <p style={{ fontWeight: 700 }}>
          {errors} Puedes <Link to="/login">ingresar</Link> o{' '}
          <Link to="/forgot">recuperar</Link> tu contraseña
        </p>
      ) : (
        <p className={classes.error}>{errors}</p>
      )}
      <Button
        disabled={formik.isSubmitting}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Registro
      </Button>
    </form>
  );
}

export default withRouter(SignUp);
