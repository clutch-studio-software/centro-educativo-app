import React from 'react';

export const SkeletonAvatarCell = ({
  avatarSize = 'w-10 h-10',
  rounded = 'rounded-full',
  titleWidth = 'w-32',
  subtitleWidth = 'w-24',
}) => (
  <div className="flex items-center gap-3">
    <div className={`${avatarSize} ${rounded} bg-slate-200 shrink-0`} />
    <div className="space-y-1.5 flex-1 min-w-0">
      <div className={`h-3.5 bg-slate-200 rounded-md ${titleWidth}`} />
      <div className={`h-2.5 bg-slate-100 rounded-md ${subtitleWidth}`} />
    </div>
  </div>
);

export const SkeletonTextLines = ({
  titleWidth = 'w-28',
  subtitleWidth = 'w-20',
}) => (
  <div className="space-y-1.5">
    <div className={`h-3.5 bg-slate-200 rounded-md ${titleWidth}`} />
    <div className={`h-2.5 bg-slate-100 rounded-md ${subtitleWidth}`} />
  </div>
);

export default SkeletonAvatarCell;
