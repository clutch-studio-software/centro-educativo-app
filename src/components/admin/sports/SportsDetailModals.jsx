import React from 'react';
import StudentDetailsModal from '../StudentDetailsModal';
import EnrollStudentModal from './EnrollStudentModal';
import ReassignTeacherModal from './ReassignTeacherModal';
import TransferWithdrawModal from './TransferWithdrawModal';
import EditSportsConfigModal from './EditSportsConfigModal';

const EMPTY_STUDENTS = [];
const EMPTY_DISCIPLINES = [];

export const SportsDetailModals = ({
  isEnrollModalOpen,
  onCloseEnroll,
  onEnrollStudent,
  studentsCount,
  maxCapacity,
  enrolledStudents = EMPTY_STUDENTS,
  allDisciplines = EMPTY_DISCIPLINES,
  isEditConfigModalOpen,
  discipline,
  onCloseEditConfig,
  onSaveConfig,
  teachers,
  isReassignTeacherModalOpen,
  onCloseReassignTeacher,
  onReassignTeacher,
  transferStudent,
  onCloseTransfer,
  onConfirmTransfer,
  viewingStudent,
  onCloseViewingStudent,
}) => {
  return (
    <>
      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={onCloseEnroll}
        onEnroll={onEnrollStudent}
        currentCount={studentsCount}
        maxCapacity={maxCapacity}
        discipline={discipline}
        enrolledStudents={enrolledStudents}
        allDisciplines={allDisciplines}
      />

      <EditSportsConfigModal
        isOpen={isEditConfigModalOpen}
        config={discipline}
        onClose={onCloseEditConfig}
        onSave={onSaveConfig}
        teachers={teachers}
      />

      <ReassignTeacherModal
        isOpen={isReassignTeacherModalOpen}
        currentTeacher={discipline.profesor}
        onClose={onCloseReassignTeacher}
        onReassign={onReassignTeacher}
      />

      <TransferWithdrawModal
        isOpen={Boolean(transferStudent)}
        student={transferStudent}
        discipline={discipline}
        allDisciplines={allDisciplines}
        onClose={onCloseTransfer}
        onConfirm={onConfirmTransfer}
      />

      <StudentDetailsModal
        isOpen={Boolean(viewingStudent)}
        student={viewingStudent}
        allDisciplines={allDisciplines}
        onClose={onCloseViewingStudent}
      />
    </>
  );
};

export default SportsDetailModals;
