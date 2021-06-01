import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import SignUp from '../components/SignUp';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <a
        href="https://www.transvip.cl/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Transvip
      </a>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100vh'
    },
    paper: {
      margin: theme.spacing(8),
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
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registrate
        </Typography>
        <SignUp />
        <Grid container>
          <Grid item>
            <Button color="primary" to="/sign-in" component={RouterLink}>
              Ya tienes cuenta? Ingresa
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
