import React from 'react';
import { DisciplineFormFields } from './DisciplineFormFields';

export const EditDisciplineFormFields = (props) => (
  <DisciplineFormFields {...props} isEdit={true} idPrefix="edit-disc" />
);

export default EditDisciplineFormFields;
