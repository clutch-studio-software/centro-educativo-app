import React from 'react';
import Navbar from '../../components/Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFamilyPortalState } from './useFamilyPortalState.js';

import StudentProfileHeader from '../../components/portal/StudentProfileHeader.jsx';
import ChildSelector from '../../components/portal/ChildSelector.jsx';
import StudentAcademicSubjectsCard from '../../components/portal/StudentAcademicSubjectsCard.jsx';
import StudentSportsCard from '../../components/portal/StudentSportsCard.jsx';
import StudentTransportCard from '../../components/portal/StudentTransportCard.jsx';
import StudentDiningCard from '../../components/portal/StudentDiningCard.jsx';
import ParentServicesManager from '../../components/portal/ParentServicesManager.jsx';
import FamilyPortalBanner from '../../components/portal/FamilyPortalBanner.jsx';

/**
 * Portal del Estudiante y Portal del Padre/Tutor (Autogestión e Inscripciones)
 */
const StudentParentPortal = () => {
  const { user } = useAuth();
  const {
    loading,
    isProcessing,
    feedback,
    setFeedback,
    allStudents,
    linkedStudents,
    allSports,
    routes,
    selectedStudentId,
    setSelectedStudentId,
    portalMode,
    setPortalMode,
    isStudentUser,
    isParentUser,
    currentStudent,
    subjects,
    sports,
    transportDetails,
    diningDetails,
    handleEnrollTransport,
    handleCancelTransport,
    handleEnrollSport,
    handleWithdrawSport,
    handleToggleDining,
  } = useFamilyPortalState(user);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div
            data-testid="portal-loading-indicator"
            className="flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Cargando Portal de Acceso Escolar...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      data-testid="family-portal-page"
      className="min-h-screen bg-slate-50 flex flex-col font-body"
    >
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <FamilyPortalBanner
          isStudentUser={isStudentUser}
          isParentUser={isParentUser}
          portalMode={portalMode}
          setPortalMode={setPortalMode}
        />

        {feedback && (
          <div
            data-testid="portal-feedback-alert"
            className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {feedback.type === 'error' ? 'error' : 'check_circle'}
              </span>
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {isParentUser && (
          <ChildSelector
            childrenList={linkedStudents}
            selectedStudentId={selectedStudentId}
            onSelectChild={setSelectedStudentId}
          />
        )}

        <StudentProfileHeader
          student={currentStudent}
          isParentView={isParentUser}
        />

        {isParentUser && portalMode === 'inscripciones' && (
          <ParentServicesManager
            student={currentStudent}
            routes={routes}
            allStudents={allStudents}
            allSports={allSports}
            onEnrollTransport={handleEnrollTransport}
            onCancelTransport={handleCancelTransport}
            onEnrollSport={handleEnrollSport}
            onWithdrawSport={handleWithdrawSport}
            onToggleDining={handleToggleDining}
            isProcessing={isProcessing}
          />
        )}

        {(isStudentUser || portalMode === 'perfil') && (
          <div className="space-y-6">
            <StudentAcademicSubjectsCard subjects={subjects} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StudentTransportCard
                student={currentStudent}
                transportDetails={transportDetails}
              />
              <StudentDiningCard diningDetails={diningDetails} />
            </div>
            <StudentSportsCard sports={sports} />
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentParentPortal;
