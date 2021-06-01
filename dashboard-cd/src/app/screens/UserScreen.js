import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';

import { fetchUsers } from '../actions/user-actions';

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
    }
  })
);

function UserScreen() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const users = useSelector(state => state.users);

  useEffect(() => {
    const fetch = async () => {
      dispatch(fetchUsers());
    };
    fetch();
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchUsers());
  };

  return (
    <Paper className={classes.paper}>
      <h1 className={classes.title}>Usuarios</h1>
      <div>Home</div>
      <Button component={Link} to="/users/create">
        Crear usuario
      </Button>

      <div>
        <MaterialTable
          columns={[
            { title: 'RUT', field: 'rut' },
            { title: 'Nombre', field: 'firstName' },
            { title: 'Apellido', field: 'lastName' },
            { title: 'Email', field: 'email' },
            { title: 'Role', field: 'role' }
          ]}
          data={users.data}
          localization={{
            toolbar: {
              searchPlaceholder: 'Buscar',
              pagination: {
                labelRowsPerPage: 'Filas por página',
                labelRowsSelect: 'Filas'
              }
            }
          }}
          title="Bultos carga consolidada"
          options={{
            filtering: true,
            pageSize: 50,
            pageSizeOptions: [20, 50, 100]
          }}
        />
      </div>
    </Paper>
  );
}

export default UserScreen;
