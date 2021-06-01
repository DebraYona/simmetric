import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import SignIn from '../components/SignIn';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <a href="https://www.transvip.cl/" target="_blank" rel="noopener noreferrer">Transvip</a> {new Date().getFullYear()}
    </Typography>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100vh'
    },
    paper: {
      margin: theme.spacing(8, 4),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main
    }
  })
);

export default function AuthenticationScreen() {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth='sm'>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Ingresa
          </Typography>
        <SignIn />
        <Grid container>
          <Grid item xs>
            <Button to="/forgot" component={RouterLink}>
              Olvidaste tu contraseña?
              </Button>
          </Grid>
          <Grid item>
            <Button color="primary" to="/sign-up" component={RouterLink}>
              No tienes cuenta? Inscribete
              </Button>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Copyright />
        </Box>
      </div>
    </Container>
  );
}
