import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import {
  Paper,
  createStyles,
  makeStyles,
  Grid,
  TextField
} from '@material-ui/core';
import { useFormik } from 'formik';
import { setProductStatus } from '../actions/product-actions';

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
    success: {
      color: theme.palette.success.light
    }
  })
);

function ScanCudScreen() {
  const classes = useStyles();
  const dispatch = useDispatch();

  const titleCase = str => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const [errors, setErrors] = useState();
  const [message, setMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      cud: ''
    },
    validationSchema: Yup.object({
      cud: Yup.string().required('Por favor, ingrese el código')
    }),
    onSubmit: async values => {
      setErrors('');
      setMessage('');

      try {
        const result = await dispatch(setProductStatus(values.cud, 220));

        if (!result) {
          setErrors(`No existe producto asociado a este CUD: ${values.cud}`);
        } else {
          setMessage(`¡CUD Scaneado existosamente ${values.cud}!`);
        }

        formik.resetForm();
      } catch (error) {
        console.log(error);
        setErrors('Error al scanear el CUD, por favor intentelo de nuevo.');
      }
    }
  });

  return (
    <Paper className={classes.paper}>
      <h1 className={classes.title}>{titleCase('Pasos para Scanear CUD:')}</h1>

      <div>
        <h3> Puede scanear el CUD o ingresarlo con el teclado </h3>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="cud"
                id="cud"
                autoFocus
                label="CUD"
                variant="outlined"
                required
                fullWidth
                value={formik.values.cud}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.cud && formik.touched.cud}
                helperText={
                  formik.touched.cud && formik.errors.cud
                    ? formik.errors.cud
                    : null
                }
              />
            </Grid>
          </Grid>
          {errors ? (
            <strong>
              <h2 className={classes.hasError}>{errors}</h2>
            </strong>
          ) : (
              <p />
            )}
          {message ? (
            <strong>
              <h2 className={classes.success}>{message}</h2>
            </strong>
          ) : (
              <p />
            )}
        </form>
      </div>
    </Paper>
  );
}

export default ScanCudScreen;
