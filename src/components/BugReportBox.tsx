import Link from '@mui/material/Link';
import BugReportIcon from '@mui/icons-material/BugReport';
import Button from '@mui/material/Button';
import { memo } from 'react';

const BugReportBox = () => {
  return (
    <div>
      <Link
        href="https://loving-cabbage-5c0.notion.site/204e7a38fe054a088fc910406b30b7b9"
        target="_blank"
      >
        <Button color="error" startIcon={<BugReportIcon />}>
          버그 신고 방법
        </Button>
      </Link>
    </div>
  );
};

export default memo(BugReportBox);
