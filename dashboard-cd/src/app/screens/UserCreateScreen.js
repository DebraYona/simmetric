import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import passwordGen from 'generate-password';
import { formatRut, RutFormat, validateRut } from '@fdograph/rut-utilities';

import { userCreation } from '../actions/user-actions';

const useStyles = makeStyles(theme =>
  createStyles({
    button: {
      margin: theme.spacing(1),
      width: '20%'
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column'
    },
    create: {
      color: '#fff'
    },
    title: {
      color: '#555',
      fontWeight: 'normal',
      marginLeft: 10
    },
    hasError: {
      color: theme.palette.error.light
    },
    formControl: {
      width: 300,
      marginBottom: 20
    },
    submit: {
      width: 300,
      marginTop: 10,
      marginRight: 10
    },
    error: {
      color: '#f44336',
      fontWeight: 'bold',
      fontSize: '1.1em'
    },
    success: {
      color: 'rgb(0 107 33 / 87%)',
      fontWeight: 'bold',
      fontSize: '1.1em'
    }
  })
);

function UserCreateScreen() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const users = useSelector(state => state.users);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      rut: '',
      password: passwordGen.generate({
        length: 10,
        numbers: true
      }),
      phone: '',
      role: ''
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .max(100, 'Máximo 100 caracteres')
        .required('Necesitamos el nombre!'),
      lastName: Yup.string()
        .max(100, 'Máximo 100 caracteres')
        .required('Necesitamos el apellido!'),
      email: Yup.string()
        .email('Dirección de email inválida')
        .required('Necesitamos el email!'),
      role: Yup.number().required('Por favor selecciona un rol'),
      phone: Yup.string()
        .max(9, 'Máximo 9 caracteres')
        .required('El teléfono es requerido'),
      rut: Yup.string()
        .required('Por favor ingresa un RUT')
        .test('Rut valido', 'Rut no valido', value => {
          if (!value) {
            return false;
          }
          const validRut = `${value.slice(0, value.length - 1)}-${value.slice(
            value.length - 1
          )}`;
          return validateRut(validRut);
        }),
      password: Yup.string()
        .min(8, 'La contraseña debe ser de al menos 8 caracteres')
        .required('La contraseña es obligatoria')
    }),
    onSubmit: async values => {
      const body = { ...values };
      body.phone = `+56${body.phone}`;
      setMessage('');
      const result = await dispatch(userCreation(body));
      if (result) {
        formik.resetForm();
        setMessage(`El usuario ha sido creado con contraseña ${body.password}`);
      }
    }
  });

  return (
    <Paper className={classes.paper}>
      <h1 className={classes.title}>Usuarios</h1>
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
              name="phone"
              id="phone"
              label="Teléfono"
              variant="outlined"
              required
              fullWidth
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.phone && formik.touched.phone}
              helperText={
                formik.touched.phone && formik.errors.phone
                  ? formik.errors.phone
                  : null
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" style={{ paddingRight: 5 }}>
                    +56
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="rut"
              id="rut"
              label="RUT"
              variant="outlined"
              required
              fullWidth
              value={formatRut(formik.values.rut, RutFormat.DOTS_DASH)}
              onChange={e => {
                e.target.value = e.target.value
                  .replace(new RegExp('\\.', 'g'), '')
                  .replace(new RegExp('-', 'g'), '');

                formik.handleChange(e);
              }}
              onBlur={formik.handleBlur}
              error={formik.errors.rut && formik.touched.rut}
              helperText={
                formik.touched.rut && formik.errors.rut
                  ? formik.errors.rut
                  : null
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl
              className={classes.formControl}
              error={formik.errors.role && formik.touched.role}
            >
              <InputLabel id="role2">Rol</InputLabel>
              <Select
                id="role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
              >
                <MenuItem value="">
                  <em>Selecciona un rol</em>
                </MenuItem>
                <MenuItem value={1}>Admin</MenuItem>
                <MenuItem value={2}>Chofer</MenuItem>
                <MenuItem value={3}>Bodega</MenuItem>
                <MenuItem value={4}>Cliente retail</MenuItem>
              </Select>
              {formik.errors.role && formik.touched.role && (
                <FormHelperText>{formik.errors.role}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="password"
              id="password"
              label="Contraseña"
              variant="outlined"
              required
              fullWidth
              type="text"
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
        {users.error &&
          (users.error.code === 'UsernameExistsException' ? (
            <p className={classes.error}>El usuario ya existe!</p>
          ) : (
            <p className={classes.error}>
              Ha ocurrido un error por favor intenta de nuevo.
            </p>
          ))}
        {message && message !== '' && (
          <p className={classes.success}>{message}</p>
        )}
        <Button
          disabled={formik.isSubmitting}
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          Crear
        </Button>
        <Button
          disabled={formik.isSubmitting}
          type="reset"
          fullWidth
          variant="contained"
          onClick={formik.resetForm}
          className={classes.submit}
        >
          Cancelar
        </Button>
      </form>
    </Paper>
  );
}

export default UserCreateScreen;
