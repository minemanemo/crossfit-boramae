export type AttendData = {
  user: string;
  thumbnail: string;
  comment: string;
  raw_comment: string;
  date: string;
  name: string;
  time: string;
  phone: string;
  state: 'ATTEND' | 'CHANGE' | 'CANCEL' | 'UNKNOWN';
};

export type ReadAttendDataListBody = {
  data: AttendData[];
  unknown: AttendData[];
};
