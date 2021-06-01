import React, { useState } from 'react';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Button, makeStyles, Select, MenuItem, InputLabel } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import { fetchupdateProduct, fetchProductsNoConfirmed } from '../../actions/product-actions';
import { comunasRegiones } from '../../../constans/comunas-regiones';

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: 'auto',
    border: 'none',
    color: 'black'
  },
  modalBody: {
    paddingTop: '0.5rem',
    paddingBottom: '1.5rem'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));
export default function EditReservationForm(props) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const productStatus = 215; // status to find products

  const handleOnClick = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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

  const optionComunas = comunasRegiones.regiones.reduce((comunas,region) => {
    return [...comunas, ...region.comunas];
  },[]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      addressLine2: props.data["Order.Dropoffs.address_2"],
      addressLine1: props.data["Order.Dropoffs.address"],
      cud: props.data.identifier,
      serviceOrderId: props.data["Order.service_order_id"],
      dropComuna: titleCase(props.data["Order.Dropoffs.comuna"]),
      datePickup: props.data["Order.Pickups.time"],
      dateDropoff: props.data["Order.Dropoffs.time"],

    },

    onSubmit: async values => {
      const body = {
        "cudId": values.cud, 
        "pickupTime": values.datePickup,
        "time": values.dateDropoff,
        "comuna": values.dropComuna,
        "address": values.addressLine1,
        "address_2": values.addressLine2,
        "serviceOrder": values.serviceOrderId
      }

      setMessage('');
      const result = await dispatch(fetchupdateProduct(body));
      if (result) {
        formik.resetForm();
        setMessage(`La reserva ha sido actualizada con exito `);
        setOpen(false);
        dispatch(fetchProductsNoConfirmed(productStatus));

      }
    }
  });


  return (
    <>
      <Button
        className={classes.button}
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
      >
        <Icon>edit</Icon>
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Editar Reservación</DialogTitle>
        <form
          className={classes.form}
          onSubmit={formik.handleSubmit}
          noValidate
        >
          <DialogContent className={classes.modalBody}>
            <DialogContentText>
              Reservacion con el identificador de orden de servicio 
              {props.data["Order.service_order_id"]}
            </DialogContentText>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="cud"
                  name="cud"
                  label="CUD"
                  fullWidth
                  disabled={true}
                  autoComplete="given-name"
                  onChange={formik.handleChange}
                  value={formik.values.cud}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="serviceOrderId"
                  name="serviceOrderId"
                  label="Id de orden"
                  fullWidth
                  disabled={true}
                  autoComplete="given-name"
                  onChange={formik.handleChange}
                  value={formik.values.serviceOrderId}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="addressLine1"
                  name="addressLine1"
                  label="Dirección linea 1"
                  fullWidth
                  onChange={formik.handleChange}
                  value={formik.values.addressLine1}
                  
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="addressLine2"
                  name="addressLine2"
                  label="dirección linea 2"
                  fullWidth
                  onChange={formik.handleChange}
                  value={formik.values.addressLine2}
                  
                  
                />
              </Grid>
              <Grid item xs={12} sm={6} className={classes.formControl}>
              <InputLabel shrink id="dropComuna-label">
          Comuna
        </InputLabel>
                <Select
                  required
                  id="dropComuna"
                  name="dropComuna"
                  label="dropComuna"
                  fullWidth
                  onChange={formik.handleChange}
                  value={formik.values.dropComuna}
                  className={classes.selectEmpty}
                >
                  {
                  optionComunas.map(comuna =>
                    (<MenuItem key={comuna} value={comuna}>{comuna}</MenuItem>)

                  )
                }
                  </Select>
              </Grid>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={12} sm={6}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="datePickup"
                    label="Fecha de Pickup"
                    value={formik.values.datePickup}
                    onChange={(newDate) => formik.setFieldValue('datePickup', newDate)}
                    KeyboardButtonProps={{
                      'aria-label': 'change date'
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={12} sm={6}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="dateDropoff"
                    label="Fecha de Envio"
                    value={formik.values.dateDropoff}
                    onChange={(newDate) => formik.setFieldValue('dateDropoff', newDate)}
                    KeyboardButtonProps={{
                      'aria-label': 'change date'
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button type="reset" onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" className={classes.submit} color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
