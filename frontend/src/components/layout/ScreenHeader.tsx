import type { ReactNode } from 'react';

type ScreenHeaderProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  rightWide?: boolean;
};

export const ScreenHeader = ({
  title,
  left,
  right,
  rightWide = false,
}: ScreenHeaderProps) => {
  return (
    <div className="bg-white/30 px-4 pb-2 pt-4 backdrop-blur-sm sm:px-6 sm:pt-6">
      <div className="flex items-center gap-3">
        <div className="flex w-12 shrink-0 justify-start">
          {left ?? <div className="h-12 w-12" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex h-12 min-w-0 items-center justify-center rounded-xl border-2 border-black px-4 text-center text-base font-bold leading-tight text-black sm:text-[22px]">
            <span className="truncate">{title}</span>
          </div>
        </div>

        <div className={`flex shrink-0 justify-end ${rightWide ? 'min-w-[96px]' : 'w-12'}`}>
          {right ?? <div className={rightWide ? 'h-10 min-w-[96px]' : 'h-12 w-12'} />}
        </div>
      </div>
    </div>
  );
};
