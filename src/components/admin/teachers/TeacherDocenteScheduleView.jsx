import React, { useMemo } from 'react';
import TeacherSelfScheduleBanner from './TeacherSelfScheduleBanner';
import TeacherWeeklyScheduleGrid from './TeacherWeeklyScheduleGrid';
import { findCurrentTeacher, ensureCompleteGrilla } from './teacherScheduleUtils';

const EMPTY_TEACHERS = [];

const TeacherDocenteScheduleView = ({ user, teachers = EMPTY_TEACHERS }) => {
  const matchedTeacher = useMemo(() => {
    return findCurrentTeacher(user, teachers);
  }, [user, teachers]);

  const teacherGrilla = useMemo(() => {
    return ensureCompleteGrilla(matchedTeacher?.grillaHoraria);
  }, [matchedTeacher]);

  return (
    <div
      data-testid="teacher-docente-schedule-view"
      className="flex flex-col gap-6"
    >
      <TeacherSelfScheduleBanner user={user} teachers={teachers} />

      <section
        data-testid="docente-weekly-schedule-card"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col gap-4"
      >
        <TeacherWeeklyScheduleGrid
          grilla={teacherGrilla}
          readOnly={true}
          allTeachers={teachers}
          currentTeacherId={matchedTeacher?.id}
          catedrasList={matchedTeacher?.catedras || []}
        />
      </section>
    </div>
  );
};

export default TeacherDocenteScheduleView;
