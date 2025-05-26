import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@heroui/react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Column({ className, ...props }: Props) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center flex-1', className)}
      data-testid="Column"
      {...props}
    />
  );
}
