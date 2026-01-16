import { memo } from 'react';
import { Icon } from '../Icon';
import type { IconProps } from '@/types/common.types';

export const ClipboardIcon = memo<IconProps>((props) => (
  <Icon {...props}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </Icon>
));

ClipboardIcon.displayName = 'ClipboardIcon';