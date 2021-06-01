import 'date-fns';
import React, { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import Refresh from '@material-ui/icons/Refresh';
import _ from 'lodash';
import SearchIcon from '@material-ui/icons/Search';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';
import { fetchProductsByStatus } from '../actions/product-actions';

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
    submit: {
      margin: theme.spacing(4, 0, 2)
    }
  })
);

function PreReservationScreen() {
  const classes = useStyles();
  const dispatch = useDispatch();

  // variables for products
  const products = useSelector(state => state.products);
  const productStatus = 100; // status to find products
  const productsMapped = [];
  const groupedProducts = _.groupBy(products.data, 'Order.Location.id');

  // variables for date filter
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateUntil, setDateUntil] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  /**
   * Organize the products by location then by date,
   * those with zero quantity will not be counted
   */
  Object.keys(groupedProducts).forEach(item => {
    const productsInLocation = groupedProducts[item];

    const groupedProductsByDate = _.groupBy(productsInLocation, element => {
      return element['Order.Pickups.time']?.split('T')[0];
    });

    Object.keys(groupedProductsByDate).forEach(element => {
      const groupedProductByDate = groupedProductsByDate[element];

      const productMapped = {
        ...groupedProductByDate[0],
        quantity: _.sumBy(groupedProductByDate, 'quantity')
      };

      if (productMapped.quantity && productMapped['Order.Pickups.time']) {
        productsMapped.push(productsMapped);
      }
    });
  });

  /**
   * Hook to fetch product data
   */
  useEffect(() => {
    const fetch = async () => {
      dispatch(fetchProductsByStatus(productStatus));
    };
    fetch();
  }, [dispatch]);

  /**
   * Refresh product data
   */
  const refresh = () => {
    dispatch(fetchProductsByStatus(productStatus));
  };

  /**
   * Cast title
   */
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

  /**
   * Hook to handle validation date filter
   */
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
      <h1 className={classes.title}>Listado Prereservas</h1>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <div>
            {products.isLoading && <CircularProgress size={20} />}
            <Button onClick={refresh} style={{ marginBottom: 20 }}>
              <Refresh /> Actualizar
            </Button>
          </div>
        </Grid>
        <Grid item xs={6}>
          <></>
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
          columns={[
            { title: 'Tienda retail', field: 'Order.Location.name' },
            { title: 'Cantidad', field: 'quantity', filtering: false },
            {
              title: 'Fecha PickUp',
              field: 'Order.Pickups.time',
              customFilterAndSearch: (term, rowData) => {
                const date = new Intl.DateTimeFormat('es-US').format(
                  Date.parse(rowData['Order.Pickups.time'])
                );
                return date.includes(term);
              },
              render: rowData => {
                return new Intl.DateTimeFormat('es-US').format(
                  Date.parse(rowData['Order.Pickups.time'])
                );
              }
            },
            {
              title: 'Dirección',
              field: 'Order.Location.address'
            },
            {
              title: 'Comuna',
              field: 'Order.Location.comuna',
              render: rowData => {
                if (rowData['Order.Location.comuna']) {
                  return titleCase(rowData['Order.Location.comuna']);
                }
                return '-';
              }
            },
            {
              title: 'Última actualización',
              field: 'updated_at',
              customFilterAndSearch: (term, rowData) => {
                const date = new Intl.DateTimeFormat('es-US').format(
                  Date.parse(rowData.updated_at)
                );
                return date.includes(term);
              },
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
          data={productsMapped}
          localization={{
            toolbar: {
              searchPlaceholder: 'Buscar tienda',
              pagination: {
                labelRowsPerPage: 'Filas por página',
                labelRowsSelect: 'Filas'
              }
            },
            body: {
              emptyDataSourceMessage: 'No existe coincidencia'
            }
          }}
          title="Bultos a retirar por tienda"
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

export default PreReservationScreen;
