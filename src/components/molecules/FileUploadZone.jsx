import React, { useState, useRef } from 'react';
import Icon from '../atoms/Icon';

/**
 * Componente FileUploadZone (Molécula)
 * Permite cargar archivos mediante clic o arrastrar y soltar (Drag & Drop), con validaciones personalizadas.
 * 
 * @param {File} file - Archivo seleccionado actualmente.
 * @param {Function} onFileChange - Callback disparado al seleccionar un archivo válido. Recibe el objeto File.
 * @param {Function} onFileRemove - Callback disparado al remover el archivo actual.
 * @param {string} error - Mensaje de error a mostrar si el archivo es inválido.
 * @param {Function} setError - Callback para actualizar el estado de error del componente padre.
 * @param {string} accept - Tipos de archivo aceptados (ej. '.pdf').
 * @param {number} maxSizeInMB - Tamaño máximo en megabytes.
 * @param {string} label - Texto principal de la zona de carga.
 * @param {string} subLabel - Texto secundario/de ayuda.
 */
const FileUploadZone = ({
  file,
  onFileChange,
  onFileRemove,
  error,
  setError,
  accept = '.pdf',
  maxSizeInMB = 5,
  label = 'Haz clic para buscar',
  subLabel = 'o arrastra tu archivo aquí'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const maxSizeBytes = maxSizeInMB * 1024 * 1024;
    
    // Validar tipo (basado en la extensión y el accept prop)
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const isAcceptedType = accept.split(',').some(type => {
      const cleanType = type.trim().toLowerCase();
      if (cleanType === '.pdf') {
        return selectedFile.type === 'application/pdf' || fileExtension === '.pdf';
      }
      return selectedFile.type.includes(cleanType) || fileExtension === cleanType;
    });

    if (!isAcceptedType) {
      setError(`El archivo debe ser en formato: ${accept}`);
      onFileRemove();
      return;
    }

    // Validar tamaño
    if (selectedFile.size > maxSizeBytes) {
      setError(`El archivo supera el tamaño máximo permitido de ${maxSizeInMB}MB.`);
      onFileRemove();
      return;
    }

    // Archivo válido
    setError('');
    onFileChange(selectedFile);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={accept}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick();
          }
        }}
        role="button"
        tabIndex={0}
        className={`w-full border-2 border-dashed ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : error 
              ? 'border-red-500 bg-red-50/10' 
              : 'border-outline-variant/50 bg-surface-container-high/50 hover:bg-surface-container-high'
        } rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer group`}
      >
        {!file ? (
          <>
            <Icon 
              name="cloud_upload" 
              className={`text-4xl ${error ? 'text-red-400 group-hover:text-red-500' : 'text-outline group-hover:text-primary'} transition-colors duration-300`} 
            />
            <div className="text-center">
              <p className="font-body font-bold text-on-surface">{label}</p>
              <p className="font-body text-sm text-on-surface-variant">{`${subLabel} (Max ${maxSizeInMB}MB)`}</p>
            </div>
          </>
        ) : (
          <div 
            className="flex items-center gap-4 w-full max-w-md bg-white border border-slate-200 rounded-xl p-4 shadow-md animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevenir abrir el explorador al hacer clic dentro de la tarjeta de archivo cargado
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0">
              <Icon name="picture_as_pdf" filled={true} className="text-2xl" />
            </div>
            <div className="flex-grow min-w-0 text-left">
              <p className="font-body font-bold text-on-surface text-sm truncate">{file.name}</p>
              <p className="font-body text-xs text-on-surface-variant">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Icon name="close" className="text-lg" />
            </button>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-semibold text-left">{error}</span>}
    </div>
  );
};

export default FileUploadZone;
