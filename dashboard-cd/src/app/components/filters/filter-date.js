import React from 'react';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import FilterIcon from '@material-ui/icons/FilterList';
import Tooltip from '@material-ui/core/Tooltip';
import * as _ from 'lodash';

export default function FilterNumericBetween({ columnDef, onFilterChanged }) {
  return (
    <>
    <TextField
      style={columnDef.type === 'date' ? { float: 'right' } : {}}
      type={columnDef.type === 'date' ? 'date' : 'search'}
      value={_.get(columnDef, ['tableData', 'filterValue', 'greaterThan']) || ''}
      placeholder={columnDef.filterPlaceholder || ''}
      onChange={(event) => {
        const value = {...columnDef.tableData.filterValue};
        value.greaterThan = event.target.value;
        onFilterChanged(columnDef.tableData.id, value);
      }}
      InputProps={columnDef.hideFilterIcon ? undefined : {
        startAdornment: (
          <InputAdornment position="start">
            <Tooltip title="Filter greater than">
              <div style={{display: 'flex'}}>
                <FilterIcon />
                <Typography>{'>'}</Typography>
              </div>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
    <TextField
      style={columnDef.type === 'date' ? { float: 'right' } : {}}
      type={columnDef.type === 'date' ? 'date' : 'search'}
      value={_.get(columnDef, ['tableData', 'filterValue', 'lessThan']) || ''}
      placeholder={columnDef.filterPlaceholder || ''}
      onChange={(event) => {
        const value = {...columnDef.tableData.filterValue};
        value.lessThan = event.target.value;
        onFilterChanged(columnDef.tableData.id, value);
      }}
      InputProps={columnDef.hideFilterIcon ? undefined : {
        startAdornment: (
          <InputAdornment position="start">
            <Tooltip title="Filter less than">
              <div style={{display: 'flex'}}>
                <FilterIcon />
                <Typography>{'<'}</Typography>
              </div>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
    </>
  );
}