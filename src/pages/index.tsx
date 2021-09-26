import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
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

import { LinearProgress, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import type {
  AttendData,
  ReadAttendDataListBody,
} from '@common/types/attendance';
import axios from 'axios';
import StateDescriptionBox from '@components/StateDescriptionBox';
import CalendarInputBox from '@components/CalendarInputBox';
import BugReportBox from '@components/BugReportBox';

const Home: NextPage = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<AttendData[]>([]);
  const [unknown, setUnknown] = useState<AttendData[]>([]);
  const [classTime, setClassTime] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMsg, setAlertMessage] = useState('');

  const dateString = useMemo(() => {
    const year = date?.getFullYear();
    const month = (date?.getMonth() || 0) + 1;
    const day = date?.getDate();

    return `${year}-${month}-${day}`;
  }, [date]);

  const getStateColor = useCallback(
    (state: AttendData['state'], isComment: boolean) => {
      switch (state) {
        case 'ATTEND':
          return isComment ? 'primary' : 'success';
        case 'CANCEL':
          return 'error';
        case 'CHANGE':
          return 'warning';
        case 'UNKNOWN':
          return;
      }
    },
    []
  );

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
      setUnknown([]);
      setClassTime([]);

      const {
        data: { data, unknown },
      } = await axios.get<ReadAttendDataListBody>(url);
      setData(data);
      setUnknown(unknown);

      if (data.length === 0) {
        setAlertMessage('신청자가 없습니다.');
      }

      const obj: { [key: string]: number } = {};
      data.forEach(({ time }) => {
        obj[time] = obj[time] ? obj[time] + 1 : 1;
      });

      setClassTime(_keys(obj).sort());
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

  // Event
  function handleChangeDate(v: Date | null) {
    setDate(v);
  }

  return (
    <div>
      <div>
        <CalendarInputBox value={date} onChange={handleChangeDate} />

        <div style={{ padding: 20 }}>
          <Typography variant="h6">{`${dateString} 출석부`}</Typography>

          <TableContainer component={Paper}>
            <Table>
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
                {unknown.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <Typography variant="body2">
                          아래 댓글들은 판단이 어려워요 😢
                        </Typography>
                        {unknown.map((u) => (
                          <Chip key={u.date} label={u.comment} />
                        ))}
                      </div>
                    </TableCell>
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
                        data.filter(
                          (d) =>
                            ['ATTEND', 'CHANGE'].includes(d.state) &&
                            d.time === row
                        ).length
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
                              key={`${d.phone}-${d.date}`}
                              title={d.comment}
                              arrow
                            >
                              <Chip
                                label={`${d.name} - ${d.phone}`}
                                color={getStateColor(d.state, d.comment !== '')}
                              />
                            </Tooltip>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && (
              <div>
                <p>
                  네이버 카페로 직접 접속해서 데이터를 가져오기 때문에 느려요 🥲
                  이해부탁해요 🙏🏼
                </p>
                <LinearProgress />
              </div>
            )}
          </TableContainer>
        </div>
      </div>

      <StateDescriptionBox />

      <BugReportBox />
    </div>
  );
};

export default Home;
