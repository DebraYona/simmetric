import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      textAlign: 'center',
      verticalAlign: 'middle',
      marginTop: 40,
      marginBottom: 40
    }
  })
);

const Loading: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CircularProgress />
      <p>Please wait...</p>
    </div>
  );
};

export default Loading;
