import { memo, type HTMLAttributes, type ReactNode } from 'react';
import { Helpers } from '@lib/utils/helpers';


interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

export const Card = memo<CardProps>(
  ({ children, header, footer, className, ...props }) => {
    return (
      <div
        className={Helpers.cn(
          'bg-white rounded-lg shadow-md overflow-hidden',
          className
        )}
        {...props}
      >
        {header && (
          <div className="px-6 py-4 border-b border-gray-200">{header}</div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';