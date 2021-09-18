import * as React from 'react';
import { useState, useEffect } from 'react';
import type { NextPage } from 'next';

import _keys from 'lodash/keys';

import Chip from '@mui/material/Chip';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import { LinearProgress, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

import { Reserve } from './api/attendance';

const Home: NextPage = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<Reserve[]>([]);
  const [classTime, setClassTime] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMsg, setAlertMessage] = useState('');

  const dateString = `${date?.getFullYear()}-${
    (date?.getMonth() || 0) + 1
  }-${date?.getDate()}`;

  async function getDataFromAPI(y?: number, m?: number, d?: number) {
    const current = new Date();
    const _y = y || current.getFullYear();
    const _m = (m || current.getMonth()) + 1;
    const _d = d || current.getDate();

    const url = `/api/attendance?y=${_y}&m=${_m}&d=${_d}`;

    try {
      setLoading(true);
      setAlertMessage('');
      setData([]);
      setClassTime([]);
      const res = await fetch(url, { method: 'GET' });
      const _data = await res.json();
      setData(_data.data);

      if (_data.data.length === 0) {
        setAlertMessage('신청자가 없습니다.');
      }

      const dd: Reserve[] = _data.data;
      const obj: { [key: string]: number } = {};
      dd.forEach(({ time }) => {
        obj[time] = obj[time] ? obj[time] + 1 : 1;
      });

      setClassTime(_keys(obj));
    } catch (e) {
      setAlertMessage(
        `오류가 발생하였습니다. 카페에 글 올려주시면 확인하겠습니다. :)`
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getDataFromAPI(date?.getFullYear(), date?.getMonth(), date?.getDate());
  }, [date]);

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" component="div">
              크로스핏 보라매
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <div>
        <div
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="날짜 선택"
              value={date}
              onChange={(newValue) => {
                setDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>

          <Chip label="🏃‍♂️ 참여" color="success" />
          <Chip label="🏃 참여 - 🖱👆🏼 댓글 있음. Mouse Over!" color="primary" />
          <Chip label="😢 취소 - 🖱👆🏼 취소 사유. Mouse Over!" color="warning" />
        </div>

        <div style={{ padding: 20 }}>
          <Typography variant="h6">{`${dateString} 출석부`}</Typography>

          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell width={100}>수업</TableCell>
                  <TableCell>참여 인원</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertMsg !== '' && (
                  <TableRow>
                    <TableCell colSpan={3}>{alertMsg}</TableCell>
                  </TableRow>
                )}
                {classTime.map((row) => (
                  <TableRow
                    key={row}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <div>{row}</div>
                      <div>{`(${
                        data.filter((d) => d.cancel === false && d.time === row)
                          .length
                      }명)`}</div>
                    </TableCell>
                    <TableCell align="right">
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        {data
                          .filter((d) => d.time === row)
                          .map((d) => (
                            <Tooltip
                              key={`${d.num}-${d.name}`}
                              title={d.comment}
                              arrow
                            >
                              <Chip
                                label={`${d.name} - ${d.num}`}
                                color={
                                  d.cancel
                                    ? 'warning'
                                    : d.comment !== ''
                                    ? 'primary'
                                    : 'success'
                                }
                              />
                            </Tooltip>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && <LinearProgress />}
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;
