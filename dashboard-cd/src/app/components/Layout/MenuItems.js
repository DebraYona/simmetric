import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { Link } from 'react-router-dom';
import People from '@material-ui/icons/People';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ScannerIcon from '@material-ui/icons/Scanner';
import TravelIcon from '@material-ui/icons/CardTravel';

import { useAuth } from '../../context/auth-context';

const useStyles = makeStyles(() => ({
  listItemText: {
    fontSize: '0.8rem'
  },
  active: {
    color: '#FF6900'
  }
}));

function ListItemLink(props) {
  const classes = useStyles();
  const { icon, primary, to, location } = props;
  const renderLink = React.useMemo(
    () =>
      React.forwardRef((linkProps, ref) => (
        // With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
        // See https://github.com/ReactTraining/react-router/issues/6056
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Link to={to} {...linkProps} innerRef={ref} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem
        button
        component={renderLink}
        className={location === to ? classes.active : 'inactive'}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText
          primary={primary}
          classes={{ primary: classes.listItemText }}
        />
      </ListItem>
    </li>
  );
}

export const MainListItems = ({ location }) => {
  const auth = useAuth();

  return (
    <div>
      <h3 style={{ marginLeft: 20, fontWeight: 'normal' }}>
        {auth.userInfo.attributes.name} {auth.userInfo.attributes.family_name}
      </h3>
      <ListSubheader inset>Dashboard</ListSubheader>
      <ListItemLink
        to="/"
        primary="Inicio"
        location={location && location.pathname}
        icon={<DashboardIcon />}
      />
      <ListItemLink
        to="/reservations"
        primary="Sin Reservas"
        location={location && location.pathname}
        icon={<People />}
      />
      <ListItemLink
        to="/prereservations"
        primary="Prereservas"
        icon={<ListAltIcon />}
      />
      <ListItemLink to="/travels" primary="Viajes a CD" icon={<TravelIcon />} />
      <ListItemLink to="/scan" primary="Scan CUD" icon={<ScannerIcon />} />
    </div>
  );
};

export const SecondaryListItems = ({ location }) => (
  <div>
    <ListSubheader inset>Administración</ListSubheader>
    <ListItemLink
      to="/users"
      primary="Usuarios"
      location={location && location.pathname}
      icon={<People />}
    />
  </div>
);
