import React from 'react';
import { Route, Switch } from 'react-router-dom';

import HomeScreen from './screens/HomeScreen';
import UserScreen from './screens/UserScreen';
import UserCreateScreen from './screens/UserCreateScreen';

import Layout from './components/Layout/Layout';
import ReservationScreen from './screens/ReservationScreen';
import PreReservationScreen from './screens/PreReservationScreen';
import ScanCudScreen from './screens/ScanCudScreen';
import TravelsScreen from './screens/TravelsScreen';

export default function Routes() {
  return (
    <Switch>
      <Layout>
        <Route path="/" exact component={HomeScreen} />
        <Route path="/users" exact component={UserScreen} />
        <Route path="/reservations" exact component={ReservationScreen} />
        <Route path="/users/create" exact component={UserCreateScreen} />
        <Route path="/prereservations" exact component={PreReservationScreen} />
        <Route path="/scan" exact component={ScanCudScreen} />
        <Route path="/travels" exact component={TravelsScreen} />
        {/* <Route path="/" component={HomeScreen} /> */}
      </Layout>
    </Switch>
  );
}
