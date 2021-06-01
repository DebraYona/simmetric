import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import Refresh from '@material-ui/icons/Refresh';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import { fetchProductsByStatus } from '../actions/product-actions';

import { groupBy } from '../utils/helpers';

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
    },
    block: {
      display: 'block',
      width: '100%',
      marginLeft: 10
    }
  })
);

function TravelsScreen() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const groupByLocation = useSelector(state => {
    let locationListWithProductCount = [];
    if (state.products && state.products.data.length > 0) {
      const grouped = groupBy('Order.Location.name', state.products.data);
      locationListWithProductCount = Object.keys(grouped).map(k => {
        return {
          id: grouped[k][0]['Order.location_id'],
          name: k,
          count: grouped[k].length
        };
      });
    }
    return locationListWithProductCount;
  });
  const products = useSelector(state => state.products);

  useEffect(() => {
    const fetch = async () => {
      dispatch(fetchProductsByStatus(210));
    };
    fetch();
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchProductsByStatus(210));
  };

  const titleCase = str => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  return (
    <Paper className={classes.paper}>
      <h1 className={classes.title}>Viajes en camino a CD</h1>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <div>
            {products.isLoading && <CircularProgress size={20} />}
            {!products.isLoading && products.data.length > 0 && (
              <h4 style={{ marginLeft: 10 }}>
                Bultos totales: {products.data.length}
              </h4>
            )}
            <div className={classes.block}>
              {!products.isLoading &&
                groupByLocation.length > 0 &&
                groupByLocation.map(g => (
                  <>
                    <p key>
                      Localidad: <strong>{g.name}</strong> - Bultos:{' '}
                      <strong>{g.count}</strong>
                    </p>
                    <hr />
                  </>
                ))}
            </div>
            <Button onClick={refresh} style={{ marginBottom: 20 }}>
              <Refresh /> Actualizar
            </Button>
          </div>
        </Grid>
      </Grid>

      <div>
        <MaterialTable
          columns={[
            { title: 'CUD', field: 'identifier' },
            { title: 'Cantidad', field: 'quantity', filtering: false },

            {
              title: 'Conductor',
              field: 'Travel.driver_last_name',
              render: rowData => {
                if (rowData['Travel.driver_name']) {
                  return `${rowData['Travel.driver_name']} ${rowData['Travel.driver_last_name']}`;
                }
                return '-';
              },
              customFilterAndSearch: (term, rowData) => {
                if (
                  !rowData['Travel.driver_name'] ||
                  !rowData['Travel.driver_last_name']
                ) {
                  return false;
                }
                return (
                  rowData['Travel.driver_name'].includes(term) ||
                  rowData['Travel.driver_last_name'].includes(term)
                );
              }
            },
            {
              title: 'Orden Servicio',
              field: 'Order.service_order_id'
            },
            {
              title: 'Origen',
              field: 'Order.Location.name'
            },
            {
              title: 'Comuna destino',
              field: 'Order.Dropoffs.comuna',
              render: rowData => {
                if (rowData['Order.Dropoffs.comuna']) {
                  return titleCase(rowData['Order.Dropoffs.comuna']);
                }
                return '-';
              }
            },
            {
              title: 'Última actualización',
              field: 'updated_at',
              render: rowData => {
                const date = Date.parse(rowData.updated_at);
                const options = {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  hour12: false,
                  timeZone: 'America/Santiago'
                };
                const dateTimeFormat = new Intl.DateTimeFormat(
                  'es',
                  options
                ).format(date);

                return dateTimeFormat;
              }
            }
          ]}
          data={products.data}
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

export default TravelsScreen;
