import React from "react";

export const LoadingSpinner = ({ height = '4', width = '4', otherStyle }) => (
    <span className={`h-${height} w-${width} animate-spin rounded-full border-2 border-white border-t-transparent ${otherStyle}`} />
);

export default LoadingSpinner;