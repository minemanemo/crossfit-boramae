import { memo } from 'react';
import Chip from '@mui/material/Chip';

const StateDescriptionBox = () => {
  return (
    <div
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <Chip label="🏃‍♂️ 참여" color="success" />
      <Chip label="🏃 참여 - 🖱👆🏼 댓글 있음. Mouse Over!" color="primary" />
      <Chip label="😢 변경 - 🖱👆🏼 변경 사유. Mouse Over!" color="warning" />
      <Chip label="😢 취소 - 🖱👆🏼 취소 사유. Mouse Over!" color="error" />
    </div>
  );
};

export default memo(StateDescriptionBox);
