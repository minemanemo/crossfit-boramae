import { memo } from 'react';

import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

export type CalendarInputBoxProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
};

const CalendarInputBox = ({ value, onChange }: CalendarInputBoxProps) => {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="날짜 선택"
          value={value}
          onChange={(v) => onChange(v)}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
    </div>
  );
};

export default memo(CalendarInputBox);
