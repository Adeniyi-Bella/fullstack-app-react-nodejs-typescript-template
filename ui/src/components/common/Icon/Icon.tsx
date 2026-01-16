import { memo, forwardRef } from 'react';
import { Helpers } from '@lib/utils/helpers';
import type { IconProps } from '@/types/common.types';

export const Icon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, className, children, ...props }, ref) => {
      const sizeValue = typeof size === 'number' ? `${size}px` : size;

      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={sizeValue}
          height={sizeValue}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={Helpers.cn('inline-block hover:cursor-pointer', className)}
          aria-hidden="true"
          {...props}
        >
          {children}
        </svg>
      );
    }
  )
);

Icon.displayName = 'Icon';