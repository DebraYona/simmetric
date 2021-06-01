import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import PauseIcon from '@material-ui/icons/Pause';
import PlayIcon from '@material-ui/icons/PlayArrow';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  }
});

type Key = {
  id: string;
  value: string;
  name: string;
  customerId: string;
  enabled: boolean;
  createdDate: string;
  lastUpdatedDate: string;
  stageKeys: Array<string>;
};

type PropTypes = {
  keys: Array<Key>;
  changeApiStatus: Function;
  deleteApiKey: Function;
  isDeleting: boolean;
  isUpdating: boolean;
};

export default function DenseTable({
  keys,
  changeApiStatus,
  deleteApiKey,
  isDeleting,
  isUpdating
}: PropTypes) {
  const classes = useStyles();

  return (
    <TableContainer>
      <Table className={classes.table} size="small" aria-label="API Keys table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Key</TableCell>
            <TableCell align="right">Created</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right" />
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map(key => (
            <TableRow key={key.name}>
              <TableCell component="th" scope="row">
                {key.name}
              </TableCell>
              <TableCell align="right">{key.value}</TableCell>
              <TableCell align="right">{key.createdDate}</TableCell>
              <TableCell align="center">
                {key.enabled ? (
                  <Chip color="primary" size="small" label="Enabled" />
                ) : (
                    <Chip color="secondary" size="small" label="Disabled" />
                  )}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  disabled={isUpdating}
                  onClick={() =>
                    changeApiStatus({
                      type: 'FETCH',
                      params: {
                        keyId: key.id,
                        value: key.enabled ? 'false' : 'true'
                      }
                    })
                  }
                  aria-label="pause"
                >
                  {key.enabled ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </TableCell>
              <TableCell align="right">
                <IconButton
                  disabled={isDeleting}
                  onClick={() =>
                    deleteApiKey({ type: 'FETCH', params: { keyId: key.id } })
                  }
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
