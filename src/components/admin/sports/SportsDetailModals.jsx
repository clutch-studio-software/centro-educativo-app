import React from 'react';
import StudentDetailsModal from '../StudentDetailsModal';
import EnrollStudentModal from './EnrollStudentModal';
import ReassignTeacherModal from './ReassignTeacherModal';
import TransferWithdrawModal from './TransferWithdrawModal';
import EditSportsConfigModal from './EditSportsConfigModal';

export const SportsDetailModals = ({
  isEnrollModalOpen,
  onCloseEnroll,
  onEnrollStudent,
  studentsCount,
  maxCapacity,
  enrolledStudents = [],
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
        onClose={onCloseTransfer}
        onConfirm={onConfirmTransfer}
      />

      <StudentDetailsModal
        isOpen={Boolean(viewingStudent)}
        student={viewingStudent}
        onClose={onCloseViewingStudent}
      />
    </>
  );
};

export default SportsDetailModals;
