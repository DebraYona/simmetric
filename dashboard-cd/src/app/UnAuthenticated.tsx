import React from 'react';
import { Route, Switch } from 'react-router-dom';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import ForgotScreen from './screens/ForgotScreen';

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={SignInScreen} />
      <Route path="/sign-in" exact component={SignInScreen} />
      <Route path="/confirm/:email?" exact component={ConfirmScreen} />
      <Route path="/sign-up" component={SignUpScreen} />
      <Route path="/forgot" component={ForgotScreen} />
      <Route path="/" component={SignInScreen} />
    </Switch>
  );
}
