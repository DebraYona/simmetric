import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Refresh from '@material-ui/icons/Refresh';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import MaterialTable, { MTableToolbar, MTableFilterRow } from 'material-table';
import { Chip } from '@material-ui/core';
import es from 'date-fns/locale/es';
import DateFnsUtils from '@date-io/date-fns';
import SearchIcon from '@material-ui/icons/Search';

import EditReservationForm from '../components/forms/edit-reservation-form';
import {
  fetchProductsNoConfirmed,
  fetchProductPostcreate,
  fetchProductsByStatus
} from '../actions/product-actions';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';

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
    subTitle: {
      color: '#555',
      fontWeight: 'small',
      marginLeft: 10,
      paddingLeft: 15
    },
    hasError: {
      color: theme.palette.error.light
    },
    datePicker: {
      paddingRight: '10px'
    },
    toolbarFilter: {
      paddingLeft: 15,
      marginLeft: 'auto',
      marginRight: 0
    },
    dateFilter: {
      marginLeft: 10,
      paddingLeft: 15
    },
    palette: {
      primary: {
        main: 'primary'
      },
      secondary: {
        main: 'primary'
      }
    }
  })
);

function ReservationScreen() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const products = useSelector(state => state.products);
  const productStatus = 215; // status to find products
  const [reservations, setReservations] = useState([]);
  // variables for date filter
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateUntil, setDateUntil] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleClick = () => {
    dispatch(fetchProductsByStatus(reservations));
  };

  useEffect(() => {
    const fetch = async () => {
      dispatch(fetchProductsNoConfirmed(productStatus));
    };
    fetch();
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchProductsByStatus(productStatus));
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

  /**
   * Validator date filter
   */
  const validateForm = useCallback(() => {
    const result = true;
    setHasError(false);
    setErrorMessage();

    if (!dateUntil) {
      setErrorMessage('Por favor, ingrese una fecha hasta');
      setHasError(true);
      return result;
    }
    if (!dateFrom) {
      setErrorMessage('Por favor, ingrese una fecha desde');
      setHasError(true);
      return result;
    }

    if (dateFrom > dateUntil) {
      setErrorMessage('La fecha hasta debe ser superior a la fecha desde');
      setHasError(true);
      return result;
    }

    return !result;
  }, [dateFrom, dateUntil]);

  useEffect(() => {
    validateForm();
  }, [dateUntil, dateFrom, validateForm]);

  /**
   * Filter and find products
   * @param {*} event event form
   */
  async function submit(event) {
    event.preventDefault();
    try {
      if (validateForm()) {
        return;
      }
      const filter = {
        dateUntil: dateUntil.toISOString().split('T')[0],
        dateFrom: dateFrom.toISOString().split('T')[0]
      };

      dispatch(fetchProductsByStatus(productStatus, filter));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Paper className={classes.paper}>
      <h1 className={classes.title}>Reservas no confirmadas</h1>
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
      </Grid>
      <div className={classes.toolbarFilter}>
        <h4 className={classes.subTitle}>Buscar pickups por fecha:</h4>
        <form className={classes.form} noValidate>
          <div className={classes.dateFilter}>
            <div className={classes.hasError}>{errorMessage}</div>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                className={classes.datePicker}
                variant="inline"
                format="dd/MM/yyyy"
                margin="normal"
                id="date-picker-from"
                label="Fecha desde:"
                value={dateFrom}
                autoOk
                onChange={date => {
                  setDateFrom(date);
                }}
                error={hasError}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
              />
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                className={classes.datePicker}
                format="dd/MM/yyyy"
                autoOk
                margin="normal"
                id="date-picker-until"
                label="Fecha hasta:"
                value={dateUntil}
                onChange={date => {
                  setDateUntil(date);
                }}
                error={hasError}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
              />
            </MuiPickersUtilsProvider>
            <Button
              onClick={submit}
              type="submit"
              color="primary"
              className={classes.submit}
              startIcon={<SearchIcon />}
            />
          </div>
        </form>
      </div>
      <div>
        <MaterialTable
          className={classes.palette}
          columns={[
            {
              title: 'Editar',
              field: 'edit',
              filtering: false,
              width: 100,
              render: rowData => <EditReservationForm data={rowData} />
            },
            { title: 'CUD', field: 'identifier', width: 200 },
            { title: 'Order', field: 'Order.service_order_id', width: 150 },
            {
              title: 'Dirección linea 1',
              field: 'Order.Dropoffs.address',
              filtering: false,
              width: 150
            },
            {
              title: 'Dirección linea 2',
              field: 'Order.Dropoffs.address_2',
              filtering: false,
              width: 150
            },
            {
              title: 'Comuna',
              field: 'Order.Dropoffs.comuna',
              render: rowData => {
                if (rowData['Order.Dropoffs.comuna']) {
                  return titleCase(rowData['Order.Dropoffs.comuna']);
                }
                return '-';
              },
              width: 150
            },
            {
              title: 'Fecha Dropoff',
              field: 'Order.Dropoffs.time',
              type: 'date',
              customFilterAndSearch: (term, rowData) => {
                const date = new Intl.DateTimeFormat('es-US').format(
                  Date.parse(rowData['Order.Pickups.time'])
                );
                return date.includes(term);
              },
              render: rowData => {
                return new Intl.DateTimeFormat('es').format(
                  Date.parse(rowData['Order.Pickups.time'])
                );
              },
              width: 150
            },
            {
              title: 'Fecha Pickup',
              field: 'Order.Pickups.time',
              type: 'date',
              render: rowData => {
                return new Intl.DateTimeFormat('es').format(
                  Date.parse(rowData['Order.Pickups.time'])
                );
              },
              width: 150
            },
            {
              title: 'Receptor',
              field: 'Order.Receivers.name',
              filtering: false,
              width: 150
            },
            {
              title: 'Estado',
              field: 'confirmed_status',
              lookup: {
                0: 'no confirmado',
                1: 'confirmado',
                null: 'no confirmado'
              },
              filtering: false,
              width: 150
            }
          ]}
          data={products.data ? products.data : []}
          localization={{
            toolbar: {
              searchPlaceholder: 'Buscar',
              pagination: {
                labelRowsPerPage: 'Filas por página',
                labelRowsSelect: 'Filas'
              }
            },
            body: {
              emptyDataSourceMessage: 'No existe coincidencia'
            }
          }}
          title="Listado de reservas no confirmadas"
          options={{
            selection: true,
            selectionProps: () => ({
              color: 'primary'
            }),
            actionsColumnIndex: -1,
            filtering: true,
            fixedColumns: {
              left: 2
            },
            pageSize: 50,
            pageSizeOptions: [20, 50, 100],
            exportButton: true
          }}
          onSelectionChange={rows => {
            setReservations(rows);
          }}
          components={{
            Toolbar: props => (
              <div>
                <MTableToolbar {...props} />
                <div style={{ padding: '0px 10px' }}>
                  <Chip
                    label="Reservar Seleccionados"
                    variant="outlined"
                    color="primary"
                    onClick={handleClick}
                    style={{ marginRight: 5 }}
                  />
                </div>
              </div>
            ),
            FilterRow: props => {
              return (
                <MTableFilterRow
                  {...props}
                  localization={{
                    dateTimePickerLocalization: es
                  }}
                />
              );
            }
          }}
        />
      </div>
    </Paper>
  );
}

export default ReservationScreen;
