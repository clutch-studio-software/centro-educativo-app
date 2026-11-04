import React, { useRef, useEffect } from 'react';
import TeacherAddCatedraForm from './TeacherAddCatedraForm';
import TeacherWeeklyScheduleGrid from './TeacherWeeklyScheduleGrid';
import TeacherAssignedCatedrasList from './TeacherAssignedCatedrasList';
import {
  TeacherAssignmentsDrawerHeader,
  TeacherAccumulatedHoursCard,
  TeacherAssignmentsDrawerFooter,
} from './TeacherAssignmentsDrawerHeader';
import { useTeacherAssignmentsForm } from './useTeacherAssignmentsForm';

const EMPTY_COURSES = [];

const TeacherAssignmentsDrawerContent = ({
  teacher,
  courses = EMPTY_COURSES,
  readOnly = false,
  onClose,
  onSaveAssignments,
}) => {
  const {
    catedrasList,
    grilla,
    selectedCatedraId,
    setSelectedCatedraId,
    formState,
    handleFormChange,
    availableCourses,
    totalHoras,
    maxHoras,
    isOverLimit,
    porcentajeCarga,
    handleAddCatedra,
    handleToggleSlot,
    handleRemoveCatedra,
    handleConfirmSave,
  } = useTeacherAssignmentsForm(teacher, courses, readOnly, onClose, onSaveAssignments);

  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="slide-over-title"
      className="fixed inset-0 z-50 overflow-hidden bg-transparent p-0 max-w-none w-full h-full"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between rounded-l-3xl overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="flex flex-col flex-1 overflow-y-auto">
            <TeacherAssignmentsDrawerHeader
              teacher={teacher}
              readOnly={readOnly}
              onClose={onClose}
            />

            <div className="p-6 flex flex-col gap-6">
              <TeacherAccumulatedHoursCard
                totalHoras={totalHoras}
                maxHoras={maxHoras}
                isOverLimit={isOverLimit}
                porcentajeCarga={porcentajeCarga}
              />

              {!readOnly && (
                <TeacherAddCatedraForm
                  formState={formState}
                  onFormChange={handleFormChange}
                  availableCourses={availableCourses}
                  onAddCatedra={handleAddCatedra}
                  totalHoras={totalHoras}
                  maxHoras={maxHoras}
                />
              )}

              <TeacherWeeklyScheduleGrid
                grilla={grilla}
                readOnly={readOnly}
                catedrasList={catedrasList}
                selectedCatedraId={selectedCatedraId}
                onSelectCatedraId={setSelectedCatedraId}
                onToggleSlot={handleToggleSlot}
              />

              <TeacherAssignedCatedrasList
                catedrasList={catedrasList}
                grilla={grilla}
                onRemoveCatedra={handleRemoveCatedra}
                readOnly={readOnly}
              />
            </div>
          </div>

          <TeacherAssignmentsDrawerFooter
            readOnly={readOnly}
            isOverLimit={isOverLimit}
            onClose={onClose}
            onConfirmSave={handleConfirmSave}
          />
        </div>
      </div>
    </dialog>
  );
};

const TeacherAssignmentsDrawer = ({
  isOpen,
  teacher,
  courses = EMPTY_COURSES,
  readOnly = false,
  onClose,
  onSaveAssignments,
}) => {
  if (!isOpen || !teacher) return null;

  return (
    <TeacherAssignmentsDrawerContent
      key={teacher.id}
      teacher={teacher}
      courses={courses}
      readOnly={readOnly}
      onClose={onClose}
      onSaveAssignments={onSaveAssignments}
    />
  );
};

export default TeacherAssignmentsDrawer;
