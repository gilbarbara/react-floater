import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@heroui/react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gray?: boolean;
}

export default function Block({ children, gray, ...rest }: Props) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8 bg-white', {
        'bg-gray-200': gray,
      })}
      data-testid="Block"
      {...rest}
    >
      {children}
    </div>
  );
}
