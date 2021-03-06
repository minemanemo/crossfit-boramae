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
      <Chip label="πββοΈ μ°Έμ¬" color="success" />
      <Chip label="π μ°Έμ¬ - π±ππΌ λκΈ μμ. Mouse Over!" color="primary" />
      <Chip label="π’ λ³κ²½ - π±ππΌ λ³κ²½ μ¬μ . Mouse Over!" color="warning" />
      <Chip label="π’ μ·¨μ - π±ππΌ μ·¨μ μ¬μ . Mouse Over!" color="error" />
    </div>
  );
};

export default memo(StateDescriptionBox);
