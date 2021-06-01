import React from 'react';
import { useFormik } from 'formik';
import { withRouter } from 'react-router-dom';
import * as Yup from 'yup';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { makeStyles, createStyles } from '@material-ui/core/styles';

import { useAuth } from '../context/auth-context';

const useStyles = makeStyles(theme =>
  createStyles({
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3)
    },
    submit: {
      margin: theme.spacing(3, 0, 2)
    }
  })
);

function VerifyCode(props) {
  const classes = useStyles();
  const auth = useAuth();
  const { email } = props;
  const formik = useFormik({
    initialValues: {
      code: '',
      email: email || ''
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .max(10, 'Invalid code')
        .required('Please enter the code that you receive in your email'),
      email: Yup.string()
        .email('Invalid email address')
        .required('We need your email!')
    }),
    onSubmit: async values => {
      console.log(values);
      try {
        await auth.confirmCode(values.email, values.code);
        console.log(props);
        props.history.push('/');
      } catch (error) {
        console.log(error);
      }
    }
  });

  return (
    <form className={classes.form} onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="code"
            id="code"
            label="Verification Code"
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
        <Grid item xs={12}>
          <TextField
            name="email"
            id="email"
            label="Email Address"
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
      </Grid>
      <Button
        disabled={formik.isSubmitting}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Verify code
      </Button>
    </form>
  );
}

export default withRouter(VerifyCode);
