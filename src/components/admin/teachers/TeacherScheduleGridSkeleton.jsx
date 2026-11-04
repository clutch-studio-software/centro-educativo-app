import React from 'react';

const DAYS_HEADER_COLUMNS = [
  { label: 'Hora', isHourCol: true },
  { label: 'Lun', isHourCol: false },
  { label: 'Mar', isHourCol: false },
  { label: 'Mié', isHourCol: false },
  { label: 'Jue', isHourCol: false },
  { label: 'Vie', isHourCol: false },
];

export const TeacherScheduleGridSkeleton = () => {
  return (
    <div data-testid="teacher-schedule-skeleton" className="flex flex-col gap-2.5 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-5 bg-slate-200 rounded-md w-64" />
        <div className="h-7 bg-slate-200/80 rounded-xl w-48" />
      </div>

      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 overflow-x-auto">
        <div className="grid grid-cols-6 gap-1 text-center text-xs min-w-[440px]">
          {DAYS_HEADER_COLUMNS.map((col) => (
            <div
              key={col.label}
              className={`py-1 ${col.isHourCol ? 'text-slate-400 font-bold' : 'text-slate-700 font-extrabold'}`}
            >
              {col.label}
            </div>
          ))}

          {[1, 2, 3].map((slotIdx) => (
            <React.Fragment key={slotIdx}>
              <div className="py-2.5 bg-white rounded-md flex items-center justify-center border border-slate-100">
                <div className="h-3 w-14 bg-slate-200 rounded" />
              </div>
              {[1, 2, 3, 4, 5].map((dayIdx) => (
                <div
                  key={dayIdx}
                  className="min-h-[50px] p-2 bg-slate-100/70 border border-slate-200/50 rounded-md flex flex-col justify-center gap-1.5"
                >
                  <div className="h-2.5 bg-slate-200 rounded w-3/4 mx-auto" />
                  <div className="h-2 bg-slate-200/60 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherScheduleGridSkeleton;
