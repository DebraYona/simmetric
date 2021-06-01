import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles } from "@material-ui/core/styles";

import { useAuth } from "../context/auth-context";

const useStyles = makeStyles((theme) =>
  createStyles({
    form: {
      width: "100%", // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    error: {
      color: "#f44336",
    },
  })
);

export default function SignUp() {
  const classes = useStyles();
  const auth = useAuth();

  const [errors, setErrors] = useState();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        // .email("Dirección de email inválida")
        .required("Necesitamos tu email!"),
      password: Yup.string().required("La contraseña es obligatoria"),
    }),
    onSubmit: async (values) => {
      setErrors("");

      try {
        await auth.login(values.email, values.password);
      } catch (error) {
        console.log(error);
        if (error.code === "UserNotConfirmedException") {
          console.log(error);
          // The error happens if the user didn't finish the confirmation step when signing up
          // In this case you need to resend the code and confirm the user
          // About how to resend the code and confirm the user, please check the signUp part
        } else if (error.code === "PasswordResetRequiredException") {
          console.log(error);
          // The error happens when the password is reset in the Cognito console
          // In this case you need to call forgotPassword to reset the password
          // Please check the Forgot Password part.
        } else if (
          error.code === "NotAuthorizedException" &&
          error.message === "Incorrect username or password."
        ) {
          formik.setErrors({
            email: "Por favor verifica tu email.",
            password: "Por favor verifica tu contraseña.",
          });
          setErrors(
            "Por favor verifica tus datos. El email o el password están incorrectos"
          );
          // The error happens when the incorrect password is provided
        } else if (
          error.code === "NotAuthorizedException" &&
          error.message === "Password attempts exceeded"
        ) {
          formik.setErrors({
            email: "Por favor verifica tu email.",
            password: "Por favor verifica tu contraseña.",
          });
          setErrors(
            "Demasiados intentos equivocados. Debes esperar unos minutos para volver a intentar."
          );
          // The error happens when the incorrect password is provided
        } else if (error.code === "UserNotFoundException") {
          formik.setErrors({
            email: "Por favor verifica tu email.",
            password: "Por favor verifica tu contraseña.",
          });
          // The error happens when the supplied username/email does not exist in the Cognito user pool
        } else {
          console.log(error);
        }
      }
    },
  });

  return (
    <form className={classes.form} onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
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
            helperText={formik.touched.password && formik.errors.password}
          />
        </Grid>
      </Grid>
      {errors ? <p className={classes.error}>{errors}</p> : <p />}
      <Button
        disabled={formik.isSubmitting}
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Ingresar
      </Button>
    </form>
  );
}
