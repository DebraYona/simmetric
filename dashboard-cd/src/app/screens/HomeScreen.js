import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import Refresh from '@material-ui/icons/Refresh';
// import DateFnsUtils from '@date-io/date-fns';
// import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
// import esLocale from 'date-fns/locale/es';
// import subDays from 'date-fns/subDays';

import { fetchProducts } from '../actions/product-actions';

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

function HomeScreen() {
  const classes = useStyles();
  const dispatch = useDispatch();
  // const [errors, setErrors] = useState();

  // const startDate = subDays(new Date(), 7);
  // const [initialDate, handleInitDateChange] = useState(startDate);
  // const [finishDate, handleFinishDateChange] = useState(new Date());
  const products = useSelector(state => state.products);

  useEffect(() => {
    const fetch = async () => {
      dispatch(fetchProducts());
    };
    fetch();
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchProducts());
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
      <h1 className={classes.title}>Estado bultos</h1>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <div>
            {products.isLoading && <CircularProgress size={20} />}
            {!products.isLoading && products.data.length > 0 && (
              <h4 style={{ marginLeft: 10 }}>
                Bultos totales: {products.data.length}
              </h4>
            )}
            <Button onClick={refresh} style={{ marginBottom: 20 }}>
              <Refresh /> Actualizar
            </Button>
          </div>
        </Grid>
        <Grid item xs={6}>
          <div>
            {/* <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <p>Inicio</p>
                  <DateTimePicker
                    value={initialDate}
                    onChange={handleInitDateChange}
                    format="dd/MM/yyyy HH:mm"
                    ampm={false}
                    disableFuture
                  />
                </Grid>
                <Grid item xs={6}>
                  <p>Fin</p>
                  <DateTimePicker
                    value={finishDate}
                    onChange={handleFinishDateChange}
                    format="dd/MM/yyyy HH:mm"
                    ampm={false}
                    disableFuture
                  />
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider> */}
          </div>
        </Grid>
      </Grid>

      <div>
        <MaterialTable
          columns={[
            { title: 'CUD', field: 'identifier' },
            {
              title: 'Estatus',
              field: 'status',
              lookup: {
                100: 'Creado',
                110: 'Modificado',
                190: 'Cancelado',
                201: 'En carga transporte',
                210: 'En tránsito a CD',
                215: 'Esperando verificación CD',
                220: 'Verificado en CD',
                230: 'Devuelto a CD',
                240: 'Devuelto en tránsito a retail',
                250: 'Devuelto a retail',
                301: 'Enviado a última milla'
              }
            },
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
              title: 'Operador',
              field: 'Travel.warehouse_user_last_name',
              render: rowData => {
                if (rowData['Travel.warehouse_user_name']) {
                  return `${rowData['Travel.warehouse_user_name']} ${rowData['Travel.warehouse_user_last_name']}`;
                }
                return '-';
              },
              customFilterAndSearch: (term, rowData) => {
                if (
                  !rowData['Travel.warehouse_user_name'] ||
                  !rowData['Travel.warehouse_user_last_name']
                ) {
                  return false;
                }
                return (
                  rowData['Travel.warehouse_user_name'].includes(term) ||
                  rowData['Travel.warehouse_user_last_name'].includes(term)
                );
              }
            },
            {
              title: 'Pedido',
              field: 'Order.job_id'
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

export default HomeScreen;
