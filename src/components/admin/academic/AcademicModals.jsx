import React from 'react';
import ViewDivisionModal from './ViewDivisionModal';
import NewCourseModal from './NewCourseModal';
import EditCourseModal from './EditCourseModal';
import NewSubjectModal from './NewSubjectModal';
import ReassignTeacherModal from './ReassignTeacherModal';

export const AcademicModals = ({
  viewingCourse,
  viewingEnrolledStudents,
  onCloseViewCourse,
  onEditFromView,
  isNewCourseModalOpen,
  onCloseNewCourse,
  onSaveNewCourse,
  editingCourse,
  onCloseEditCourse,
  onSaveEditCourse,
  isNewSubjectModalOpen,
  onCloseNewSubject,
  onSaveNewSubject,
  courses,
  teachers,
  selectedCourseId,
  reassigningSubject,
  onCloseReassignTeacher,
  onSaveReassignTeacher,
  defaultNivelId = 'inicial',
}) => {
  return (
    <>
      <ViewDivisionModal
        isOpen={Boolean(viewingCourse)}
        course={viewingCourse}
        enrolledStudents={viewingEnrolledStudents}
        onClose={onCloseViewCourse}
        onEdit={onEditFromView}
      />

      <NewCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={onCloseNewCourse}
        onSave={onSaveNewCourse}
        teachers={teachers}
        courses={courses}
        defaultNivelId={defaultNivelId}
      />

      <EditCourseModal
        isOpen={Boolean(editingCourse)}
        course={editingCourse}
        onClose={onCloseEditCourse}
        onSave={onSaveEditCourse}
        teachers={teachers}
        courses={courses}
      />

      <NewSubjectModal
        isOpen={isNewSubjectModalOpen}
        onClose={onCloseNewSubject}
        onSave={onSaveNewSubject}
        courses={courses}
        teachers={teachers}
        defaultCourseId={selectedCourseId}
      />

      <ReassignTeacherModal
        isOpen={Boolean(reassigningSubject)}
        subject={reassigningSubject}
        onClose={onCloseReassignTeacher}
        onSave={onSaveReassignTeacher}
        teachers={teachers}
      />
    </>
  );
};

export default AcademicModals;
