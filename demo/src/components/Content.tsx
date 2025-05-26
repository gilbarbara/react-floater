import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@heroui/react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Content({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-between flex-wrap max-w-lg mx-auto w-full',
        className,
      )}
      data-testid="Content"
      {...props}
    />
  );
}
