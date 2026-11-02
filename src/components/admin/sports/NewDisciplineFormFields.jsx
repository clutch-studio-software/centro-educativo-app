import React from 'react';
import { DisciplineFormFields } from './DisciplineFormFields';

export const NewDisciplineFormFields = (props) => (
  <DisciplineFormFields {...props} isEdit={false} idPrefix="new-disc" />
);

export default NewDisciplineFormFields;
